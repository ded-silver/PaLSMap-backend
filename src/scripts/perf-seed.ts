/* eslint-disable no-console */
import { PrismaClient, NodeType } from '@prisma/client'

const prisma = new PrismaClient()

const TEST_COUNTRY_NAME = 'Perf Test Country'
const TEST_AREAS = [
	{ name: 'Perf Area 100', nodeCount: 100 },
	{ name: 'Perf Area 500', nodeCount: 500 },
	{ name: 'Perf Area 1000', nodeCount: 1000 }
]

const STEP_SIZE = 150 // Шаг между нодами в пикселях

function calculatePosition(
	index: number,
	totalNodes: number
): { x: number; y: number } {
	const columns = Math.ceil(Math.sqrt(totalNodes))
	const row = Math.floor(index / columns)
	const col = index % columns

	return {
		x: col * STEP_SIZE,
		y: row * STEP_SIZE
	}
}

async function main() {
	console.log('Creating performance test data...')

	try {
		let testCountry = await prisma.country.findFirst({
			where: { name: TEST_COUNTRY_NAME }
		})

		if (!testCountry) {
			testCountry = await prisma.country.create({
				data: {
					name: TEST_COUNTRY_NAME
				}
			})
			console.log(`✓ Created country: ${testCountry.name}`)
		} else {
			console.log(`✓ Found existing country: ${testCountry.name}`)
		}

		const existingAreas = await prisma.pathArea.findMany({
			where: {
				countryId: testCountry.id,
				name: {
					in: TEST_AREAS.map(area => area.name)
				}
			},
			include: {
				nodes: true
			}
		})

		if (existingAreas.length > 0) {
			console.log(`\nRemoving ${existingAreas.length} existing test areas...`)
			for (const area of existingAreas) {
				console.log(
					`  - Removing area "${area.name}" with ${area.nodes.length} nodes`
				)
				if (area.nodes.length > 0) {
					const nodeIds = area.nodes.map(n => n.id)
					// Удаляем edges, связанные с нодами этой области
					await prisma.edge.deleteMany({
						where: {
							OR: [{ source: { in: nodeIds } }, { target: { in: nodeIds } }]
						}
					})
					// Удаляем ноды
					await prisma.node.deleteMany({
						where: { pathAreaId: area.id }
					})
				}
				await prisma.pathArea.delete({
					where: { id: area.id }
				})
			}
			console.log('✓ Old test data removed')
		}

		for (const areaConfig of TEST_AREAS) {
			console.log(`\nCreating area: ${areaConfig.name}...`)

			const pathArea = await prisma.pathArea.create({
				data: {
					name: areaConfig.name,
					countryId: testCountry.id
				}
			})

			console.log(`  ✓ Created area: ${pathArea.name}`)

			const nodes = []
			for (let i = 0; i < areaConfig.nodeCount; i++) {
				const position = calculatePosition(i, areaConfig.nodeCount)
				const label = `OPS-${i + 1}`

				const handlers = [
					{
						id: 'source',
						type: 'source',
						position: 'right'
					},
					{
						id: 'target',
						type: 'target',
						position: 'left'
					}
				]

				const node = await prisma.node.create({
					data: {
						type: NodeType.OPS,
						position: position,
						pathAreaId: pathArea.id,
						data: {
							create: {
								label: label,
								handlers: handlers,
								locked: false
							}
						}
					}
				})

				nodes.push(node)
			}

			console.log(
				`  ✓ Created ${nodes.length} nodes in area "${pathArea.name}"`
			)

			const edges = []
			for (let i = 0; i < nodes.length - 1; i++) {
				const sourceNode = nodes[i]
				const targetNode = nodes[i + 1]

				const edge = await prisma.edge.create({
					data: {
						source: sourceNode.id,
						target: targetNode.id,
						sourceHandle: 'source',
						targetHandle: 'target',
						type: 'straight',
						style: {
							strokeWidth: 2,
							stroke: '#000000'
						}
					}
				})

				edges.push(edge)
			}

			console.log(
				`  ✓ Created ${edges.length} edges in area "${pathArea.name}"`
			)
		}

		console.log('\n✓ Done! Performance test data created successfully.')
		console.log(`\nSummary:`)
		console.log(`  - Country: ${TEST_COUNTRY_NAME}`)
		for (const areaConfig of TEST_AREAS) {
			console.log(`  - ${areaConfig.name}: ${areaConfig.nodeCount} nodes`)
		}
	} catch (error) {
		console.error('Error creating performance test data:', error)
		throw error
	}
}

main()
	.catch(e => {
		console.error('Error:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

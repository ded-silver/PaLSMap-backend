import {
	Injectable,
	NotFoundException,
	BadRequestException,
	Logger
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateMapVersionDto, MapVersionDto } from './map-version.dto'
import { NodeHistoryService } from 'src/node-history/node-history.service'
import { EntityType, ActionType } from 'src/node-history/node-history.dto'

@Injectable()
export class MapVersionService {
	private readonly logger = new Logger(MapVersionService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly nodeHistoryService: NodeHistoryService
	) {}

	async create(
		userId: string,
		dto: CreateMapVersionDto
	): Promise<MapVersionDto> {
		const pathArea = await this.prisma.pathArea.findUnique({
			where: { id: dto.pathAreaId }
		})

		if (!pathArea) {
			throw new NotFoundException(
				`PathArea with ID ${dto.pathAreaId} not found`
			)
		}

		if (!dto.name || dto.name.trim() === '') {
			throw new BadRequestException('Version name is required')
		}

		const nodes = await this.prisma.node.findMany({
			where: { pathAreaId: dto.pathAreaId },
			include: {
				data: {
					include: {
						tableData: {
							orderBy: { order: 'asc' }
						}
					}
				}
			}
		})

		const nodeIds = nodes.map(n => n.id)

		const edges = await this.prisma.edge.findMany({
			where: {
				AND: [{ source: { in: nodeIds } }, { target: { in: nodeIds } }]
			}
		})

		const snapshot = {
			nodes: nodes.map(node => ({
				id: node.id,
				type: node.type,
				position: node.position,
				measured: node.measured,
				parentId: node.parentId,
				data: node.data
					? {
							id: node.data.id,
							label: node.data.label,
							handlers: node.data.handlers,
							locked: node.data.locked,
							visualState: node.data.visualState
						}
					: null
			})),
			edges: edges.map(edge => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				sourceHandle: edge.sourceHandle,
				targetHandle: edge.targetHandle,
				type: edge.type,
				style: edge.style
			})),
			tableData: nodes
				.filter(node => node.data)
				.flatMap(node =>
					node.data.tableData.map(tableRow => ({
						nodeDataId: node.data.id,
						protectionName: tableRow.protectionName,
						excerpt: tableRow.excerpt,
						source: tableRow.source,
						triggeringAlgorithm: tableRow.triggeringAlgorithm,
						triggeringConditions: tableRow.triggeringConditions,
						order: tableRow.order
					}))
				)
		}

		const version = await this.prisma.mapVersion.create({
			data: {
				pathAreaId: dto.pathAreaId,
				name: dto.name,
				description: dto.description,
				createdById: userId,
				snapshot: snapshot as any
			},
			include: {
				createdBy: {
					select: {
						id: true,
						email: true,
						name: true
					}
				}
			}
		})

		return {
			id: version.id,
			pathAreaId: version.pathAreaId,
			name: version.name,
			description: version.description,
			createdAt: version.createdAt,
			createdBy: version.createdBy,
			snapshot: version.snapshot as any,
			nodeCount: snapshot.nodes.length
		}
	}

	async findByPathArea(pathAreaId: string): Promise<MapVersionDto[]> {
		const versions = await this.prisma.mapVersion.findMany({
			where: { pathAreaId },
			include: {
				createdBy: {
					select: {
						id: true,
						email: true,
						name: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return versions.map(version => {
			const snapshot = version.snapshot as any
			return {
				id: version.id,
				pathAreaId: version.pathAreaId,
				name: version.name,
				description: version.description,
				createdAt: version.createdAt,
				createdBy: version.createdBy,
				snapshot: snapshot,
				nodeCount: snapshot?.nodes?.length || 0
			}
		})
	}

	async findOne(versionId: string): Promise<MapVersionDto> {
		const version = await this.prisma.mapVersion.findUnique({
			where: { id: versionId },
			include: {
				createdBy: {
					select: {
						id: true,
						email: true,
						name: true
					}
				}
			}
		})

		if (!version) {
			throw new NotFoundException(`MapVersion with ID ${versionId} not found`)
		}

		const snapshot = version.snapshot as any
		return {
			id: version.id,
			pathAreaId: version.pathAreaId,
			name: version.name,
			description: version.description,
			createdAt: version.createdAt,
			createdBy: version.createdBy,
			snapshot: snapshot,
			nodeCount: snapshot?.nodes?.length || 0
		}
	}

	async restore(userId: string, versionId: string): Promise<void> {
		const version = await this.prisma.mapVersion.findUnique({
			where: { id: versionId },
			include: {
				pathArea: true
			}
		})

		if (!version) {
			throw new NotFoundException(`MapVersion with ID ${versionId} not found`)
		}

		const snapshot = version.snapshot as any
		const pathAreaId = version.pathAreaId

		const existingNodes = await this.prisma.node.findMany({
			where: { pathAreaId },
			select: { id: true }
		})

		const existingNodeIds = existingNodes.map(n => n.id)

		await this.prisma.edge.deleteMany({
			where: {
				OR: [
					{ source: { in: existingNodeIds } },
					{ target: { in: existingNodeIds } }
				]
			}
		})

		await this.prisma.node.deleteMany({
			where: { pathAreaId }
		})

		const nodeIdMapping = new Map<string, string>()
		const nodeDataIdMapping = new Map<string, string>()

		if (snapshot.nodes && Array.isArray(snapshot.nodes)) {
			for (const nodeSnapshot of snapshot.nodes) {
				if (!nodeSnapshot.data) {
					continue
				}

				const newNode = await this.prisma.node.create({
					data: {
						type: nodeSnapshot.type,
						position: nodeSnapshot.position,
						measured: nodeSnapshot.measured,
						pathAreaId: pathAreaId,
						data: {
							create: {
								label: nodeSnapshot.data.label,
								handlers: nodeSnapshot.data.handlers,
								locked: nodeSnapshot.data.locked ?? false,
								visualState: nodeSnapshot.data.visualState
							}
						}
					},
					include: {
						data: true
					}
				})

				nodeIdMapping.set(nodeSnapshot.id, newNode.id)
				if (newNode.data && nodeSnapshot.data.id) {
					nodeDataIdMapping.set(nodeSnapshot.data.id, newNode.data.id)
				}
			}

			for (const nodeSnapshot of snapshot.nodes) {
				if (!nodeSnapshot.parentId) {
					continue
				}

				const newParentId = nodeIdMapping.get(nodeSnapshot.parentId)
				const newNodeId = nodeIdMapping.get(nodeSnapshot.id)

				if (newParentId && newNodeId) {
					await this.prisma.node.update({
						where: { id: newNodeId },
						data: { parentId: newParentId }
					})
				}
			}

			if (snapshot.tableData && Array.isArray(snapshot.tableData)) {
				for (const tableRow of snapshot.tableData) {
					const newNodeDataId = nodeDataIdMapping.get(tableRow.nodeDataId)

					if (newNodeDataId) {
						await this.prisma.tableData.create({
							data: {
								nodeDataId: newNodeDataId,
								protectionName: tableRow.protectionName,
								excerpt: tableRow.excerpt,
								source: tableRow.source,
								triggeringAlgorithm: tableRow.triggeringAlgorithm,
								triggeringConditions: tableRow.triggeringConditions,
								order: tableRow.order
							}
						})
					}
				}
			}
		}

		if (snapshot.edges && Array.isArray(snapshot.edges)) {
			for (const edgeSnapshot of snapshot.edges) {
				const newSourceId = nodeIdMapping.get(edgeSnapshot.source)
				const newTargetId = nodeIdMapping.get(edgeSnapshot.target)

				if (newSourceId && newTargetId) {
					await this.prisma.edge.create({
						data: {
							source: newSourceId,
							target: newTargetId,
							sourceHandle: edgeSnapshot.sourceHandle,
							targetHandle: edgeSnapshot.targetHandle,
							type: edgeSnapshot.type || 'straight',
							style: edgeSnapshot.style || {
								strokeWidth: 1,
								stroke: 'black'
							}
						}
					})
				}
			}
		}

		try {
			await this.nodeHistoryService.create(userId, {
				entityType: EntityType.NODE,
				entityId: pathAreaId,
				actionType: ActionType.RESTORE_VERSION,
				changes: {
					before: null,
					after: {
						versionId: version.id,
						versionName: version.name
					}
				},
				description: `Восстановлена версия: ${version.name}`
			})
		} catch (error) {
			this.logger.error('Error logging version restore:', error)
		}
	}

	async delete(versionId: string): Promise<void> {
		const version = await this.prisma.mapVersion.findUnique({
			where: { id: versionId }
		})

		if (!version) {
			throw new NotFoundException(`MapVersion with ID ${versionId} not found`)
		}

		await this.prisma.mapVersion.delete({
			where: { id: versionId }
		})
	}
}

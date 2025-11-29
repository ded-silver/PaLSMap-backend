import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateEdgeDto } from './edge.dto'
import { NodeHistoryService } from 'src/node-history/node-history.service'
import { EntityType, ActionType } from 'src/node-history/node-history.dto'

@Injectable()
export class EdgeService {
	private readonly logger = new Logger(EdgeService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly nodeHistoryService: NodeHistoryService
	) {}

	async create(dto: CreateEdgeDto, userId?: string) {
		const edge = await this.prisma.edge.create({
			data: {
				...dto,
				type: dto.type || 'straight',
				style: dto.style || {
					strokeWidth: 1,
					stroke: 'black'
				}
			}
		})

		if (userId) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.EDGE,
					entityId: edge.id,
					actionType: ActionType.CREATE,
					changes: {
						after: {
							source: edge.source,
							target: edge.target,
							sourceHandle: edge.sourceHandle,
							targetHandle: edge.targetHandle,
							type: edge.type,
							style: edge.style
						}
					},
					description: `Создана связь между нодами ${edge.source} и ${edge.target}`
				})
			} catch (error) {
				this.logger.error('Error logging edge creation:', error)
			}
		}

		return edge
	}

	async findAll(pathAreaId?: string) {
		if (!pathAreaId) {
			return this.prisma.edge.findMany()
		}

		const nodes = await this.prisma.node.findMany({
			where: { pathAreaId },
			select: { id: true }
		})

		const nodeIds = nodes.map(n => n.id)

		if (nodeIds.length === 0) {
			return []
		}

		const edges = await this.prisma.edge.findMany({
			where: {
				source: { in: nodeIds },
				target: { in: nodeIds }
			}
		})

		return edges
	}

	async findById(id: string) {
		const edge = await this.prisma.edge.findUnique({ where: { id } })
		if (!edge) throw new NotFoundException('Edge not found')
		return edge
	}

	async delete(id: string, userId?: string) {
		const before = await this.prisma.edge.findUnique({
			where: { id }
		})

		if (!before) {
			throw new NotFoundException('Edge not found')
		}

		const deleted = await this.prisma.edge.delete({ where: { id } })

		if (userId) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.EDGE,
					entityId: id,
					actionType: ActionType.DELETE,
					changes: {
						before: {
							source: before.source,
							target: before.target,
							sourceHandle: before.sourceHandle,
							targetHandle: before.targetHandle,
							type: before.type,
							style: before.style
						}
					},
					description: `Удалена связь между нодами ${before.source} и ${before.target}`
				})
			} catch (error) {
				this.logger.error('Error logging edge deletion:', error)
			}
		}

		return deleted
	}

	async findByCountry(countryId: string) {
		const pathAreas = await this.prisma.pathArea.findMany({
			where: { countryId },
			select: { id: true }
		})

		const pathAreaIds = pathAreas.map(pa => pa.id)

		if (pathAreaIds.length === 0) {
			return []
		}

		const nodes = await this.prisma.node.findMany({
			where: {
				pathAreaId: {
					in: pathAreaIds
				}
			},
			select: { id: true }
		})

		const nodeIds = nodes.map(n => n.id)

		if (nodeIds.length === 0) {
			return []
		}

		return this.prisma.edge.findMany({
			where: {
				OR: [{ source: { in: nodeIds } }, { target: { in: nodeIds } }]
			}
		})
	}

	async isInterArea(edge: {
		source: string
		target: string
	}): Promise<boolean> {
		const sourceNode = await this.prisma.node.findUnique({
			where: { id: edge.source },
			select: { pathAreaId: true }
		})

		const targetNode = await this.prisma.node.findUnique({
			where: { id: edge.target },
			select: { pathAreaId: true }
		})

		if (!sourceNode || !targetNode) {
			return true
		}

		if (!sourceNode.pathAreaId || !targetNode.pathAreaId) {
			return false
		}

		return sourceNode.pathAreaId !== targetNode.pathAreaId
	}
}

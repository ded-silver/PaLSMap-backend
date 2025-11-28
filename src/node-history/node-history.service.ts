import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import {
	CreateNodeHistoryDto,
	NodeHistoryDto,
	HistoryFiltersDto,
	EntityType
} from './node-history.dto'

@Injectable()
export class NodeHistoryService {
	private readonly logger = new Logger(NodeHistoryService.name)

	constructor(private readonly prisma: PrismaService) {}

	async create(
		userId: string,
		historyDto: CreateNodeHistoryDto
	): Promise<NodeHistoryDto> {
		try {
			const history = await this.prisma.nodeHistory.create({
				data: {
					userId,
					entityType: historyDto.entityType,
					entityId: historyDto.entityId,
					actionType: historyDto.actionType,
					changes: historyDto.changes,
					description: historyDto.description
				},
				include: {
					user: {
						select: {
							id: true,
							email: true,
							name: true
						}
					}
				}
			})

			return history as NodeHistoryDto
		} catch (error) {
			this.logger.error('Error creating node history:', error)
			return null as any
		}
	}

	async findByEntity(
		entityType: EntityType,
		entityId: string
	): Promise<NodeHistoryDto[]> {
		return this.prisma.nodeHistory.findMany({
			where: {
				entityType,
				entityId
			},
			include: {
				user: {
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
		}) as Promise<NodeHistoryDto[]>
	}

	async findByNode(nodeId: string): Promise<NodeHistoryDto[]> {
		const nodeHistory = await this.findByEntity(EntityType.NODE, nodeId)

		const edges = await this.prisma.edge.findMany({
			where: {
				OR: [{ source: nodeId }, { target: nodeId }]
			},
			select: { id: true }
		})

		const edgeHistoryPromises = edges.map(edge =>
			this.findByEntity(EntityType.EDGE, edge.id)
		)
		const edgeHistories = (await Promise.all(edgeHistoryPromises)).flat()

		const nodeData = await this.prisma.nodeData.findUnique({
			where: { nodeId },
			select: { id: true }
		})

		let tableDataHistory: NodeHistoryDto[] = []
		if (nodeData) {
			const tableData = await this.prisma.tableData.findMany({
				where: { nodeDataId: nodeData.id },
				select: { id: true }
			})

			const tableDataHistoryPromises = tableData.map(td =>
				this.findByEntity(EntityType.TABLE_DATA, td.id)
			)
			tableDataHistory = (
				await Promise.all(tableDataHistoryPromises)
			).flat() as NodeHistoryDto[]
		}

		const allHistory = [
			...nodeHistory,
			...edgeHistories,
			...tableDataHistory
		].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)

		return allHistory
	}

	async findByUser(userId: string, limit?: number): Promise<NodeHistoryDto[]> {
		return this.prisma.nodeHistory.findMany({
			where: {
				userId
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			},
			take: limit
		}) as Promise<NodeHistoryDto[]>
	}

	async findAll(filters?: HistoryFiltersDto): Promise<{
		data: NodeHistoryDto[]
		total: number
		page: number
		limit: number
	}> {
		const page = filters?.page ? parseInt(filters.page, 10) : 1
		const limit = filters?.limit ? parseInt(filters.limit, 10) : 50

		if (page < 1) {
			throw new BadRequestException('Page must be greater than 0')
		}
		if (limit < 1 || limit > 100) {
			throw new BadRequestException('Limit must be between 1 and 100')
		}

		const skip = (page - 1) * limit

		const where: any = {}

		if (filters?.entityType) {
			where.entityType = filters.entityType
		}

		if (filters?.actionType) {
			where.actionType = filters.actionType
		}

		if (filters?.userId) {
			where.userId = filters.userId
		}

		if (filters?.dateFrom || filters?.dateTo) {
			where.createdAt = {}
			if (filters.dateFrom) {
				where.createdAt.gte = new Date(filters.dateFrom)
			}
			if (filters.dateTo) {
				where.createdAt.lte = new Date(filters.dateTo)
			}
		}

		if (filters?.nodeId) {
			const nodeHistory = await this.findByNode(filters.nodeId)
			return {
				data: nodeHistory.slice(skip, skip + limit),
				total: nodeHistory.length,
				page,
				limit
			}
		}

		const [data, total] = await Promise.all([
			this.prisma.nodeHistory.findMany({
				where,
				include: {
					user: {
						select: {
							id: true,
							email: true,
							name: true
						}
					}
				},
				orderBy: {
					createdAt: 'desc'
				},
				skip,
				take: limit
			}),
			this.prisma.nodeHistory.count({ where })
		])

		return {
			data: data as NodeHistoryDto[],
			total,
			page,
			limit
		}
	}
}

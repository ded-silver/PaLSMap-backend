import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { NodeDataDto, NodeDto } from './node.dto'
import { NodeHistoryService } from 'src/node-history/node-history.service'
import { EntityType, ActionType } from 'src/node-history/node-history.dto'

interface MoveDebounceData {
	userId: string
	nodeId: string
	before: any
	after: any
	label: string
}

@Injectable()
export class NodeService {
	private readonly logger = new Logger(NodeService.name)
	private moveDebounceTimers = new Map<string, NodeJS.Timeout>()
	private moveDebounceData = new Map<string, MoveDebounceData>()
	private readonly MOVE_DEBOUNCE_DELAY = 1000

	constructor(
		private readonly prisma: PrismaService,
		private readonly nodeHistoryService: NodeHistoryService
	) {}

	async findAll(pathAreaId?: string) {
		const where: any = { parentId: null }

		if (pathAreaId) {
			where.pathAreaId = pathAreaId
		}

		return this.prisma.node.findMany({
			where,
			include: {
				data: true,
				children: {
					include: {
						data: true
					}
				},
				parent: true,
				pathArea: {
					select: {
						id: true,
						name: true,
						countryId: true
					}
				}
			}
		})
	}

	async findById(id: string) {
		const node = await this.prisma.node.findUnique({
			where: { id },
			include: {
				data: true
			}
		})

		if (!node) {
			throw new NotFoundException(`Node with ID ${id} not found`)
		}

		return node
	}

	async create(dto: NodeDto, userId?: string) {
		const visualStateJson: Record<string, any> | null = dto.visualState
			? {
					...(dto.visualState.status !== undefined && {
						status: dto.visualState.status
					}),
					...(dto.visualState.borderColor !== undefined && {
						borderColor: dto.visualState.borderColor
					}),
					...(dto.visualState.borderWidth !== undefined && {
						borderWidth: dto.visualState.borderWidth
					}),
					...(dto.visualState.backgroundColor !== undefined && {
						backgroundColor: dto.visualState.backgroundColor
					}),
					...(dto.visualState.opacity !== undefined && {
						opacity: dto.visualState.opacity
					})
				}
			: null

		if (dto.pathAreaId) {
			const pathArea = await this.prisma.pathArea.findUnique({
				where: { id: dto.pathAreaId }
			})
			if (!pathArea) {
				throw new NotFoundException(
					`PathArea with ID ${dto.pathAreaId} not found`
				)
			}
		}

		const node = await this.prisma.node.create({
			data: {
				type: dto.type,
				position: dto.position,
				parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
				pathArea: dto.pathAreaId
					? { connect: { id: dto.pathAreaId } }
					: undefined,
				data: {
					create: {
						label: dto.data.label,
						handlers: dto.data.handlers,
						locked: dto.locked ?? false,
						visualState: visualStateJson
					}
				}
			},
			include: {
				parent: true,
				children: true,
				data: true,
				pathArea: {
					select: {
						id: true,
						name: true,
						countryId: true
					}
				}
			}
		})

		if (userId) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.NODE,
					entityId: node.id,
					actionType: ActionType.CREATE,
					changes: {
						after: {
							type: node.type,
							position: node.position,
							label: node.data?.label,
							handlers: node.data?.handlers,
							locked: node.data?.locked,
							visualState: node.data?.visualState,
							parentId: node.parentId,
							pathAreaId: node.pathAreaId
						}
					},
					description: `Создана нода "${node.data?.label}"`
				})
			} catch (error) {
				this.logger.error('Error logging node creation:', error)
			}
		}

		return node
	}

	async getNodeData(id: string) {
		const nodeData = await this.prisma.nodeData.findFirst({
			where: {
				nodeId: id
			}
		})
		const data = await this.prisma.tableData.findMany({
			where: {
				nodeDataId: nodeData.id
			},
			orderBy: { order: 'asc' }
		})
		if (data.length === 0) {
			return []
		}
		return data
	}

	async createNodeData({
		dto,
		id,
		userId
	}: {
		dto: NodeDataDto
		id: string
		userId?: string
	}) {
		const nodeData = await this.prisma.nodeData.findUnique({
			where: {
				nodeId: id
			}
		})

		const dataTable = await this.prisma.tableData.create({
			data: {
				...dto,
				nodeDataId: nodeData.id
			}
		})

		if (userId) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.TABLE_DATA,
					entityId: dataTable.id,
					actionType: ActionType.CREATE,
					changes: {
						after: {
							protectionName: dataTable.protectionName,
							excerpt: dataTable.excerpt,
							source: dataTable.source,
							triggeringAlgorithm: dataTable.triggeringAlgorithm,
							triggeringConditions: dataTable.triggeringConditions,
							order: dataTable.order
						}
					},
					description: `Добавлена запись в таблицу: "${dataTable.protectionName}"`
				})
			} catch (error) {
				this.logger.error('Error logging table data creation:', error)
			}
		}

		return dataTable
	}

	async updateNodeData({
		dto,
		id,
		userId
	}: {
		dto: NodeDataDto
		id: string
		userId?: string
	}) {
		const before = await this.prisma.tableData.findUnique({
			where: { id }
		})

		const after = await this.prisma.tableData.update({
			where: {
				id
			},
			data: dto
		})

		if (userId && before) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.TABLE_DATA,
					entityId: id,
					actionType: ActionType.UPDATE,
					changes: {
						before: {
							protectionName: before.protectionName,
							excerpt: before.excerpt,
							source: before.source,
							triggeringAlgorithm: before.triggeringAlgorithm,
							triggeringConditions: before.triggeringConditions,
							order: before.order
						},
						after: {
							protectionName: after.protectionName,
							excerpt: after.excerpt,
							source: after.source,
							triggeringAlgorithm: after.triggeringAlgorithm,
							triggeringConditions: after.triggeringConditions,
							order: after.order
						}
					},
					description: `Обновлена запись в таблице: "${after.protectionName}"`
				})
			} catch (error) {
				this.logger.error('Error logging table data update:', error)
			}
		}

		return after
	}

	async deleteNodeData(id: string, userId?: string) {
		const before = await this.prisma.tableData.findUnique({
			where: { id }
		})

		const deleted = await this.prisma.tableData.delete({
			where: {
				id: id
			}
		})

		if (userId && before) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.TABLE_DATA,
					entityId: id,
					actionType: ActionType.DELETE,
					changes: {
						before: {
							protectionName: before.protectionName,
							excerpt: before.excerpt,
							source: before.source,
							triggeringAlgorithm: before.triggeringAlgorithm,
							triggeringConditions: before.triggeringConditions,
							order: before.order
						}
					},
					description: `Удалена запись из таблицы: "${before.protectionName}"`
				})
			} catch (error) {
				this.logger.error('Error logging table data deletion:', error)
			}
		}

		return deleted
	}

	async update(id: string, dto: NodeDto, userId?: string) {
		const node = await this.prisma.node.findUnique({
			where: { id },
			include: {
				data: true,
				pathArea: {
					select: {
						id: true,
						name: true,
						countryId: true
					}
				}
			}
		})
		if (!node) {
			throw new NotFoundException(`Node with ID ${id} not found`)
		}

		const before = {
			type: node.type,
			position: node.position,
			parentId: node.parentId,
			pathAreaId: node.pathAreaId,
			label: node.data?.label,
			handlers: node.data?.handlers,
			locked: node.data?.locked,
			visualState: node.data?.visualState
		}

		const nodeDataUpdate: any = {
			label: dto.data.label,
			handlers: dto.data.handlers
		}

		if (dto.locked !== undefined) {
			nodeDataUpdate.locked = dto.locked
		}

		if (dto.visualState !== undefined) {
			nodeDataUpdate.visualState = dto.visualState
				? ({
						...(dto.visualState.status !== undefined && {
							status: dto.visualState.status
						}),
						...(dto.visualState.borderColor !== undefined && {
							borderColor: dto.visualState.borderColor
						}),
						...(dto.visualState.borderWidth !== undefined && {
							borderWidth: dto.visualState.borderWidth
						}),
						...(dto.visualState.backgroundColor !== undefined && {
							backgroundColor: dto.visualState.backgroundColor
						}),
						...(dto.visualState.opacity !== undefined && {
							opacity: dto.visualState.opacity
						})
					} as Record<string, any>)
				: null
		}

		if (dto.pathAreaId && dto.pathAreaId !== node.pathAreaId) {
			const pathArea = await this.prisma.pathArea.findUnique({
				where: { id: dto.pathAreaId }
			})
			if (!pathArea) {
				throw new NotFoundException(
					`PathArea with ID ${dto.pathAreaId} not found`
				)
			}
		}

		const updated = await this.prisma.node.update({
			where: { id },
			data: {
				type: dto.type,
				position: dto.position,
				measured: dto.measured,
				data: {
					update: nodeDataUpdate
				},
				parent: dto.parentId
					? { connect: { id: dto.parentId } }
					: { disconnect: true },
				pathArea:
					dto.pathAreaId !== undefined
						? dto.pathAreaId
							? { connect: { id: dto.pathAreaId } }
							: { disconnect: true }
						: undefined
			},
			include: {
				data: true,
				pathArea: {
					select: {
						id: true,
						name: true,
						countryId: true
					}
				}
			}
		})

		if (userId) {
			try {
				const after = {
					type: updated.type,
					position: updated.position,
					parentId: updated.parentId,
					pathAreaId: updated.pathAreaId,
					label: updated.data?.label,
					handlers: updated.data?.handlers,
					locked: updated.data?.locked,
					visualState: updated.data?.visualState
				}

				if (before.pathAreaId !== after.pathAreaId) {
					const oldAreaName = node.pathArea?.name || 'Без области'
					const newAreaName = updated.pathArea?.name || 'Без области'

					await this.nodeHistoryService.create(userId, {
						entityType: EntityType.NODE,
						entityId: id,
						actionType: ActionType.AREA_CHANGE,
						changes: {
							before: {
								pathAreaId: before.pathAreaId,
								pathAreaName: oldAreaName
							},
							after: {
								pathAreaId: after.pathAreaId,
								pathAreaName: newAreaName
							}
						},
						description: `Изменена область ноды "${updated.data?.label}" с "${oldAreaName}" на "${newAreaName}"`
					})
				}

				let actionType = ActionType.UPDATE
				const changes: any = { before: {}, after: {} }
				let description = `Обновлена нода "${updated.data?.label}"`

				const isPositionChanged =
					JSON.stringify(before.position) !== JSON.stringify(after.position)

				if (isPositionChanged) {
					const debounceKey = `move_${id}`

					if (this.moveDebounceTimers.has(debounceKey)) {
						clearTimeout(this.moveDebounceTimers.get(debounceKey)!)
					}

					this.moveDebounceData.set(debounceKey, {
						userId,
						nodeId: id,
						before: { position: before.position },
						after: { position: after.position },
						label: updated.data?.label || ''
					})

					const timer = setTimeout(async () => {
						const data = this.moveDebounceData.get(debounceKey)
						if (data) {
							try {
								await this.nodeHistoryService.create(data.userId, {
									entityType: EntityType.NODE,
									entityId: data.nodeId,
									actionType: ActionType.MOVE,
									changes: {
										before: data.before,
										after: data.after
									},
									description: `Перемещена нода "${data.label}"`
								})
							} catch (error) {
								this.logger.error('Error logging node move:', error)
							}
							this.moveDebounceData.delete(debounceKey)
						}
						this.moveDebounceTimers.delete(debounceKey)
					}, this.MOVE_DEBOUNCE_DELAY)

					this.moveDebounceTimers.set(debounceKey, timer)

					if (
						before.locked === after.locked &&
						JSON.stringify(before.visualState) ===
							JSON.stringify(after.visualState) &&
						before.parentId === after.parentId &&
						before.label === after.label &&
						before.type === after.type &&
						JSON.stringify(before.handlers) === JSON.stringify(after.handlers)
					) {
						return updated
					}
				}

				if (before.locked !== after.locked) {
					actionType = after.locked ? ActionType.LOCK : ActionType.UNLOCK
					changes.before.locked = before.locked
					changes.after.locked = after.locked
					description = `${after.locked ? 'Заблокирована' : 'Разблокирована'} нода "${updated.data?.label}"`
				}

				if (
					JSON.stringify(before.visualState) !==
					JSON.stringify(after.visualState)
				) {
					if (actionType === ActionType.UPDATE) {
						actionType = ActionType.VISUAL_STATE_CHANGE
					}
					changes.before.visualState = before.visualState
					changes.after.visualState = after.visualState
					if (actionType === ActionType.VISUAL_STATE_CHANGE) {
						description = `Изменены визуальные настройки ноды "${updated.data?.label}"`
					}
				}

				if (before.parentId !== after.parentId) {
					if (actionType === ActionType.UPDATE) {
						actionType = ActionType.PARENT_CHANGE
					}
					changes.before.parentId = before.parentId
					changes.after.parentId = after.parentId
					if (actionType === ActionType.PARENT_CHANGE) {
						description = `Изменен родитель ноды "${updated.data?.label}"`
					}
				}

				if (before.label !== after.label) {
					if (actionType === ActionType.UPDATE) {
						actionType = ActionType.LABEL_CHANGE
					}
					changes.before.label = before.label
					changes.after.label = after.label
					if (actionType === ActionType.LABEL_CHANGE) {
						description = `Изменено название ноды с "${before.label}" на "${after.label}"`
					}
				}

				if (before.type !== after.type) {
					if (actionType === ActionType.UPDATE) {
						actionType = ActionType.TYPE_CHANGE
					}
					changes.before.type = before.type
					changes.after.type = after.type
					if (actionType === ActionType.TYPE_CHANGE) {
						description = `Изменен тип ноды "${updated.data?.label}"`
					}
				}

				if (
					JSON.stringify(before.handlers) !== JSON.stringify(after.handlers)
				) {
					if (actionType === ActionType.UPDATE) {
						actionType = ActionType.HANDLERS_CHANGE
					}
					changes.before.handlers = before.handlers
					changes.after.handlers = after.handlers
					if (actionType === ActionType.HANDLERS_CHANGE) {
						description = `Изменены handlers ноды "${updated.data?.label}"`
					}
				}

				if (actionType === ActionType.UPDATE) {
					Object.keys(after).forEach(key => {
						if (
							before[key as keyof typeof before] !==
							after[key as keyof typeof after]
						) {
							changes.before[key] = before[key as keyof typeof before]
							changes.after[key] = after[key as keyof typeof after]
						}
					})
				}

				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.NODE,
					entityId: id,
					actionType,
					changes,
					description
				})
			} catch (error) {
				this.logger.error('Error logging node update:', error)
			}
		}

		return updated
	}

	async delete(id: string, userId?: string) {
		const node = await this.prisma.node.findUnique({
			where: { id },
			include: { data: true }
		})

		if (!node) {
			throw new NotFoundException(`Node with ID ${id} not found`)
		}

		const debounceKey = `move_${id}`
		if (this.moveDebounceTimers.has(debounceKey)) {
			clearTimeout(this.moveDebounceTimers.get(debounceKey)!)
			this.moveDebounceTimers.delete(debounceKey)
			this.moveDebounceData.delete(debounceKey)
		}

		const before = {
			type: node.type,
			position: node.position,
			parentId: node.parentId,
			label: node.data?.label,
			handlers: node.data?.handlers,
			locked: node.data?.locked,
			visualState: node.data?.visualState
		}

		const edges = await this.prisma.edge.deleteMany({
			where: { OR: [{ source: id }, { target: id }] }
		})
		const deletedNode = await this.prisma.node.delete({ where: { id } })

		if (userId) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.NODE,
					entityId: id,
					actionType: ActionType.DELETE,
					changes: {
						before
					},
					description: `Удалена нода "${before.label}"`
				})
			} catch (error) {
				this.logger.error('Error logging node deletion:', error)
			}
		}

		return {
			edges,
			deletedNode
		}
	}

	async findChildren(parentId: string) {
		return this.prisma.node.findMany({
			where: {
				parentId
			},
			include: {
				data: true
			}
		})
	}

	async findRootNodes() {
		return this.prisma.node.findMany({
			where: {
				parentId: null
			}
		})
	}

	async findByCountry(countryId: string) {
		const pathAreas = await this.prisma.pathArea.findMany({
			where: { countryId },
			select: { id: true }
		})

		const pathAreaIds = pathAreas.map(pa => pa.id)

		return this.prisma.node.findMany({
			where: {
				pathAreaId: {
					in: pathAreaIds
				}
			},
			include: {
				data: true,
				children: {
					include: {
						data: true
					}
				},
				parent: true,
				pathArea: {
					select: {
						id: true,
						name: true,
						countryId: true
					}
				}
			}
		})
	}
}

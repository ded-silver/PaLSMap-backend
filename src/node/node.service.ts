import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { NodeDataDto, NodeDto } from './node.dto'

// Декоратор @Injectable делает сервис доступным для внедрения зависимостей (DI)
@Injectable()
export class NodeService {
	// Внедрение PrismaService для доступа к базе данных
	constructor(private readonly prisma: PrismaService) {}

	// Метод для получения всех узлов, включая их детей и родителя
	async findAll() {
		return this.prisma.node.findMany({
			where: { parentId: null },
			include: {
				data: true,
				children: {
					include: {
						data: true
					}
				}, // подчинённые узлы
				parent: true // родительский узел
			}
		})
	}

	// Метод для поиска узла по ID, включая детей и родителя
	async findById(id: string) {
		const node = await this.prisma.node.findUnique({
			where: { id }
		})

		// Если узел не найден — выбрасывается исключение 404
		if (!node) {
			throw new NotFoundException(`Node with ID ${id} not found`)
		}

		return node
	}

	// Метод для создания нового узла
	async create(dto: NodeDto) {
		const node = await this.prisma.node.create({
			data: {
				type: dto.type,
				position: dto.position,
				parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
				data: {
					create: {
						label: dto.data.label,
						handlers: dto.data.handlers
					}
				}
			},
			include: {
				parent: true,
				children: true
			}
		})
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
			},orderBy: {order: 'asc'}
		})
		if (data.length === 0) {
			return []
		}
		return data
	}

	async createNodeData({ dto, id }: { dto: NodeDataDto; id: string }) {
		const nodeData = await this.prisma.nodeData.findUnique({
			where: {
				nodeId: id
			}
		})

		const dataTable = this.prisma.tableData.create({
			data: {
				...dto,
				nodeDataId: nodeData.id
			}
		})
		return dataTable
	}

	async updateNodeData({ dto, id }: { dto: NodeDataDto; id: string }) {
		return this.prisma.tableData.update({
			where: {
				id
			},
			data: dto
		})
	}

	async deleteNodeData(id: string) {
		return this.prisma.tableData.delete({
			where: {
				id: id
			}
		})
	}

	// Метод для обновления существующего узла
	async update(id: string, dto: NodeDto) {
		// Проверка существования узла перед обновлением
		const node = await this.prisma.node.findUnique({ where: { id } })
		if (!node) {
			throw new NotFoundException(`Node with ID ${id} not found`)
		}

		return this.prisma.node.update({
			where: { id },
			data: {
				type: dto.type,
				position: dto.position,
				data: {
					update: {
						label: dto.data.label,
						handlers: dto.data.handlers
					}
				},
				// Если указан parentId — установить нового родителя
				// Если null или не указан — удалить связь с родителем
				parent: dto.parentId
					? { connect: { id: dto.parentId } }
					: { disconnect: true }
			}
		})
	}

	// Метод для удаления узла по ID
	async delete(id: string) {
		// Предварительная проверка наличия узла
		const node = await this.prisma.node.findUnique({ where: { id } })

		if (!node) {
			throw new NotFoundException(`Node with ID ${id} not found`)
		}
		const edges = await this.prisma.edge.deleteMany({
			where: { OR: [{ source: id }, { target: id }] }
		})
		const deletedNode = await this.prisma.node.delete({ where: { id } })
		// Удаление узла
		return {
			edges,
			deletedNode
		}
	}

	// Метод для получения всех детей по ID родительского узла
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

	// Метод для получения всех корневых узлов (у которых нет родителя)
	async findRootNodes() {
		return this.prisma.node.findMany({
			where: {
				parentId: null
			}
		})
	}
}

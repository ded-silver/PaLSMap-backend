import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { NodeDataDto, NodeDto } from './node.dto'

@Injectable()
export class NodeService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll() {
		return this.prisma.node.findMany({
			where: { parentId: null },
			include: {
				data: true,
				children: {
					include: {
						data: true
					}
				},
				parent: true
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

	async create(dto: NodeDto) {
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

		const node = await this.prisma.node.create({
			data: {
				type: dto.type,
				position: dto.position,
				parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
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
				data: true
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
			},
			orderBy: { order: 'asc' }
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

	async update(id: string, dto: NodeDto) {
		const node = await this.prisma.node.findUnique({ where: { id } })
		if (!node) {
			throw new NotFoundException(`Node with ID ${id} not found`)
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

		return this.prisma.node.update({
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
					: { disconnect: true }
			},
			include: {
				data: true
			}
		})
	}

	async delete(id: string) {
		const node = await this.prisma.node.findUnique({ where: { id } })

		if (!node) {
			throw new NotFoundException(`Node with ID ${id} not found`)
		}
		const edges = await this.prisma.edge.deleteMany({
			where: { OR: [{ source: id }, { target: id }] }
		})
		const deletedNode = await this.prisma.node.delete({ where: { id } })
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
}

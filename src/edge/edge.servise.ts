import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateEdgeDto } from './edge.dto'

@Injectable()
export class EdgeService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateEdgeDto) {
		return this.prisma.edge.create({
			data: {
				...dto,
				type: dto.type || 'straight',
				style: dto.style || {
					strokeWidth: 1,
					stroke: 'black'
				}
			}
		})
	}

	async findAll() {
		return this.prisma.edge.findMany()
	}

	async findById(id: string) {
		const edge = await this.prisma.edge.findUnique({ where: { id } })
		if (!edge) throw new NotFoundException('Edge not found')
		return edge
	}

	async delete(id: string) {
		return this.prisma.edge.delete({ where: { id } })
	}
}

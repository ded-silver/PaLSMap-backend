import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { CreateEdgeDto } from './edge.dto'
import { EdgeService } from './edge.servise'
import { Admin } from 'src/auth/decorators/auth.decorator'

@Controller('edges')
export class EdgeController {
	constructor(private readonly edgeService: EdgeService) {}

	@Post()
	@Admin()
	async create(@Body() dto: CreateEdgeDto) {
		return this.edgeService.create(dto)
	}

	@Get()
	async findAll() {
		return this.edgeService.findAll()
	}

	@Get(':id')
	async findById(@Param('id') id: string) {
		return this.edgeService.findById(id)
	}

	@Delete(':id')
	@Admin()
	async delete(@Param('id') id: string) {
		return this.edgeService.delete(id)
	}
}

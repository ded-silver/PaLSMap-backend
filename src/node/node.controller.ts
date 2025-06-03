import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'

import { NodeService } from './node.service'
import { NodeDto } from './node.dto'

// Декоратор @Controller определяет базовый путь для всех маршрутов в этом контроллере
@Controller('nodes')
export class NodeController {
	// Внедрение зависимости NodeService для вызова бизнес-логики
	constructor(private readonly nodeService: NodeService) {}

	@Get()
	async findAll() {
		return this.nodeService.findAll()
	}

	@Get('/root')
	async findRoot() {
		return this.nodeService.findRootNodes()
	}

	@Get(':id')
	async findById(@Param('id') id: string) {
		return this.nodeService.findById(id)
	}

	@Get('children/:parentId')
	async findChildren(@Param('parentId') parentId: string) {
		return this.nodeService.findChildren(parentId)
	}

	@Post()
	async create(@Body() dto: NodeDto) {
		return this.nodeService.create(dto)
	}

	@Patch(':id')
	async update(@Param('id') id: string, @Body() dto: NodeDto) {
		return this.nodeService.update(id, dto)
	}

	@Delete(':id')
	async delete(@Param('id') id: string) {
		return this.nodeService.delete(id)
	}
}

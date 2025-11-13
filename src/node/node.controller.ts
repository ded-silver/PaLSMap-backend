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
import { NodeDataDto, NodeDto } from './node.dto'

@Controller('nodes')
export class NodeController {
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

	@Get('data/:parentId')
	async getNodeData(@Param('parentId') parentId: string) {
		return this.nodeService.getNodeData(parentId)
	}

	@Post('data/:id')
	async createNodeData(@Param('id') id: string, @Body() dto: NodeDataDto) {
		return this.nodeService.createNodeData({ id, dto })
	}

	@Delete('data/:id')
	async deleteNodeData(@Param('id') id: string) {
		return this.nodeService.deleteNodeData(id)
	}

	@Patch('data/:id')
	async updateNodeData(@Param('id') id: string, @Body() dto: NodeDataDto) {
		return this.nodeService.updateNodeData({ id, dto })
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

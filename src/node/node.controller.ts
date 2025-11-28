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
import { Admin } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'

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
	@Admin()
	async createNodeData(
		@Param('id') id: string,
		@Body() dto: NodeDataDto,
		@CurrentUser('id') userId: string
	) {
		return this.nodeService.createNodeData({ id, dto, userId })
	}

	@Delete('data/:id')
	@Admin()
	async deleteNodeData(
		@Param('id') id: string,
		@CurrentUser('id') userId: string
	) {
		return this.nodeService.deleteNodeData(id, userId)
	}

	@Patch('data/:id')
	@Admin()
	async updateNodeData(
		@Param('id') id: string,
		@Body() dto: NodeDataDto,
		@CurrentUser('id') userId: string
	) {
		return this.nodeService.updateNodeData({ id, dto, userId })
	}

	@Post()
	@Admin()
	async create(@Body() dto: NodeDto, @CurrentUser('id') userId: string) {
		return this.nodeService.create(dto, userId)
	}

	@Patch(':id')
	@Admin()
	async update(
		@Param('id') id: string,
		@Body() dto: NodeDto,
		@CurrentUser('id') userId: string
	) {
		return this.nodeService.update(id, dto, userId)
	}

	@Delete(':id')
	@Admin()
	async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
		return this.nodeService.delete(id, userId)
	}
}

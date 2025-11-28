import {
	Controller,
	Get,
	Query,
	Param,
	BadRequestException
} from '@nestjs/common'
import { NodeHistoryService } from './node-history.service'
import { HistoryFiltersDto, EntityType } from './node-history.dto'
import { Admin } from 'src/auth/decorators/auth.decorator'

@Controller('node-history')
export class NodeHistoryController {
	constructor(private readonly nodeHistoryService: NodeHistoryService) {}

	@Get()
	@Admin()
	async findAll(@Query() filters: HistoryFiltersDto) {
		return this.nodeHistoryService.findAll(filters)
	}

	@Get('node/:nodeId')
	@Admin()
	async findByNode(@Param('nodeId') nodeId: string) {
		return this.nodeHistoryService.findByNode(nodeId)
	}

	@Get('entity/:entityType/:entityId')
	@Admin()
	async findByEntity(
		@Param('entityType') entityType: EntityType,
		@Param('entityId') entityId: string
	) {
		return this.nodeHistoryService.findByEntity(entityType, entityId)
	}

	@Get('user/:userId')
	@Admin()
	async findByUser(
		@Param('userId') userId: string,
		@Query('limit') limit?: string
	) {
		const limitNum = limit ? parseInt(limit, 10) : undefined
		if (limitNum && (isNaN(limitNum) || limitNum < 1)) {
			throw new BadRequestException('Limit must be a positive number')
		}
		return this.nodeHistoryService.findByUser(userId, limitNum)
	}
}

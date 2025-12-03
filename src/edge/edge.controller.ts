import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query
} from '@nestjs/common'
import { CreateEdgeDto } from './edge.dto'
import { EdgeService } from './edge.servise'
import { Auth, Admin } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'

@Controller('edges')
export class EdgeController {
	constructor(private readonly edgeService: EdgeService) {}

	@Post()
	@Admin()
	async create(@Body() dto: CreateEdgeDto, @CurrentUser('id') userId: string) {
		return this.edgeService.create(dto, userId)
	}

	@Get()
	@Auth()
	async findAll(@Query('pathAreaId') pathAreaId?: string) {
		return this.edgeService.findAll(pathAreaId)
	}

	@Get('country/:countryId')
	@Auth()
	async findByCountry(@Param('countryId') countryId: string) {
		return this.edgeService.findByCountry(countryId)
	}

	@Get(':id')
	@Auth()
	async findById(@Param('id') id: string) {
		return this.edgeService.findById(id)
	}

	@Delete(':id')
	@Admin()
	async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
		return this.edgeService.delete(id, userId)
	}
}

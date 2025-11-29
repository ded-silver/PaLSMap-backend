import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import { PathAreaService } from './path-area.service'
import { CreatePathAreaDto, UpdatePathAreaDto } from './path-area.dto'
import { Admin } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'

@Controller('path-areas')
export class PathAreaController {
	constructor(private readonly pathAreaService: PathAreaService) {}

	@Get('country/:countryId')
	async findByCountry(@Param('countryId') countryId: string) {
		return this.pathAreaService.findByCountry(countryId)
	}

	@Get(':id')
	async findById(@Param('id') id: string) {
		return this.pathAreaService.findById(id)
	}

	@Post()
	@Admin()
	async create(
		@Body() dto: CreatePathAreaDto,
		@CurrentUser('id') userId: string
	) {
		return this.pathAreaService.create(dto, userId)
	}

	@Patch(':id')
	@Admin()
	async update(
		@Param('id') id: string,
		@Body() dto: UpdatePathAreaDto,
		@CurrentUser('id') userId: string
	) {
		return this.pathAreaService.update(id, dto, userId)
	}

	@Delete(':id')
	@Admin()
	async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
		return this.pathAreaService.delete(id, userId)
	}
}

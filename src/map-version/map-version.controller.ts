import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { MapVersionService } from './map-version.service'
import { CreateMapVersionDto } from './map-version.dto'
import { Auth, Admin } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'

@Controller('map-versions')
export class MapVersionController {
	constructor(private readonly mapVersionService: MapVersionService) {}

	@Post()
	@Admin()
	async create(
		@Body() dto: CreateMapVersionDto,
		@CurrentUser('id') userId: string
	) {
		return this.mapVersionService.create(userId, dto)
	}

	@Get('path-area/:pathAreaId')
	@Auth()
	async findByPathArea(@Param('pathAreaId') pathAreaId: string) {
		return this.mapVersionService.findByPathArea(pathAreaId)
	}

	@Get(':versionId')
	@Auth()
	async findOne(@Param('versionId') versionId: string) {
		return this.mapVersionService.findOne(versionId)
	}

	@Post(':versionId/restore')
	@Admin()
	async restore(
		@Param('versionId') versionId: string,
		@CurrentUser('id') userId: string
	) {
		await this.mapVersionService.restore(userId, versionId)
		return {
			success: true,
			message: 'Version restored successfully'
		}
	}

	@Delete(':versionId')
	@Admin()
	async delete(@Param('versionId') versionId: string) {
		await this.mapVersionService.delete(versionId)
		return {
			success: true
		}
	}
}

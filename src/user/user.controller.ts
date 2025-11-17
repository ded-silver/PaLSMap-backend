/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
import {
	Body,
	BadRequestException,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UploadedFile,
	UseInterceptors,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Express } from 'express'

import { Auth } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { UserDto } from './user.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { UserService } from './user.service'

@Controller('user/profile')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@Auth()
	async getProfile(@CurrentUser('id') id: string) {
		return this.userService.findById(id)
	}

	@Post('change-password')
	@Auth()
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async changePassword(
		@CurrentUser('id') id: string,
		@Body() dto: ChangePasswordDto
	) {
		return this.userService.changePassword(id, dto)
	}

	@Post('avatar/upload')
	@Auth()
	@UseInterceptors(FileInterceptor('avatar'))
	@HttpCode(200)
	async uploadAvatar(
		@CurrentUser('id') id: string,
		@UploadedFile() file: Express.Multer.File
	) {
		if (!file) {
			throw new BadRequestException('Файл не был загружен')
		}

		const avatarUrl = `/static/uploads/avatars/${file.filename}`
		return this.userService.updateAvatar(id, avatarUrl)
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Put()
	@Auth()
	async updateProfile(@CurrentUser('id') id: string, @Body() dto: UserDto) {
		return this.userService.update(id, dto)
	}

	@Get(':id')
	@Auth()
	async findById(@Param('id') id: string) {
		return this.userService.findById(id)
	}
}

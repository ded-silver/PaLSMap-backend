import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'

import { SuperAdmin } from 'src/auth/decorators/auth.decorator'
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto'
import { UserService } from './user.service'

@Controller('user/admin')
export class AdminUserController {
	constructor(private readonly userService: UserService) {}

	@Get('users')
	@SuperAdmin()
	async getAllUsers() {
		return this.userService.findAll()
	}

	@Put('users/:id')
	@SuperAdmin()
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	async updateUserByAdmin(
		@Param('id') id: string,
		@Body() dto: UpdateUserByAdminDto
	) {
		return this.userService.updateByAdmin(id, dto)
	}
}

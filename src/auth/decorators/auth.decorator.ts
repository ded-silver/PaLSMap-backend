import { UseGuards, applyDecorators } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt.guard'
import { AdminGuard } from '../guards/admin.guard'
import { SuperAdminGuard } from '../guards/super-admin.guard'

export const Auth = () => UseGuards(JwtAuthGuard)

export const Admin = () => applyDecorators(Auth(), UseGuards(AdminGuard))

export const SuperAdmin = () =>
	applyDecorators(Auth(), UseGuards(SuperAdminGuard))

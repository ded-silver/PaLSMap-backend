import { UseGuards, applyDecorators } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt.guard'
import { AdminGuard } from '../guards/admin.guard'

export const Auth = () => UseGuards(JwtAuthGuard)

export const Admin = () => applyDecorators(Auth(), UseGuards(AdminGuard))

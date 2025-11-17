import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { SuperAdminGuard } from 'src/auth/guards/super-admin.guard'
import { UserController } from './user.controller'
import { AdminUserController } from './admin-user.controller'
import { UserService } from './user.service'

@Module({
	controllers: [UserController, AdminUserController],
	providers: [UserService, PrismaService, SuperAdminGuard],
	exports: [UserService]
})
export class UserModule {}

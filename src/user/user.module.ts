import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import * as fs from 'fs'
import { BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { SuperAdminGuard } from 'src/auth/guards/super-admin.guard'
import { UserController } from './user.controller'
import { AdminUserController } from './admin-user.controller'
import { UserService } from './user.service'

const uploadsDir = './uploads/avatars'
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true })
}

@Module({
	imports: [
		MulterModule.register({
			storage: diskStorage({
				destination: uploadsDir,
				filename: (req: any, file, cb) => {
					const userId = req.user?.id || 'unknown'
					const uniqueSuffix =
						Date.now() + '-' + Math.round(Math.random() * 1e9)
					const ext = extname(file.originalname)
					cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`)
				}
			}),
			limits: {
				fileSize: 5 * 1024 * 1024
			},
			fileFilter: (req, file, cb) => {
				const allowedMimes = [
					'image/jpeg',
					'image/png',
					'image/gif',
					'image/webp'
				]
				if (allowedMimes.includes(file.mimetype)) {
					cb(null, true)
				} else {
					cb(
						new BadRequestException(
							'Недопустимый тип файла. Разрешены: JPEG, PNG, GIF, WebP'
						),
						false
					)
				}
			}
		})
	],
	controllers: [UserController, AdminUserController],
	providers: [UserService, PrismaService, SuperAdminGuard],
	exports: [UserService]
})
export class UserModule {}

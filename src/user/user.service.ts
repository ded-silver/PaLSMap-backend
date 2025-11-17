/* eslint-disable no-console */
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { hash, verify } from 'argon2'
import { AuthDto } from 'src/auth/dto/auth.dto'
import { PrismaService } from 'src/prisma.service'
import { UserDto } from './user.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async findById(id: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				id
			},
			select: {
				id: true,
				email: true,
				name: true,
				position: true,
				avatar: true,
				isAdmin: true,
				createdAt: true,
				updatedAt: true
			} as any
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		return user
	}

	getById(id: string) {
		return this.prisma.user.findUnique({
			where: {
				id
			}
		})
	}

	getByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: {
				email
			}
		})
	}

	async create(dto: AuthDto) {
		const user = {
			email: dto.email,
			name: '',
			password: await hash(dto.password),
			isAdmin: false
		}

		return this.prisma.user.create({
			data: user
		})
	}

	async update(id: string, dto: UserDto) {
		const updateData = Object.fromEntries(
			Object.entries(dto).filter(([, value]) => value !== undefined)
		)

		return this.prisma.user.update({
			where: {
				id
			},
			data: updateData,
			select: {
				id: true,
				email: true,
				name: true,
				position: true,
				avatar: true,
				isAdmin: true,
				createdAt: true,
				updatedAt: true
			} as any
		})
	}

	async changePassword(id: string, dto: ChangePasswordDto) {
		const user = await this.prisma.user.findUnique({ where: { id } })

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const isValid = await verify(user.password, dto.currentPassword)

		if (!isValid) {
			throw new UnauthorizedException('Invalid current password')
		}

		if (dto.currentPassword === dto.newPassword) {
			throw new BadRequestException(
				'New password must be different from current password'
			)
		}

		if (dto.newPassword !== dto.confirmPassword) {
			throw new BadRequestException(
				'New password and confirmation do not match'
			)
		}

		const hashedPassword = await hash(dto.newPassword)

		return this.prisma.user.update({
			where: { id },
			data: { password: hashedPassword },
			select: {
				id: true,
				email: true,
				name: true,
				position: true,
				avatar: true,
				isAdmin: true,
				createdAt: true,
				updatedAt: true
			} as any
		})
	}

	async findAll() {
		return this.prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				position: true,
				avatar: true,
				isAdmin: true,
				isSuperAdmin: true,
				createdAt: true,
				updatedAt: true
			} as any,
			orderBy: {
				createdAt: 'desc'
			}
		})
	}

	async updateByAdmin(id: string, dto: UpdateUserByAdminDto) {
		const targetUser = await this.prisma.user.findUnique({
			where: { id },
			select: { isSuperAdmin: true } as any
		})

		if (!targetUser) {
			throw new NotFoundException('User not found')
		}

		if (targetUser.isSuperAdmin) {
			throw new ForbiddenException('Cannot modify super admin')
		}

		return this.prisma.user.update({
			where: { id },
			data: dto,
			select: {
				id: true,
				email: true,
				name: true,
				position: true,
				avatar: true,
				isAdmin: true,
				isSuperAdmin: true,
				createdAt: true,
				updatedAt: true
			} as any
		})
	}
}

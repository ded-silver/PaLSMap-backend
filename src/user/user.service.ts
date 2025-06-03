/* eslint-disable no-console */
import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'
import { AuthDto } from 'src/auth/dto/auth.dto'
import { PrismaService } from 'src/prisma.service'
import { UserDto } from './user.dto'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async findById(id: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				id
			}
			// include: {
			// 	roles: true,
			// 	cards: true
			// }
		})

		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...rest } = user

			return {
				...rest
			}
		} catch (err) {}
	}

	getById(id: string) {
		return this.prisma.user.findUnique({
			where: {
				id
			}
			// include: {
			// 	tasks: true,
			// 	boards: true,
			// 	roles: true
			// }
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
		let data = dto

		if (dto.password) {
			data = { ...dto, password: await hash(dto.password) }
		}

		return this.prisma.user.update({
			where: {
				id
			},
			data
		})
	}
}

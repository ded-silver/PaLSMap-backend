import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateDictionaryDto, UpdateDictionaryDto } from './dictionary.dto'

@Injectable()
export class DictionaryService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(search?: string) {
		const where = search
			? {
					OR: [
						{ short: { contains: search, mode: 'insensitive' as const } },
						{ full: { contains: search, mode: 'insensitive' as const } }
					]
				}
			: {}

		const [items, total] = await Promise.all([
			this.prisma.dictionary.findMany({
				where,
				orderBy: { short: 'asc' },
				select: {
					id: true,
					short: true,
					full: true,
					createdAt: true,
					updatedAt: true
				}
			}),
			this.prisma.dictionary.count({ where })
		])

		return { items, total }
	}

	async findById(id: string) {
		const dictionary = await this.prisma.dictionary.findUnique({
			where: { id },
			select: {
				id: true,
				short: true,
				full: true,
				createdAt: true,
				updatedAt: true
			}
		})

		if (!dictionary) {
			throw new NotFoundException(`Запись с ID ${id} не найдена`)
		}

		return dictionary
	}

	async create(dto: CreateDictionaryDto, userId: string) {
		const existing = await this.prisma.dictionary.findUnique({
			where: { short: dto.short }
		})

		if (existing) {
			throw new ConflictException(`Аббревиатура "${dto.short}" уже существует`)
		}

		return this.prisma.dictionary.create({
			data: {
				short: dto.short,
				full: dto.full,
				createdById: userId,
				updatedById: userId
			},
			select: {
				id: true,
				short: true,
				full: true,
				createdAt: true,
				updatedAt: true
			}
		})
	}

	async update(id: string, dto: UpdateDictionaryDto, userId: string) {
		const existing = await this.prisma.dictionary.findUnique({
			where: { id }
		})

		if (!existing) {
			throw new NotFoundException(`Запись с ID ${id} не найдена`)
		}

		if (dto.short && dto.short !== existing.short) {
			const duplicate = await this.prisma.dictionary.findUnique({
				where: { short: dto.short }
			})

			if (duplicate) {
				throw new ConflictException(
					`Аббревиатура "${dto.short}" уже существует`
				)
			}
		}

		return this.prisma.dictionary.update({
			where: { id },
			data: {
				...dto,
				updatedById: userId
			},
			select: {
				id: true,
				short: true,
				full: true,
				createdAt: true,
				updatedAt: true
			}
		})
	}

	async delete(id: string) {
		const existing = await this.prisma.dictionary.findUnique({
			where: { id }
		})

		if (!existing) {
			throw new NotFoundException(`Запись с ID ${id} не найдена`)
		}

		await this.prisma.dictionary.delete({
			where: { id }
		})

		return {
			success: true,
			message: 'Запись успешно удалена'
		}
	}
}

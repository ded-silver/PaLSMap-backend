import {
	Injectable,
	NotFoundException,
	BadRequestException,
	Logger
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateCountryDto, UpdateCountryDto } from './country.dto'
import { NodeHistoryService } from 'src/node-history/node-history.service'
import { EntityType, ActionType } from 'src/node-history/node-history.dto'

@Injectable()
export class CountryService {
	private readonly logger = new Logger(CountryService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly nodeHistoryService: NodeHistoryService
	) {}

	async create(dto: CreateCountryDto, userId?: string) {
		if (dto.code) {
			const existing = await this.prisma.country.findUnique({
				where: { code: dto.code }
			})
			if (existing) {
				throw new BadRequestException(
					`Country with code "${dto.code}" already exists`
				)
			}
		}

		const country = await this.prisma.country.create({
			data: {
				name: dto.name,
				code: dto.code
			}
		})

		if (userId) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.NODE,
					entityId: country.id,
					actionType: ActionType.CREATE,
					changes: {
						after: {
							name: country.name,
							code: country.code
						}
					},
					description: `Создана страна "${country.name}"`
				})
			} catch (error) {
				this.logger.error('Error logging country creation:', error)
			}
		}

		return country
	}

	async findAll() {
		return this.prisma.country.findMany({
			include: {
				pathAreas: {
					select: {
						id: true,
						name: true,
						createdAt: true,
						updatedAt: true
					}
				}
			},
			orderBy: {
				name: 'asc'
			}
		})
	}

	async findById(id: string) {
		const country = await this.prisma.country.findUnique({
			where: { id },
			include: {
				pathAreas: {
					orderBy: {
						name: 'asc'
					}
				}
			}
		})

		if (!country) {
			throw new NotFoundException(`Country with ID ${id} not found`)
		}

		return country
	}

	async update(id: string, dto: UpdateCountryDto, userId?: string) {
		const country = await this.prisma.country.findUnique({
			where: { id }
		})

		if (!country) {
			throw new NotFoundException(`Country with ID ${id} not found`)
		}

		if (dto.code && dto.code !== country.code) {
			const existing = await this.prisma.country.findUnique({
				where: { code: dto.code }
			})
			if (existing) {
				throw new BadRequestException(
					`Country with code "${dto.code}" already exists`
				)
			}
		}

		const before = {
			name: country.name,
			code: country.code
		}

		const updated = await this.prisma.country.update({
			where: { id },
			data: {
				name: dto.name,
				code: dto.code
			}
		})

		if (userId) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.NODE,
					entityId: id,
					actionType: ActionType.UPDATE,
					changes: {
						before,
						after: {
							name: updated.name,
							code: updated.code
						}
					},
					description: `Обновлена страна "${updated.name}"`
				})
			} catch (error) {
				this.logger.error('Error logging country update:', error)
			}
		}

		return updated
	}

	async delete(id: string, userId?: string) {
		const country = await this.prisma.country.findUnique({
			where: { id },
			include: {
				pathAreas: {
					select: {
						id: true
					}
				}
			}
		})

		if (!country) {
			throw new NotFoundException(`Country with ID ${id} not found`)
		}

		if (country.pathAreas.length > 0) {
			throw new BadRequestException(
				`Cannot delete country with ${country.pathAreas.length} path area(s). Delete path areas first.`
			)
		}

		const before = {
			name: country.name,
			code: country.code
		}

		const deleted = await this.prisma.country.delete({
			where: { id }
		})

		if (userId) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.NODE,
					entityId: id,
					actionType: ActionType.DELETE,
					changes: {
						before
					},
					description: `Удалена страна "${before.name}"`
				})
			} catch (error) {
				this.logger.error('Error logging country deletion:', error)
			}
		}

		return deleted
	}
}

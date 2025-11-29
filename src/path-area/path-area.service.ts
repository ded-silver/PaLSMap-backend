import {
	Injectable,
	NotFoundException,
	BadRequestException,
	Logger
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreatePathAreaDto, UpdatePathAreaDto } from './path-area.dto'
import { NodeHistoryService } from 'src/node-history/node-history.service'
import { EntityType, ActionType } from 'src/node-history/node-history.dto'

@Injectable()
export class PathAreaService {
	private readonly logger = new Logger(PathAreaService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly nodeHistoryService: NodeHistoryService
	) {}

	async create(dto: CreatePathAreaDto, userId?: string) {
		const country = await this.prisma.country.findUnique({
			where: { id: dto.countryId }
		})

		if (!country) {
			throw new NotFoundException(`Country with ID ${dto.countryId} not found`)
		}

		const pathArea = await this.prisma.pathArea.create({
			data: {
				name: dto.name,
				countryId: dto.countryId
			},
			include: {
				country: {
					select: {
						id: true,
						name: true
					}
				}
			}
		})

		if (userId) {
			try {
				await this.nodeHistoryService.create(userId, {
					entityType: EntityType.NODE,
					entityId: pathArea.id,
					actionType: ActionType.CREATE,
					changes: {
						after: {
							name: pathArea.name,
							countryId: pathArea.countryId,
							countryName: pathArea.country.name
						}
					},
					description: `Создана область "${pathArea.name}" в стране "${pathArea.country.name}"`
				})
			} catch (error) {
				this.logger.error('Error logging path area creation:', error)
			}
		}

		return pathArea
	}

	async findByCountry(countryId: string) {
		const country = await this.prisma.country.findUnique({
			where: { id: countryId }
		})

		if (!country) {
			throw new NotFoundException(`Country with ID ${countryId} not found`)
		}

		return this.prisma.pathArea.findMany({
			where: { countryId },
			include: {
				country: {
					select: {
						id: true,
						name: true
					}
				}
			},
			orderBy: {
				name: 'asc'
			}
		})
	}

	async findById(id: string) {
		const pathArea = await this.prisma.pathArea.findUnique({
			where: { id },
			include: {
				country: {
					select: {
						id: true,
						name: true,
						code: true
					}
				}
			}
		})

		if (!pathArea) {
			throw new NotFoundException(`PathArea with ID ${id} not found`)
		}

		return pathArea
	}

	async update(id: string, dto: UpdatePathAreaDto, userId?: string) {
		const pathArea = await this.prisma.pathArea.findUnique({
			where: { id },
			include: {
				country: true
			}
		})

		if (!pathArea) {
			throw new NotFoundException(`PathArea with ID ${id} not found`)
		}

		if (dto.countryId && dto.countryId !== pathArea.countryId) {
			const country = await this.prisma.country.findUnique({
				where: { id: dto.countryId }
			})

			if (!country) {
				throw new NotFoundException(
					`Country with ID ${dto.countryId} not found`
				)
			}
		}

		const before = {
			name: pathArea.name,
			countryId: pathArea.countryId,
			countryName: pathArea.country.name
		}

		const updated = await this.prisma.pathArea.update({
			where: { id },
			data: {
				name: dto.name,
				countryId: dto.countryId
			},
			include: {
				country: {
					select: {
						id: true,
						name: true
					}
				}
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
							countryId: updated.countryId,
							countryName: updated.country.name
						}
					},
					description: `Обновлена область "${updated.name}"`
				})
			} catch (error) {
				this.logger.error('Error logging path area update:', error)
			}
		}

		return updated
	}

	async delete(id: string, userId?: string) {
		const pathArea = await this.prisma.pathArea.findUnique({
			where: { id },
			include: {
				country: {
					select: {
						id: true,
						name: true
					}
				}
			}
		})

		if (!pathArea) {
			throw new NotFoundException(`PathArea with ID ${id} not found`)
		}

		const before = {
			name: pathArea.name,
			countryId: pathArea.countryId,
			countryName: pathArea.country.name
		}

		await this.prisma.node.updateMany({
			where: { pathAreaId: id },
			data: { pathAreaId: null }
		})

		const deleted = await this.prisma.pathArea.delete({
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
					description: `Удалена область "${before.name}" (ноды не удалены, область обнулена)`
				})
			} catch (error) {
				this.logger.error('Error logging path area deletion:', error)
			}
		}

		return deleted
	}
}

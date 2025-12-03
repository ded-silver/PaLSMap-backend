import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import { CountryService } from './country.service'
import { CreateCountryDto, UpdateCountryDto } from './country.dto'
import { Auth, Admin } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'

@Controller('countries')
export class CountryController {
	constructor(private readonly countryService: CountryService) {}

	@Get()
	@Auth()
	async findAll() {
		return this.countryService.findAll()
	}

	@Get(':id')
	@Auth()
	async findById(@Param('id') id: string) {
		return this.countryService.findById(id)
	}

	@Post()
	@Admin()
	async create(
		@Body() dto: CreateCountryDto,
		@CurrentUser('id') userId: string
	) {
		return this.countryService.create(dto, userId)
	}

	@Patch(':id')
	@Admin()
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateCountryDto,
		@CurrentUser('id') userId: string
	) {
		return this.countryService.update(id, dto, userId)
	}

	@Delete(':id')
	@Admin()
	async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
		return this.countryService.delete(id, userId)
	}
}

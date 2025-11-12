import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query
} from '@nestjs/common'
import { DictionaryService } from './dictionary.service'
import { CreateDictionaryDto, UpdateDictionaryDto } from './dictionary.dto'
import { Auth, Admin } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'

@Controller('dictionary')
export class DictionaryController {
	constructor(private readonly dictionaryService: DictionaryService) {}

	@Get()
	@Auth()
	findAll(@Query('search') search?: string) {
		return this.dictionaryService.findAll(search)
	}

	@Get(':id')
	@Auth()
	findById(@Param('id') id: string) {
		return this.dictionaryService.findById(id)
	}

	@Post()
	@Admin()
	create(@Body() dto: CreateDictionaryDto, @CurrentUser('id') userId: string) {
		return this.dictionaryService.create(dto, userId)
	}

	@Patch(':id')
	@Admin()
	update(
		@Param('id') id: string,
		@Body() dto: UpdateDictionaryDto,
		@CurrentUser('id') userId: string
	) {
		return this.dictionaryService.update(id, dto, userId)
	}

	@Delete(':id')
	@Admin()
	delete(@Param('id') id: string) {
		return this.dictionaryService.delete(id)
	}
}

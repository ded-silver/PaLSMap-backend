import { IsString, IsOptional, MinLength } from 'class-validator'

export class CreateDictionaryDto {
	@IsString()
	@MinLength(1, { message: 'Аббревиатура не может быть пустой' })
	short: string

	@IsString()
	@MinLength(1, { message: 'Полное название не может быть пустым' })
	full: string
}

export class UpdateDictionaryDto {
	@IsOptional()
	@IsString()
	@MinLength(1, { message: 'Аббревиатура не может быть пустой' })
	short?: string

	@IsOptional()
	@IsString()
	@MinLength(1, { message: 'Полное название не может быть пустым' })
	full?: string
}

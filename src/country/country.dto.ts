import { IsString, IsOptional } from 'class-validator'

export class CreateCountryDto {
	@IsString()
	name: string

	@IsOptional()
	@IsString()
	code?: string
}

export class UpdateCountryDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsString()
	code?: string
}

import { IsString, IsOptional } from 'class-validator'

export class CreatePathAreaDto {
	@IsString()
	name: string

	@IsString()
	countryId: string
}

export class UpdatePathAreaDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsString()
	countryId?: string
}

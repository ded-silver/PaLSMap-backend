import {
	IsEmail,
	IsOptional,
	IsString,
	IsUrl,
	MaxLength
} from 'class-validator'

export class UserDto {
	@IsEmail()
	@IsOptional()
	email?: string

	@IsString()
	@IsOptional()
	@MaxLength(100)
	name?: string

	@IsString()
	@IsOptional()
	@MaxLength(100)
	position?: string

	@IsString()
	@IsOptional()
	@IsUrl({}, { message: 'Avatar must be a valid URL' })
	avatar?: string
}

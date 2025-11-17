import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateUserByAdminDto {
	@IsOptional()
	@IsString()
	@MaxLength(255)
	position?: string

	@IsOptional()
	@IsBoolean()
	isAdmin?: boolean
}

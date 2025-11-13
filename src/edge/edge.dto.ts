import { IsString, IsObject, IsOptional } from 'class-validator'

export class CreateEdgeDto {
	@IsString()
	source: string

	@IsString()
	target: string

	@IsString()
	sourceHandle: string

	@IsString()
	targetHandle: string

	@IsOptional()
	@IsString()
	type?: string

	@IsOptional()
	@IsObject()
	style?: {
		strokeWidth?: number
		stroke?: string
		[key: string]: any
	}
}

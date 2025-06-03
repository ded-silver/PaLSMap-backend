import { IsString } from 'class-validator'

export class CreateEdgeDto {
	@IsString()
	source: string

	@IsString()
	target: string

	@IsString()
	sourceHandle: string

	@IsString()
	targetHandle: string

	@IsString()
	type: string

	@IsString()
	style: string
}

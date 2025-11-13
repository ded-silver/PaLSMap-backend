import { IsEnum, IsJSON, IsNumber, IsOptional, IsString } from 'class-validator'
import { NodeData, NodeType } from '@prisma/client'

export class NodeDto {
	@IsEnum(NodeType)
	type: NodeType

	@IsJSON()
	position: any

	@IsJSON()
	data: NodeData
	
	@IsJSON()
	measured: {
		width: number
		height: number
	}

	@IsOptional()
	@IsString()
	parentId?: string
}

export class NodeDataDto {
	@IsString()
	protectionName: string

	@IsString()
	excerpt: string

	@IsString()

	source: string

	@IsString()
	triggeringConditions: string

	@IsString()
	triggeringAlgorithm: string

	@IsNumber()
	order: number
}

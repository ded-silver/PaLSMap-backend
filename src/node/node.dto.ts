import {
	IsEnum,
	IsJSON,
	IsNumber,
	IsOptional,
	IsString,
	Min,
	Max,
	Matches,
	IsBoolean,
	ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'
import { NodeData, NodeType } from '@prisma/client'

export enum VisualStateStatus {
	NORMAL = 'normal',
	WARNING = 'warning',
	ERROR = 'error',
	SUCCESS = 'success',
	INFO = 'info'
}

export class VisualStateDto {
	@IsOptional()
	@IsEnum(VisualStateStatus)
	status?: VisualStateStatus

	@IsOptional()
	@IsString()
	@Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: 'borderColor must be a valid hex color (e.g., #FF0000 or #F00)'
	})
	borderColor?: string

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(10)
	borderWidth?: number

	@IsOptional()
	@IsString()
	@Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: 'backgroundColor must be a valid hex color (e.g., #FF0000 or #F00)'
	})
	backgroundColor?: string

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(1)
	opacity?: number
}

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

	@IsOptional()
	@IsBoolean()
	locked?: boolean

	@IsOptional()
	@ValidateNested()
	@Type(() => VisualStateDto)
	visualState?: VisualStateDto
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

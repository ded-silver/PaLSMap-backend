import {
	IsEnum,
	IsString,
	IsOptional,
	IsDateString,
	IsObject
} from 'class-validator'

export enum EntityType {
	NODE = 'NODE',
	EDGE = 'EDGE',
	TABLE_DATA = 'TABLE_DATA'
}

export enum ActionType {
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	MOVE = 'MOVE',
	LOCK = 'LOCK',
	UNLOCK = 'UNLOCK',
	VISUAL_STATE_CHANGE = 'VISUAL_STATE_CHANGE',
	PARENT_CHANGE = 'PARENT_CHANGE',
	HANDLERS_CHANGE = 'HANDLERS_CHANGE',
	LABEL_CHANGE = 'LABEL_CHANGE',
	TYPE_CHANGE = 'TYPE_CHANGE'
}

export class CreateNodeHistoryDto {
	@IsEnum(EntityType)
	entityType: EntityType

	@IsString()
	entityId: string

	@IsEnum(ActionType)
	actionType: ActionType

	@IsObject()
	changes: {
		before?: any
		after?: any
	}

	@IsOptional()
	@IsString()
	description?: string
}

export class NodeHistoryDto {
	id: string
	createdAt: Date
	userId: string
	user?: {
		id: string
		email: string
		name?: string
	}
	entityType: EntityType
	entityId: string
	actionType: ActionType
	changes: {
		before?: any
		after?: any
	}
	description?: string
}

export class HistoryFiltersDto {
	@IsOptional()
	@IsEnum(EntityType)
	entityType?: EntityType

	@IsOptional()
	@IsEnum(ActionType)
	actionType?: ActionType

	@IsOptional()
	@IsString()
	userId?: string

	@IsOptional()
	@IsDateString()
	dateFrom?: string

	@IsOptional()
	@IsDateString()
	dateTo?: string

	@IsOptional()
	@IsString()
	nodeId?: string

	@IsOptional()
	@IsString()
	page?: string

	@IsOptional()
	@IsString()
	limit?: string
}

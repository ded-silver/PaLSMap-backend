import { IsEnum, IsJSON, IsNumber, IsOptional, IsString } from 'class-validator'
import { NodeData, NodeType } from '@prisma/client'

// DTO для создания нового узла
export class NodeDto {
	// Обязательное поле: тип узла должен соответствовать одному из значений перечисления NodeType
	@IsEnum(NodeType)
	type: NodeType

	// Обязательное поле: позиция узла должна быть валидным JSON (например, { x: number, y: number })
	@IsJSON()
	position: any // { x: number, y: number }

	// Обязательное поле: данные узла, также в формате JSON
	// Обычно содержит информацию о таблице: имя, колонки, строки, обработчики
	@IsJSON()
	data: NodeData // содержит tableName, tableColumns, tableRows, handlers

	// Необязательное поле: идентификатор родительского узла, строка (может отсутствовать)
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

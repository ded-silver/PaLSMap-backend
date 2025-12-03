import { IsString, IsOptional } from 'class-validator'

export class CreateMapVersionDto {
	@IsString()
	name: string

	@IsOptional()
	@IsString()
	description?: string

	@IsString()
	pathAreaId: string
}

export class MapVersionDto {
	id: string
	pathAreaId: string
	name: string
	description?: string
	createdAt: Date
	createdBy: {
		id: string
		email: string
		name?: string
	}
	snapshot: {
		nodes: any[]
		edges: any[]
		tableData: any[]
	}
	nodeCount?: number
}

export class RestoreVersionDto {
	@IsString()
	versionId: string
}

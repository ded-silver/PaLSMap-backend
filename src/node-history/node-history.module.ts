import { Module } from '@nestjs/common'
import { NodeHistoryService } from './node-history.service'
import { NodeHistoryController } from './node-history.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [NodeHistoryController],
	providers: [NodeHistoryService, PrismaService],
	exports: [NodeHistoryService]
})
export class NodeHistoryModule {}

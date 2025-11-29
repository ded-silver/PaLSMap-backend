import { Module } from '@nestjs/common'
import { PathAreaService } from './path-area.service'
import { PathAreaController } from './path-area.controller'
import { PrismaService } from 'src/prisma.service'
import { NodeHistoryModule } from 'src/node-history/node-history.module'

@Module({
	imports: [NodeHistoryModule],
	controllers: [PathAreaController],
	providers: [PathAreaService, PrismaService],
	exports: [PathAreaService]
})
export class PathAreaModule {}

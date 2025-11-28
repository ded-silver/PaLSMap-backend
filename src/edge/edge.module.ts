import { Module } from '@nestjs/common'
import { EdgeController } from './edge.controller'
import { PrismaService } from 'src/prisma.service'
import { EdgeService } from './edge.servise'
import { NodeHistoryModule } from 'src/node-history/node-history.module'

@Module({
	imports: [NodeHistoryModule],
	controllers: [EdgeController],
	providers: [EdgeService, PrismaService]
})
export class EdgeModule {}

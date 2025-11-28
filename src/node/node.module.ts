import { Module } from '@nestjs/common'
import { NodeService } from './node.service'
import { NodeController } from './node.controller'
import { PrismaService } from 'src/prisma.service'
import { NodeHistoryModule } from 'src/node-history/node-history.module'

@Module({
	imports: [NodeHistoryModule],
	controllers: [NodeController],
	providers: [NodeService, PrismaService]
})
export class NodeModule {}

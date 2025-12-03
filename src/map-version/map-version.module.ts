import { Module } from '@nestjs/common'
import { MapVersionService } from './map-version.service'
import { MapVersionController } from './map-version.controller'
import { PrismaService } from 'src/prisma.service'
import { NodeHistoryModule } from 'src/node-history/node-history.module'

@Module({
	imports: [NodeHistoryModule],
	controllers: [MapVersionController],
	providers: [MapVersionService, PrismaService],
	exports: [MapVersionService]
})
export class MapVersionModule {}

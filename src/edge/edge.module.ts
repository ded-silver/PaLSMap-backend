import { Module } from '@nestjs/common'
import { EdgeController } from './edge.controller'
import { PrismaService } from 'src/prisma.service'
import { EdgeService } from './edge.servise'

@Module({
	controllers: [EdgeController],
	providers: [EdgeService , PrismaService]
})
export class EdgeModule {}

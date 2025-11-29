import { Module } from '@nestjs/common'
import { CountryService } from './country.service'
import { CountryController } from './country.controller'
import { PrismaService } from 'src/prisma.service'
import { NodeHistoryModule } from 'src/node-history/node-history.module'

@Module({
	imports: [NodeHistoryModule],
	controllers: [CountryController],
	providers: [CountryService, PrismaService],
	exports: [CountryService]
})
export class CountryModule {}

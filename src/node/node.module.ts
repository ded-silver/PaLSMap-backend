import { Module } from '@nestjs/common'
import { NodeService } from './node.service'
import { NodeController } from './node.controller'
import { PrismaService } from 'src/prisma.service'

// Описание модуля NodeModule с помощью декоратора @Module
@Module({
	// controllers — массив контроллеров, обрабатывающих входящие HTTP-запросы
	controllers: [NodeController],
	
	// providers — массив провайдеров (сервисов), доступных внутри модуля
	providers: [NodeService, PrismaService]
})
// Экспорт класса модуля
export class NodeModule {}
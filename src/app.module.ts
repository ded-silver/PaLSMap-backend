import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ConfigModule } from '@nestjs/config'
import { NodeModule } from './node/node.module'
import { EdgeModule } from './edge/edge.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		AuthModule,
		UserModule,
		NodeModule,
		EdgeModule
	]
})
export class AppModule {}

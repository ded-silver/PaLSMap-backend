import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { EdgeModule } from './edge/edge.module'
import { NodeModule } from './node/node.module'
import { UserModule } from './user/user.module'

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

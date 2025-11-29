import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { EdgeModule } from './edge/edge.module'
import { NodeModule } from './node/node.module'
import { UserModule } from './user/user.module'
import { DictionaryModule } from './dictionary/dictionary.module'
import { NodeHistoryModule } from './node-history/node-history.module'
import { CountryModule } from './country/country.module'
import { PathAreaModule } from './path-area/path-area.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		AuthModule,
		UserModule,
		NodeModule,
		EdgeModule,
		DictionaryModule,
		NodeHistoryModule,
		CountryModule,
		PathAreaModule
	]
})
export class AppModule {}

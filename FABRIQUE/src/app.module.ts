import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SelfHealingModule } from './modules/self-healing/self-healing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SelfHealingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

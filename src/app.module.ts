import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {ConfigModule} from "@nestjs/config";
import { AppService } from './app.service';
import {DevtoolsModule} from "@nestjs/devtools-integration";

@Module({
  imports: [

    ConfigModule.forRoot({isGlobal: true}),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
      port: 9229
    }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

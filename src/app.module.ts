import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {ConfigModule} from "@nestjs/config";
import { AppService } from './app.service';
import {DevtoolsModule} from "@nestjs/devtools-integration";
import {ServeStaticModule} from "@nestjs/serve-static";
import { join } from 'path';

@Module({
  imports: [

    ConfigModule.forRoot({isGlobal: true}),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
      port: 9229
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)'],
    }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

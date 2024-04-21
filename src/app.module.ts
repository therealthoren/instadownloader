import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {ConfigModule} from "@nestjs/config";
import { AppService } from './app.service';
import {DevtoolsModule} from "@nestjs/devtools-integration";
import {ServeStaticModule} from "@nestjs/serve-static";
import { join } from 'path';
import { InstagramModule } from './instagram/instagram.module';
import { MediaModule } from './media/media.module';
import {InstagramService} from "./instagram/instagram.service";
import {FileSystemService} from "./media/file-system/file-system.service";
import {MEDIA_SERVICE} from "./media/IMediaSystemInterface";
import { DatabaseModule } from './database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {PostModule} from "./database/post/post.module";
import {PostService} from "./database/post/post.service";
import {Post} from "./entities/post.entity";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      password: process.env.DB_PASSWORD,
      username: process.env.DB_USER,
      entities: [
        Post
      ],
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
      logging: true,
    }),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
      port: 9229
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    InstagramModule,
    MediaModule,
    DatabaseModule,
    PostModule
  ],
  controllers: [AppController],
  providers: [AppService, InstagramService, PostService, {
    useClass: FileSystemService,
    provide: MEDIA_SERVICE
  }],
})
export class AppModule {}

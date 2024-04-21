import { Module } from '@nestjs/common';
import { FileSystemService } from './file-system/file-system.service';
import { S3SystemService } from './s3-system/s3-system.service';
import {MEDIA_SERVICE} from "./IMediaSystemInterface";

@Module({
  providers: [
    {
      // You can switch useClass to different implementation
      useClass: FileSystemService,
      provide: MEDIA_SERVICE
    }
  ],
})
export class MediaModule {}

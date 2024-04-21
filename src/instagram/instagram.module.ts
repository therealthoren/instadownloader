import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Module({
  providers: [InstagramService]
})
export class InstagramModule {}

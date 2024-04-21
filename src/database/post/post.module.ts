import {Module} from '@nestjs/common';
import { PostService } from './post.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Post} from "../../entities/post.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [],
  exports: [TypeOrmModule],
  providers: [PostService],
})
export class PostModule {}

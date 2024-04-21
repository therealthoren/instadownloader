import {ClassSerializerInterceptor, Controller, Get, Inject, Query, Res, UseInterceptors} from '@nestjs/common';
import {AppService, ViewPost} from './app.service';
import axios from "axios";
import * as fs from "fs";
import {IMediaSystemInterface} from "./media/IMediaSystemInterface";
import {PostService} from "./database/post/post.service";
import { serialize } from 'class-transformer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private readonly postService: PostService,
              @Inject('MEDIA_SERVICE')
              private readonly mediaService: IMediaSystemInterface) {}

  onModuleInit() {
    this.checkIfPostsExist();
  }

  async checkIfPostsExist() {
    return this.appService.downloadNewestFeeds();
  }



  @Get("/api/posts")
  @UseInterceptors(ClassSerializerInterceptor)
  async getPosts(): Promise<ViewPost[]> {
      return this.appService.getPosts();
  }

  @Get('/api/cached-image')
  // The query parameter "url" is required
  async getCachedImage(@Query("url") url, @Res() response): Promise<any> {
    const fixedUrl = url.replace(/\//g, "_");
    return this.postService.findPostByDownloadUrl(fixedUrl)
      .then((post) => {
        if (!post) {
          return response.status(404).send("Not found");
        }
        return this.mediaService.download(post.id.toString(), !post.num_of_videos || post.num_of_videos < 0)
          .then((ret) => {
            response.contentType(ret.contentType);
            ret.send(response);
          });

      });
  }
}

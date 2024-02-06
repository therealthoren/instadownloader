import {Controller, Get, Query, Res} from '@nestjs/common';
import { AppService } from './app.service';
import axios from "axios";
import * as fs from "fs";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/api/posts")
  async getPosts(): Promise<string> {
    return this.appService.getPosts();
  }

  @Get('/api/cached-image')
  // The query parameter "url" is required
  async getCachedImage(@Query("url") url, @Res() response): Promise<any> {
    const fixedUrl = url.replace(/\//g, "_");
    const isImage = fs.existsSync(`./images/${fixedUrl}.jpg`);
    const isVideo = fs.existsSync(`./images/${fixedUrl}.mp4`);
    if (!isImage && !isVideo) {
      return response.status(404).send("Not found");
    }
    const fullPath = isImage ? `/${fixedUrl}.jpg` : `/${fixedUrl}.mp4`;
    console.log(fixedUrl);
    // Return the image from the "image" directory
    return response.sendFile(fullPath, { root: './images' });
  }
}

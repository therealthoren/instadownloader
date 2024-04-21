import {Inject, Injectable, Logger} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {InstagramService} from "./instagram/instagram.service";
import {PostService} from "./database/post/post.service";
import axios from "axios";
import fs from "fs";
import {IMediaSystemInterface} from "./media/IMediaSystemInterface";
import stream from "node:stream";
import { Expose } from 'class-transformer';

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export class ViewPost {
  @Expose()
  id: string;
  @Expose()
  text: string;
}


@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    readonly instagramService: InstagramService,
    @Inject('MEDIA_SERVICE')
    readonly mediaService: IMediaSystemInterface,
    readonly postService: PostService
  ) {
  }


  @Cron('45 * * * * *')
  handleCron() {
  }

  downloadNewestFeeds() {
    return new Promise(async (resolve, reject) => {
      try {
        const latestPost = await this.postService.findLatestPostId();
        this.logger.debug('Download newest posts and media.');
        const list = await this.instagramService.getAllFeedEntriesForUser(latestPost);
        this.logger.debug('Downloaded ' + list.length + ' Feeds');
        this.postService.savePostsFromInstagram(list);

        this.checkForDownloadedPosts();
      }
      catch(e) {
        reject(e);
      }
    });

  }

  checkForDownloadedPosts() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const posts = await this.postService.findAll();
        for (let i = 0; i < posts.length; i++) {
          const post = posts[i];
          if (!post.downloaded) {

            try {
              const image = post.image_versions.candidates[0].url;
              const filename = `${post.id}`;

              if (await !this.existsImage(filename)) {
                await this.downloadImage(image, filename);
              }
            } catch (e) {
              console.log(e);
            }
            await sleep(300);

            // Download the videos if they exist
            if (post.video_version) {
              for (let j = 0; j < post.video_version.length; j++) {
                try {
                  const p = post.video_version[j];
                  const video = p.url;
                  const filename = `${post.id}_${j}`;

                  if (await !this.existsImage(filename)) {
                    await this.downloadImage(video, filename);
                  }
                } catch (e) {
                  console.log(e);
                }
              }
            }
            await sleep(300);

            if (post.carousel_media) {

              for (let j = 0; j < post.carousel_media.length; j++) {
                try {

                  const p = post.carousel_media[j];
                  const image = p.image_versions2.candidates[0].url;
                  const filename = `${post.id}_${j}`;

                  if (await !this.existsImage(filename)) {
                    await this.downloadImage(image, filename);
                  }

                } catch (e) {
                  console.log(e);
                }

              }
            }
            post.downloaded = true;
            await this.postService.setPostDownloaded(post.id);
            await sleep(2000);
          }
        }
        return resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  existsImage(filename: string) {
    return new Promise<boolean>((resolve, reject) => {
      return this.mediaService.exists(filename)
        .then((exists) => {
          return resolve(exists);
        })
        .catch((e) => {
          this.logger.error(e);
          return resolve(false);
        });
    });
  }

  downloadImage(url: string, filename: string) {
    return new Promise<void>((resolve, reject) => {
      return axios(url, {
        method: 'GET',
        responseType: 'stream'
      }).then((response) => {
        this.mediaService.saveFile(filename)
          .then((writer: stream.Writable) => {
            response.data.pipe(writer);
            writer.on('finish', () => {
              return resolve();
            });
          })
      })
        .catch((e) => {
          console.log(e);
          return resolve();
        });

    });
  }

  getPosts() {
    return this.postService.findTop(50).then((posts) => {
      return posts.map((post) => {
          const d = new ViewPost();
          d.id = post.post_id;
          d.text = post.text;
          return d;
        });
    });
  }
}

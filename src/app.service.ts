import { Injectable } from '@nestjs/common';
import { IgApiClient } from 'instagram-private-api';
import { sample } from 'lodash';
import axios from "axios";
import * as fs from "fs";

@Injectable()
export class AppService {
  private ig: IgApiClient;

  // When Service get created run callback
  private loggedInUser: any;
  private cachedPosts: any[] = [
  ];
  private last_update: number = 0;

  sleep() {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  }

  onModuleInit() {

    const _this = this;

    fs.mkdirSync('./images', { recursive: true });

    this.connect().then(() => {
      console.log("Connected to Instagram");
      setInterval(() => {
        _this.checkForNewPosts();
      }, 2*60*1000);
    });

  }

  connect() {
    const _this = this;
    return new Promise<void>(async (resolve, reject) => {
      try {
        _this.sleep()
        _this.ig = new IgApiClient();
        // You must generate device id's before login.
        // Id's generated based on seed
        // So if you pass the same value as first argument - the same id's are generated every time
        _this.ig.state.generateDevice(process.env.IG_USERNAME);
        // Optionally you can setup proxy url
        //ig.state.proxyUrl = process.env.IG_PROXY;
        // Execute all requests prior to authorization in the real Android application
        // Not required but recommended
        //await _this.ig.simulate.preLoginFlow();
        const loggedInUser = await this.ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
        // The same as preLoginFlow()
        console.log("Logged in as " + loggedInUser.username)

        _this.loggedInUser = loggedInUser;
        return resolve();
      }
      catch (e) {
        console.log(e);
      }
    });

  }

  waitUntilLoggedIn() {
    return new Promise((resolve, reject) => {
      if (this.loggedInUser) {
        resolve(this.loggedInUser);
      } else {
        let interval = setInterval(() => {
          if (this.loggedInUser) {
            clearInterval(interval);
            resolve(this.loggedInUser);
          }
        }, 1000);
      }
    });
  }

  async checkForNewPosts() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.waitUntilLoggedIn();
        if (this.cachedPosts.length <= 0 ) { //|| this.last_update < Date.now() - 1000 * 60 * 5) {
          // Create UserFeed instance to get loggedInUser's posts
          const userFeed = this.ig.feed.user(this.loggedInUser.pk);
          const myPostsFirstPage = await userFeed.items();
          this.cachedPosts = myPostsFirstPage;
          this.last_update = Date.now();
          await this.downloadAllImagesAndCache();
        }
      }
      catch(e) {

      }
      return resolve();
    });

  }

  downloadImage(url: string, filename: string) {
    return new Promise<void>((resolve, reject) => {

      return axios(url, {
        method: 'GET',
        responseType: 'stream'
      }).then((response) => {
        const writer = fs.createWriteStream(filename);
        response.data.pipe(writer);
        writer.on('finish', () => {
          return resolve();
        });
      })
        .catch((e) => {
          console.log(e);
          return resolve();
        });

    });
  }

  async downloadAllImagesAndCache() {
    return new Promise<void>(async (resolve, reject) => {
      for (let i = 0; i < this.cachedPosts.length; i++) {
        try {
          const post = this.cachedPosts[i];
          const image = post.image_versions2.candidates[0].url;
          const filename = `./images/${post.id}.jpg`;

          await this.downloadImage(image, filename);
        }
        catch (e) {
          console.log(e);
        }

        // Download the videos if they exist
        if (this.cachedPosts[i].video_versions) {
          for (let j = 0; j < this.cachedPosts[i].video_versions.length; j++) {
            try {
              const post = this.cachedPosts[i].video_versions[j];
              const video = post.url;
              const filename = `./images/${this.cachedPosts[i].id}.mp4`;

              await this.downloadImage(video, filename);
            }
            catch (e) {
              console.log(e);
            }
          }
        }

        if (this.cachedPosts[i].carousel_media) {

          for (let j = 0; j < this.cachedPosts[i].carousel_media.length; j++) {
            try {


              const post = this.cachedPosts[i].carousel_media[j];
              const image = post.image_versions2.candidates[0].url;
              const filename = `./images/${post.id}.jpg`;

              await this.downloadImage(image, filename);

            }
            catch (e) {
              console.log(e);
            }

          }
        }


      }

      return resolve();
    });
  }

  async getPosts(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.checkForNewPosts();
      return resolve(this.cachedPosts.map((d) => {
        return {
          id: d.id,
          taken_at: d.taken_at,
          caption: d.caption?.text,
          carousel_media: d.carousel_media,
          image_versions2: d.image_versions2,
          likes: d.like_count,
          likers: d.likers,
          comments: d.comment_count
        }
      }));
    });

  }

}

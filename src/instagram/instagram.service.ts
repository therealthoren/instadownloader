import {Injectable, Logger} from '@nestjs/common';
import {IgApiClient} from "instagram-private-api";
import axios from "axios";
import fs from "fs";

@Injectable()
export class InstagramService {
  private ig: IgApiClient;

  private readonly logger = new Logger(InstagramService.name);
  // When Service get created run callback
  private loggedInUser: any;
  private cachedPosts: any[] = [
  ];
  private last_update: number = 0;

  sleep(timeout=5000) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  }

  onModuleInit() {

    const _this = this;

    /*this.connect().then(() => {
      console.log("Connected to Instagram");
      setInterval(() => {
        _this.checkForNewPosts();
      }, 2*60*1000);
    });*/

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
        this.connect();
        let interval = setInterval(() => {
          if (this.loggedInUser) {
            clearInterval(interval);
            resolve(this.loggedInUser);
          }
        }, 1000);
      }
    });
  }

  async getAllFeedEntriesForUser(latest_post_id: string | null = null) {
    const _this = this;
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        this.logger.log("Checking for new posts");
        await this.waitUntilLoggedIn();
        this.logger.log("Logged In");
        if (this.cachedPosts.length <= 0 ) { //|| this.last_update < Date.now() - 1000 * 60 * 5) {
          this.ig.user.search(process.env.IG_PRIVATE_PROFILE_NAME).then(async (r) => {
            // Create UserFeed instance to get loggedInUser's posts
            const userFeed = this.ig.feed.user(r.users[0].pk);
            // Get all feed items since a specific date
            const downloadRecursive  = (userFeed: any) : Promise<any[]>  => {
              return new Promise<any[]>((res, rej) => {
                try {
                  const list = [];
                  userFeed.request().then(async (r) => {
                    list.push(...r.items);
                    for (let i=0; i<r.items.length; i++) {
                      const item = r.items[i];
                      if (latest_post_id && item.id === latest_post_id) {
                        this.logger.log("Found latest post - returning list of new elements");
                        return res(list.slice(0, i));
                      }
                    }
                    this.logger.debug("Got " + r.items.length + " items")
                    if (r.more_available) {
                      this.logger.debug("More available - loading next");
                      await _this.sleep();
                      const sublist = await downloadRecursive(userFeed);
                      list.push(...sublist);
                    }
                    else {
                      this.logger.log("No more available - returning list");
                    }
                    return res(list);
                  });
                }
                catch(e) {
                  this.logger.error(e);
                  // TODO: Retry
                }
              });
            }
            const list = await downloadRecursive(userFeed);
            console.log(list);

            return resolve(list);
          });
        }
      }
      catch(e) {
        console.error(e);
        reject(e);
      }
    });

  }



}

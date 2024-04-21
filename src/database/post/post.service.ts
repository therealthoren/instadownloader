import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import {Post} from "../../entities/post.entity";

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(@InjectRepository(Post)  private postRepository: Repository<Post>) {
  }

  findAll() {
    return this.postRepository.find();
  }


  savePostsFromInstagram(list: any[]) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        for (let i = 0; i < list.length; i++) {
          try {
            const post = list[i];
            const p = new Post();
            p.post_id = post.id;
            p.downloaded = false;
            p.download_url = post.image_versions2.candidates[0].url;
            p.num_of_videos = post.video_versions ? post.video_versions.length : 0;
            p.num_of_images = post.image_versions2 ? post.image_versions2.length : 0;
            p.num_of_carousel_media = post.carousel_media ? post.carousel_media.length : 0;
            p.video_version = post.video_versions;
            p.image_versions = post.image_versions2;
            p.carousel_media = post.carousel_media;
            p.text = post.caption.text;
            p.created_at = new Date(post.taken_at * 1000);
            await this.postRepository.save(p);
          }
          catch(e) {}
        }
        return resolve();
      }
      catch(e) {
        reject(e);
      }
    });
  }

  findLatestPostId() : Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.postRepository.find({order: {created_at: "DESC"}, take: 1})
        .then((posts) => {
          if (posts && posts.length > 0) {
            const post = posts[0];
            this.logger.debug("Latest post id: " + post.post_id);
            resolve(post.post_id);
          }
          else {
            this.logger.debug("No posts found.")
            resolve(null);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  async setPostDownloaded(id: number) {
    return this.postRepository.update(id, {downloaded: true});
  }

  findTop(number: number) {
    return this.postRepository.find({order: {created_at: "DESC"}, take: number});
  }

  findPostByDownloadUrl(fixedUrl: any) {
    return this.postRepository.findOne({
      where: {
        post_id: fixedUrl
      }
    })
  }
}

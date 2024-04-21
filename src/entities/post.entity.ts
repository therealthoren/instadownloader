import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity("Post")
export class Post {
  /**
   * this decorator will help to auto generate id for the table.
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80, unique: true})
  post_id: string;

  @Column({ type: 'varchar', length: 1000 })
  text: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  created_at: Date;

  @Column({ type: 'varchar', length: 500 })
  download_url: string;

  @Column({ type: 'boolean', default: false })
  downloaded: boolean;

  @Column({ type: 'int', nullable: true })
  num_of_images: number;
  @Column({ type: 'int', nullable: true })
  num_of_videos: number;
  @Column({ type: 'int', nullable: true })
  num_of_carousel_media: number;

  @Column({ type: 'json', nullable: true })
  video_version: any

  @Column({ type: 'json', nullable: true })
  image_versions: any

  @Column({ type: 'json', nullable: true })
  carousel_media: any
}

import { Injectable } from '@nestjs/common';
import {IMediaSystemInterface, MediaSystemDownloadPromise} from "../IMediaSystemInterface";
import fs from "fs";
import stream from "node:stream";
const fs_1 = require("fs");

@Injectable()
export class FileSystemService  implements IMediaSystemInterface {

  onModuleInit() {

    fs_1.mkdirSync('./images', { recursive: true });

  }

  saveFile(name: string): Promise<stream.Writable> {
    const writer = fs_1.createWriteStream('./images/' + name);
    return Promise.resolve(writer);
  }

  exists(filename: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      fs_1.access('./images/' + filename, fs_1.constants.F_OK, (err) => {
        if (err) {
          return resolve(false);
        }
        return resolve(true);
      })
    });
  }

  download(fixedUrl: any, isImage: boolean): Promise<MediaSystemDownloadPromise> {
    return new Promise((resolve, reject) => {
      try {
        const fullPath = `/${fixedUrl}`;
        const contentType = isImage ? "image/jpeg" : "video/mp4";
        return resolve({
          contentType,
          send: (response: any) => {
            const file = fs_1.createReadStream("./images/"+fullPath);
            file.pipe(response);
          }
        })
      }
      catch(e) {
        reject(e);
      }
    });
  }
}

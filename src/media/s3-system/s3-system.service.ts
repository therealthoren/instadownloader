import { Injectable } from '@nestjs/common';
import {IMediaSystemInterface} from "../IMediaSystemInterface";
import stream from "node:stream";

@Injectable()
export class S3SystemService implements IMediaSystemInterface {
    saveFile(name: string): Promise<stream.Writable> {
        throw new Error('Method not implemented.');
    }

    download(fixedUrl: any, isImage: boolean): Promise<any> {
        throw new Error('Method not implemented.');
    }

    exists(filename: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

}

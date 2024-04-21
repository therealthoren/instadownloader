import stream from "node:stream";

export const MEDIA_SERVICE = 'MEDIA_SERVICE';

export interface MediaSystemDownloadPromise {
  contentType: string;
  send(response: any): void;
}

export interface IMediaSystemInterface {

  saveFile(name: string): Promise<stream.Writable>;
  download(name: any, isImage: boolean): Promise<MediaSystemDownloadPromise>;

  exists(filename: string): Promise<boolean>;
}
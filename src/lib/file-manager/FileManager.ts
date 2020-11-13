import { S3Strategy } from "./S3Strategy"
import property from "../../../property.json"
import fs from "fs";
import { PutObjectRequest } from "aws-sdk/clients/s3";
import propertyConfigs from "../../config/propertyConfig";


interface FileManagerOptions {
  type: string,
  awsConfigPath?: string,
  localPath?: string,
  s3Bucket?: string
}

class FileManager {

  private static _instance: FileManager;

  type: string
  awsConfigPath?: string
  localPath?: string

  s3Strategy: S3Strategy

  constructor(options:FileManagerOptions) {
    this.type = options.type;
    if(options.awsConfigPath) { this.awsConfigPath = options.awsConfigPath; }
    if(options.localPath) { this.localPath = options.localPath; }

    if(this.type === 's3') {
      this.s3Strategy = new S3Strategy(this.awsConfigPath, options.s3Bucket);
    }
  }

  public static get Instance() {
    if(!this._instance) {
      const config = propertyConfigs.uploadDist
      this._instance = new FileManager({
        type: config.type,
        awsConfigPath: config.awsConfigPath,
        localPath: config.localPath,
        s3Bucket: config.s3Bucket
      });
    }
    return this._instance;
  }

  async saveFile(path: string, file: Buffer) {
    return await this.s3Strategy.saveFile(path, file);
  }

  saveStream(path: string) {
    return this.s3Strategy.saveStream(path);
  }

  async downloadFile(path: string) {
    return await this.s3Strategy.loadFile(path);
  }

}

export default FileManager;
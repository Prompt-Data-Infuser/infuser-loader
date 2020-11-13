import * as AWS from 'aws-sdk';
import { GetObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import fs from "fs";
import { Readable } from 'typeorm/platform/PlatformTools';
import * as stream from "stream";

export class S3Strategy {
  s3: AWS.S3
  bucket: string
  constructor(configPath: string, bucket: string) {
    AWS.config.loadFromPath(configPath);
    this.bucket = bucket;
    this.s3 = new AWS.S3;
  }

  saveFile = async (path:string, file: Buffer):Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const objReq: PutObjectRequest = {
          Bucket: this.bucket,
          Key: path,
          Body: file
        }
  
        this.s3.upload(objReq, function (err, data) {
          if (err) { reject(err); }
          else { resolve(data.Key); }
        })
      } catch (err) {
        reject(err);
      }
    })
  }

  loadFile = async (path: string):Promise<Readable> => {
    return new Promise(async (resolve, reject) => {
      try {
        const objReq: GetObjectRequest = {
          Bucket: this.bucket,
          Key: path
        }
        const stream = this.s3.getObject(objReq).createReadStream();
        resolve(stream);
      } catch (err) {
        reject(err);
      }
    })
  }

  saveStream = (path: string) => {
    const Body = new stream.PassThrough();

    this.s3.upload({
      Bucket: this.bucket,
      Key: path,
      Body
    })
    .on('httpUploadProgress', progress => {
        // console.log('progress', progress);
    })
    .send((err, data) => {
      if (err) {
        Body.destroy(err);
      } else {
        // console.log(`File uploaded and available at ${data.Location}`);
        Body.destroy();
      }
    });

    return Body;
  }
}
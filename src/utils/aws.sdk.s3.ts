import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { AWS_S3Keys } from "../config/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Request } from "express";
import { Upload } from "@aws-sdk/lib-storage";
import { CustomError } from "./errorHandling";

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        folder?: string;
      }
    }
  }
}

export default class S3Instance {
  private s3: S3Client;
  constructor() {
    this.s3 = new S3Client({
      region: AWS_S3Keys.REGION,
      endpoint: AWS_S3Keys.ENDPOINT_URL,
      credentials: {
        accessKeyId: AWS_S3Keys.ACCESS_KEY ?? "",
        secretAccessKey: AWS_S3Keys.SECRET_KEY ?? "",
      },
    });
  }

  async createBucket(bucketName: string) {
    // create bucket
    return await this.s3.send(new CreateBucketCommand({ Bucket: bucketName }));
  }

  async deleteBucket(bucketName: string) {
    return await this.s3.send(new DeleteBucketCommand({ Bucket: bucketName }));
  }

  async getFileUrlToUpload(fileName: string, expireIn: number = 3600) {
    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: AWS_S3Keys.BUCKET_NAME,
        Key: fileName,
      }),
      { expiresIn: expireIn }
    );
    console.log(`🔗 Signed URL: ${url}`);
    return url;
  }

  async uploadLargeFile(file: Express.Multer.File) {
    if (!file.folder) {
      return new CustomError("Folder folder and uniqueName is required", 400);
    }

    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: AWS_S3Keys.BUCKET_NAME,
        Key: file.folder,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      },
      partSize: 10 * 1024 * 1024, // 10 MB
    });

    upload.on("httpUploadProgress", (progress) => {
      console.log(`📤 Progress: ${progress.loaded} / ${progress.total}`);
      console.log(`🚀 key : ${progress.Key} , part : ${progress.part}`);
    });

    const response = await upload.done();

    if (response.$metadata.httpStatusCode !== 200)
      return new CustomError("Failed to upload file", 500);
    console.log("✅ Large file uploaded successfully!");
    return response;
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file.folder) {
      return new CustomError("Folder folder and uniqueName is required", 400);
    }

    const response = await this.s3.send(
      new PutObjectCommand({
        Bucket: AWS_S3Keys.BUCKET_NAME,
        Key: file.folder,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      })
    );

    if (response.$metadata.httpStatusCode !== 200)
      return new CustomError("Failed to upload file", 500);
    console.log("✅ File uploaded successfully!");
    return response;
  }

  async uploadMultipleFiles(files: Array<Express.Multer.File>) {
    const uploadePromises = files.map((file) => {
      return this.uploadFile(file);
    });

    return Promise.all(uploadePromises);
  }

  async deleteFile(key: string) {
    const response = await this.s3.send(
      new DeleteObjectCommand({
        Bucket: AWS_S3Keys.BUCKET_NAME,
        Key: key,
      })
    );

    if (response.$metadata.httpStatusCode !== 204)
      return new CustomError("Failed to delete file", 500);
    console.log("✅ File deleted successfully!");
    return response;
  }

  async deleteFiles(keys: Array<string>) {
    const deletePromises = keys.map(async (key: string) => {
      return this.deleteFile(key);
    });
    return await Promise.all(deletePromises);
  }

  async getFile(key: string) {
    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: AWS_S3Keys.BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 3 * 3600 } // 3 hour
    );

    console.log("✅ Signed URL generated successfully!");
    return url;
  }

  async getFiles(keys: Array<string>) {
  const filePromises = keys.map((key) => this.getFile(key));
  const results = await Promise.allSettled(filePromises);

  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as PromiseFulfilledResult<string>).value);
  }
}

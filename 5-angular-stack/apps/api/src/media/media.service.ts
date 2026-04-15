import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    this.bucket = this.config.getOrThrow<string>('S3_BUCKET');
    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION') ?? 'us-east-1',
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async createPresignedUpload(mimeType: string, sizeBytes: number) {
    const key = `uploads/${randomUUID()}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
      ContentLength: sizeBytes,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    const publicBase = this.config.get<string>('S3_PUBLIC_BASE_URL') ?? '';
    const url = publicBase ? `${publicBase.replace(/\/$/, '')}/${key}` : uploadUrl.split('?')[0];
    return { uploadUrl, key, publicUrl: url };
  }

  async finalize(key: string, mimeType: string, sizeBytes: number, altText?: string) {
    const publicBase = this.config.get<string>('S3_PUBLIC_BASE_URL') ?? '';
    const url = `${publicBase.replace(/\/$/, '')}/${key}`;
    return this.prisma.mediaAsset.create({
      data: {
        key,
        url,
        mimeType,
        sizeBytes,
        altText,
      },
    });
  }

  list() {
    return this.prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }
}

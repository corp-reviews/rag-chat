// src/lib/s3ListFiles.js
import { get } from 'svelte/store';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { accessKeyId, secretAccessKey, region, bucketName } from '../stores/env';

export async function listFilesFromS3() {
    const s3Client = new S3Client({
        region: get(region),
        credentials: {
            accessKeyId: get(accessKeyId),
            secretAccessKey: get(secretAccessKey)
        }
    });

    const params = {
        Bucket: get(bucketName),
    };

    try {
        const command = new ListObjectsV2Command(params);
        const data = await s3Client.send(command);
        const files = data.Contents.filter(file => file.Key.endsWith('.pdf')).map(async file => {
            const getObjectCommand = new GetObjectCommand({
                Bucket: get(bucketName),
                Key: file.Key
            });
            const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 }); // URL valid for 1 hour
            return {
                name: file.Key,
                url
            };
        });

        return await Promise.all(files);
    } catch (error) {
        console.error('Error listing files:', error);
        return [];
    }
}

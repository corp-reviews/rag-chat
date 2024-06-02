// src/lib/s3ListFiles.js
import { get } from 'svelte/store';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
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
        return data.Contents.filter(file => file.Key.endsWith('.pdf')).map(file => file.Key);
    } catch (error) {
        console.error('Error listing files:', error);
        return [];
    }
}

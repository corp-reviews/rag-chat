// src/lib/s3Upload.js
import { get } from 'svelte/store';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { accessKeyId, secretAccessKey, region, bucketName } from '../stores/env';

export async function uploadFileToS3(file) {
    const s3Client = new S3Client({
        region: get(region),
        credentials: {
            accessKeyId: get(accessKeyId),
            secretAccessKey: get(secretAccessKey)
        }
    });

    const params = {
        Bucket: get(bucketName),
        Key: file.name,
        Body: file,
        ContentType: file.type
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return { success: true };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, message: error.message };
    }
}

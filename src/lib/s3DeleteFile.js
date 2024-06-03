import { get } from 'svelte/store';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { accessKeyId, secretAccessKey, region, bucketName } from '../stores/env';

export async function deleteFileFromS3(fileName) {
    const s3Client = new S3Client({
        region: get(region),
        credentials: {
            accessKeyId: get(accessKeyId),
            secretAccessKey: get(secretAccessKey)
        }
    });

    const params = {
        Bucket: get(bucketName),
        Key: fileName
    };

    try {
        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
        return { success: true };
    } catch (error) {
        console.error('Error deleting file:', error);
        return { success: false, message: error.message };
    }
}

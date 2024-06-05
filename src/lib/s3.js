// src/lib/s3.js
import { get } from 'svelte/store';
import { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { accessKeyId, secretAccessKey, region, bucketName } from '../stores/env';

const s3Client = new S3Client({
    region: get(region),
    credentials: {
        accessKeyId: get(accessKeyId),
        secretAccessKey: get(secretAccessKey)
    }
});

export async function listFilesFromS3() {
    const params = { Bucket: get(bucketName) };
    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);

    if (!data.Contents) return [];

    const files = data.Contents.filter(file => file.Key.toLowerCase().endsWith('.pdf')).map(async file => {
        const getObjectCommand = new GetObjectCommand({ Bucket: get(bucketName), Key: file.Key });
        const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 });
        return { name: file.Key, url };
    });

    return await Promise.all(files);
}

export async function deleteFileFromS3(fileName) {
    const params = { Bucket: get(bucketName), Key: fileName };
    const command = new DeleteObjectCommand(params);
    try {
        await s3Client.send(command);
        return { success: true };
    } catch (error) {
        console.error('Error deleting file:', error);
        return { success: false, message: error.message };
    }
}

export async function uploadFileToS3(file) {
    const params = {
        Bucket: get(bucketName),
        Key: file.name,
        Body: file,
        ContentType: file.type
    };
    const command = new PutObjectCommand(params);
    try {
        await s3Client.send(command);
        return { success: true };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, message: error.message };
    }
}

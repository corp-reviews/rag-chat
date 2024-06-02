// src/stores/env.js
import { writable } from 'svelte/store';

export const accessKeyId = writable(import.meta.env.VITE_AWS_ACCESS_KEY_ID);
export const secretAccessKey = writable(import.meta.env.VITE_AWS_SECRET_ACCESS_KEY);
export const region = writable(import.meta.env.VITE_AWS_DEFAULT_REGION);
export const bucketName = writable(import.meta.env.VITE_S3_BUCKET_NAME);
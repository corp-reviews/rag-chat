// src/stores/common.js
import { writable } from 'svelte/store';

export const selectedCorpName = writable('');
export const selectedOption = writable('PDFRAG');
export const uploadProgress = writable(0);
export const posting = writable(false);

// src/stores/common.js
import { writable } from 'svelte/store';

export const expanded = writable({});
export const isLoading = writable(false);
export const errorMessage = writable('');
export const deleteProgress = writable(0);
export const deleting = writable(false);
export const currentPage = writable(1);
export const titlesPerPage = 5;
export const totalPages = writable(1);
export const uploadProgress = writable(0);  // 이 줄을 추가

<!-- src/components/PDFRAG/FileUpload.svelte -->
<script>
    import { uploadFileToS3 } from '../../lib/s3';
    import { createEventDispatcher } from 'svelte';
    import { writable } from 'svelte/store';
    import { fetchData } from '../../lib/fetchHelper';
    import ProgressBar from '../common/ProgressBar.svelte';
    import { uploadProgress } from '../../stores/common';

    let selectedFiles = [];
    let uploadedFiles = writable([]);
    let uploadMessage = '', isUploading = false;

    const dispatch = createEventDispatcher();

    const handleFileChange = (event) => selectedFiles = Array.from(event.target.files);

    const handleFileUpload = async () => {
        if (!selectedFiles.length) {
            uploadMessage = '파일을 선택하세요.';
            return;
        }

        isUploading = true;
        uploadMessage = '';
        uploadedFiles.set([]);
        uploadProgress.set(0);

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const result = await uploadFileToS3(file);

            if (result.success) {
                uploadMessage = `${file.name} 업로드 성공!`;
                uploadedFiles.update(files => [...files, file]);

                const reader = new FileReader();
                reader.onload = async () => {
                    const base64File = reader.result.split(',')[1];
                    const response = await fetchData('https://asia-northeast3-chat-corp-reviews.cloudfunctions.net/hello-world', 'POST', { file: base64File, filename: file.name });

                    if (response.error) {
                        console.error('Error uploading to Google Cloud Function:', response.error);
                        dispatch('uploadSuccess', { file: file.name, data: { error: response.error } });
                    } else {
                        console.log('Response from function:', response);
                        dispatch('uploadSuccess', { file: file.name, data: response });
                    }
                };
                reader.readAsDataURL(file);
            } else {
                uploadMessage = `${file.name} 업로드 실패: ${result.message}`;
            }
            uploadProgress.set(((i + 1) / selectedFiles.length) * 100);
        }

        isUploading = false;
        selectedFiles = [];
        document.querySelector('input[type="file"]').value = '';

        setTimeout(() => {
            uploadMessage = '';
            uploadedFiles.set([]);
        }, 2000);

        if (typeof refreshElasticTitles === 'function') {
            await refreshElasticTitles(); // Ensure the refresh is awaited
        }
    };
</script>

<div class="w-full pl-4" {...$$restProps}>
    <input type="file" accept="application/pdf" on:change={handleFileChange} class="mb-4 p-2 border border-gray-300 rounded-md w-full" multiple />
    
    {#if selectedFiles.length > 0}
        <div class="mb-4 max-h-64 overflow-y-auto">
            <p class="text-lg font-semibold">선택된 파일: {selectedFiles.length}개</p>
            <ul class="list-disc list-inside bg-white border border-gray-300 rounded-md p-2">
                {#each selectedFiles as file}
                    <li>{file.name}</li>
                {/each}
            </ul>
        </div>
        <button on:click={handleFileUpload} class="p-2 bg-blue-600 text-white rounded-md w-full" disabled={isUploading} class:opacity-50={isUploading}>
            {isUploading ? '업로드 중...' : '업로드'}
        </button>
    {/if}

    {#if isUploading}
        <ProgressBar progress={$uploadProgress} />
    {/if}

    {#if uploadMessage}
        <div class="mt-4 text-center text-gray-700 whitespace-pre-line">
            {uploadMessage}
        </div>
    {/if}
    {#if $uploadedFiles.length > 0}
        <div class="mt-4 max-h-64 overflow-y-auto">
            <p class="text-lg font-semibold">업로드 완료된 파일: {$uploadedFiles.length}개</p>
            <ul class="list-disc list-inside bg-gray-100 border border-gray-300 rounded-md p-2">
                {#each $uploadedFiles as file}
                    <li>{file.name}</li>
                {/each}
            </ul>
        </div>
    {/if}
</div>

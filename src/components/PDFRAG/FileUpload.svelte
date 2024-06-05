<!-- src/components/FileUpload.svelte -->
<script>
    import { uploadFileToS3 } from '../../lib/s3';
    import { createEventDispatcher } from 'svelte';
    import { writable } from 'svelte/store';

    let selectedFiles = [];
    let uploadedFiles = writable([]);
    let uploadMessage = '';
    let isUploading = false;
    let uploadProgress = writable(0);

    const dispatch = createEventDispatcher();

    const handleFileChange = (event) => {
        selectedFiles = Array.from(event.target.files);
    };

    const handleFileUpload = async () => {
    if (selectedFiles.length > 0) {
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

                // Convert file to base64
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64File = reader.result.split(',')[1];
                    try {
                        const response = await fetch('https://asia-northeast3-chat-corp-reviews.cloudfunctions.net/hello-world', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ file: base64File, filename: file.name }),
                        });

                        const data = await response.json();
                        console.log('Response from function:', data); // 응답 확인 로그 추가
                        dispatch('uploadSuccess', { file: file.name, data });
                    } catch (error) {
                        console.error('Error uploading to Google Cloud Function:', error);
                        dispatch('uploadSuccess', { file: file.name, data: { error: error.message } });
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
        // Ensure dispatch call is not made without details
        // dispatch('uploadSuccess');
        
        setTimeout(() => {
            uploadMessage = '';
            uploadedFiles.set([]);
        }, 2000);
    } else {
        uploadMessage = '파일을 선택하세요.';
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
            {#if isUploading}업로드 중...{/if}
            {#if !isUploading}업로드{/if}
        </button>
    {/if}

    {#if isUploading}
        <div class="w-full bg-gray-200 rounded-full h-4 mt-4">
            <div class="bg-blue-600 h-4 rounded-full" style="width: {$uploadProgress}%;"></div>
        </div>
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
<!-- src/components/FileUpload.svelte -->
<script>
    import { uploadFileToS3 } from '../../lib/s3Upload';
    import { createEventDispatcher } from 'svelte';

    let selectedFiles = [];
    let uploadMessage = '';
    let isUploading = false;

    const dispatch = createEventDispatcher();

    const handleFileChange = (event) => {
        selectedFiles = Array.from(event.target.files);
    };

    const handleFileUpload = async () => {
        if (selectedFiles.length > 0) {
            isUploading = true;
            uploadMessage = '';

            for (let file of selectedFiles) {
                const result = await uploadFileToS3(file);
                if (result.success) {
                    uploadMessage += `${file.name} 업로드 성공!\n`;
                } else {
                    uploadMessage += `${file.name} 업로드 실패: ${result.message}\n`;
                }
            }

            isUploading = false;
            selectedFiles = []; // Reset the selected files
            document.querySelector('input[type="file"]').value = ''; // Clear the file input
            dispatch('uploadSuccess');
        } else {
            uploadMessage = '파일을 선택하세요.';
        }
    };
</script>

<div class="w-3/5 pl-4">
    <input type="file" accept="application/pdf" on:change={handleFileChange} class="mb-4 p-2 border border-gray-300 rounded-md w-full" multiple />
    {#if selectedFiles.length > 0}
        <div class="mb-4">
            <p>선택된 파일: {selectedFiles.length}개</p>
            <ul class="list-disc list-inside">
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
    {#if uploadMessage}
        <div class="mt-4 text-center text-gray-700 whitespace-pre-line">
            {uploadMessage}
        </div>
    {/if}
</div>

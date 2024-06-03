<!-- src/components/FileUpload.svelte -->
<script>
    import { uploadFileToS3 } from '../lib/s3Upload';
    import { createEventDispatcher } from 'svelte';

    let selectedFile = null;
    let uploadMessage = '';
    let fileName = '';
    let isUploading = false;

    const dispatch = createEventDispatcher();

    const handleFileChange = (event) => {
        selectedFile = event.target.files[0];
        fileName = selectedFile ? selectedFile.name : '';
    };

    const handleFileUpload = async () => {
        if (selectedFile) {
            isUploading = true;
            const result = await uploadFileToS3(selectedFile);
            isUploading = false;
            if (result.success) {
                uploadMessage = '파일 업로드 성공!';
                fileName = selectedFile.name; // Store file name
                selectedFile = null; // Reset the selected file
                document.querySelector('input[type="file"]').value = ''; // Clear the file input
                dispatch('uploadSuccess');
            } else {
                uploadMessage = `업로드 실패: ${result.message}`;
            }
        } else {
            uploadMessage = '파일을 선택하세요.';
        }
    };
</script>

<div class="w-3/5 pl-4">
    <input type="file" accept="application/pdf" on:change={handleFileChange} class="mb-4 p-2 border border-gray-300 rounded-md w-full" />
    {#if selectedFile}
        <button on:click={handleFileUpload} class="p-2 bg-blue-600 text-white rounded-md w-full" disabled={isUploading} class:opacity-50={isUploading}>
            {#if isUploading}업로드 중...{/if}
            {#if !isUploading}업로드{/if}
        </button>
    {/if}
    {#if uploadMessage}
        <div class="mt-4 text-center text-gray-700">
            {#if fileName}
                <code class="bg-gray-100 border border-gray-300 rounded px-2 py-1">{fileName}</code> {uploadMessage}
            {/if}
        </div>
    {/if}
</div>

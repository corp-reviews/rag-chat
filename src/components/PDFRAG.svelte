<!-- src/components/PDFRAG.svelte -->
<script>
    import { uploadFileToS3 } from '../lib/s3Upload';
    import { listFilesFromS3 } from '../lib/s3ListFiles';
    import { onMount } from 'svelte';
    import { bucketName } from '../stores/env';

    let selectedFile = null;
    let uploadMessage = '';
    let fileName = '';
    let isUploading = false;
    let files = [];

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
                await loadFiles(); // Reload files after upload
            } else {
                uploadMessage = `업로드 실패: ${result.message}`;
            }
        } else {
            uploadMessage = '파일을 선택하세요.';
        }
    };

    const loadFiles = async () => {
        files = await listFilesFromS3();
    };

    onMount(() => {
        loadFiles();
    });
</script>

<div class="flex flex-col items-center mt-5 w-full max-w-lg px-4">
    <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">PDF-RAG</h1>
        <p class="text-gray-500 text-sm">PDF 파일을 업로드하여 분석하세요.</p>
    </div>
    <div class="w-full flex">
        <div class="w-2/5 border-r pr-2">
            <h2 class="text-xl font-bold mb-4">Uploaded PDF Files</h2>
            <ul class="space-y-2">
                {#each files as file}
                    <li class="text-blue-500 hover:underline cursor-pointer text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1">
                        {file}
                    </li>
                {/each}
            </ul>
        </div>
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
    </div>
</div>

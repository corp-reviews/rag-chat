<!-- src/components/PDFRAG.svelte -->
<script>
    import { uploadFileToS3 } from '../lib/s3Upload';
    import { onMount } from 'svelte';
    import { bucketName } from '../stores/env';

    let selectedFile = null;
    let uploadMessage = '';

    const handleFileChange = (event) => {
        selectedFile = event.target.files[0];
    };

    const handleFileUpload = async () => {
        if (selectedFile) {
            const result = await uploadFileToS3(selectedFile);
            if (result.success) {
                uploadMessage = '파일 업로드 성공!';
            } else {
                uploadMessage = `업로드 실패: ${result.message}`;
            }
        } else {
            uploadMessage = '파일을 선택하세요.';
        }
    };
</script>

<div class="flex flex-col items-center mt-5 w-full max-w-lg px-4">
    <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">PDF-RAG</h1>
        <p class="text-gray-500 text-sm">PDF 파일을 업로드하여 분석하세요.</p>
    </div>
    <div class="w-full">
        <input type="file" accept="application/pdf" on:change={handleFileChange} class="mb-4 p-2 border border-gray-300 rounded-md w-full" />
        <button on:click={handleFileUpload} class="p-2 bg-blue-600 text-white rounded-md w-full">업로드</button>
        {#if uploadMessage}
            <div class="mt-4 text-center text-gray-700">{uploadMessage}</div>
        {/if}
    </div>
</div>

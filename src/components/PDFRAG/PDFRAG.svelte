<!-- src/components/PDFRAG/PDFRAG.svelte -->
<script>
    import FileList from '../PDFRAG/FileList.svelte';
    import ElasticSearchTitles from '../PDFRAG/ElasticSearchTitles.svelte';
    import ShowResponse from '../PDFRAG/ShowResponse.svelte';
    import { writable } from 'svelte/store';

    let fileListRef;
    let responses = writable([]);

    const handleFileAction = async () => {
        if (fileListRef && typeof fileListRef.loadFiles === 'function') {
            await fileListRef.loadFiles();
        } else {
            console.error('fileListRef is not properly bound or loadFiles is not a function');
        }
    }

    const handleUploadSuccess = async (event) => {
        if (event.detail && event.detail.file && event.detail.data) {
            const { file, data } = event.detail;
            console.log('Upload Success:', file, data); // 콘솔 로그 추가
            responses.update(currentResponses => {
                const updatedResponses = [...currentResponses, { file, data }];
                console.log('Updated Responses:', updatedResponses); // 콘솔 로그 추가
                return updatedResponses;
            });
            await handleFileAction(); // 파일 리스트를 새로고침합니다.
        } else {
            console.error('Invalid event detail:', event.detail);
        }
    }
</script>

<div class="flex flex-col items-center mt-5 w-full max-w-2xl px-4">
    <div class="text-center mb-4">
        <h1 class="text-2xl font-bold">PDF-RAG</h1>
        <p class="text-gray-500 text-sm">PDF 파일을 업로드하여 분석하세요.</p>
    </div>
    <FileList class="mb-4" bind:this={fileListRef} on:fileDeleted={handleFileAction} on:uploadSuccess={handleUploadSuccess} />
</div>
<hr class="my-8 w-full border-t-2 border-gray-300" />

<div class="w-full max-w-2xl px-4">
    <ShowResponse {responses} />
</div>

<hr class="my-8 w-full border-t-2 border-gray-300" />

<div class="w-full max-w-2xl px-4 overflow-y-auto" style="max-height: 600px;">
    <ElasticSearchTitles />
</div>

<!-- src/components/PDFRAG/PDFRAG.svelte -->
<script>
    import FileList from '../PDFRAG/FileList.svelte';
    import ShowResponse from '../PDFRAG/ShowResponse.svelte';
    import { writable } from 'svelte/store';

    let fileListRef;
    let responses = writable([]);
    export let refreshElasticTitles;

    const handleFileAction = async () => {
        if (fileListRef && typeof fileListRef.loadFiles === 'function') {
            await fileListRef.loadFiles();
        } else {
            console.error('fileListRef is not properly bound or loadFiles is not a function');
        }
    };

    const handleUploadSuccess = async (event) => {
        if (event.detail && event.detail.file && event.detail.data) {
            const { file, data } = event.detail;
            console.log('Upload Success:', file, data);
            responses.update(currentResponses => {
                const updatedResponses = [...currentResponses, { file, data }];
                console.log('Updated Responses:', updatedResponses);
                return updatedResponses;
            });
            await handleFileAction();
        } else {
            console.error('Invalid event detail:', event.detail);
        }
    };

    const handleRefresh = async () => {
        if (refreshElasticTitles) {
            console.log("Calling refreshElasticTitles function...");
            await refreshElasticTitles();
            console.log("refreshElasticTitles function called successfully.");
        }
    };
</script>

<div class="w-full h-full flex flex-col items-center mt-5 px-4 border-r border-gray-300">
    <div class="text-center mb-4">
        <h1 class="text-2xl font-bold">PDF-RAG</h1>
        <p class="text-gray-500 text-sm">PDF 파일을 업로드하여 분석하세요.</p>
    </div>
    <FileList class="mb-4 border-b border-gray-300" bind:this={fileListRef} on:fileDeleted={handleFileAction} on:uploadSuccess={handleUploadSuccess} />
    <ShowResponse {responses} />
</div>

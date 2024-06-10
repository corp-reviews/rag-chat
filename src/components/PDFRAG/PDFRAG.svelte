<!-- src/components/PDFRAG/PDFRAG.svelte -->
<script>
    import FileList from '../PDFRAG/FileList.svelte';
    import ElasticSearchTitles from '../PDFRAG/ElasticSearchTitles.svelte';
    import ShowResponse from '../PDFRAG/ShowResponse.svelte';
    import { writable } from 'svelte/store';

    let fileListRef;
    let responses = writable([]);
    let refreshElasticTitles;
    let showRefreshButton = writable(false); // Add this state

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
            await handleFileAction(); // 파일 리스트를 새로고침합니다.
            showRefreshButton.set(true); // Show the refresh button
        } else {
            console.error('Invalid event detail:', event.detail);
        }
    };

    const handleRefresh = async () => {
        if (refreshElasticTitles) {
            console.log("Calling refreshElasticTitles function...");
            await refreshElasticTitles();
            console.log("refreshElasticTitles function called successfully.");
            showRefreshButton.set(false); // Hide the refresh button after refresh
        }
    };

    const setRefreshElasticTitles = (refreshFunc) => {
        refreshElasticTitles = refreshFunc;
    };
</script>

<div class="flex flex-row min-h-screen">
    <div class="w-1/4 h-full flex flex-col items-center mt-5 px-4 border-r border-gray-300">
        <div class="text-center mb-4">
            <h1 class="text-2xl font-bold">PDF-RAG</h1>
            <p class="text-gray-500 text-sm">PDF 파일을 업로드하여 분석하세요.</p>
        </div>
        <FileList class="mb-4 border-b border-gray-300" bind:this={fileListRef} on:fileDeleted={handleFileAction} on:uploadSuccess={handleUploadSuccess} />
        <ShowResponse {responses} class="w-full border-b border-gray-300" />
    </div>
    <div class="w-3/4 h-full flex flex-col items-center px-4 border-l border-gray-300">
        <ElasticSearchTitles class="w-full" {setRefreshElasticTitles} />
        {#if $showRefreshButton}
            <button class="mt-4 p-2 bg-blue-600 text-white rounded-md" on:click={handleRefresh}>새로고침</button>
        {/if}
    </div>
</div>

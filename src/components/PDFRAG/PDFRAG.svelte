<!-- src/components/PDFRAG.svelte -->
<script>
    import FileList from '../PDFRAG/FileList.svelte';
    import ElasticSearchTitles from '../PDFRAG/ElasticSearchTitles.svelte';

    let fileListRef;

    const handleFileAction = async () => {
        if (fileListRef && typeof fileListRef.loadFiles === 'function') {
            await fileListRef.loadFiles();
        } else {
            console.error('fileListRef is not properly bound or loadFiles is not a function');
        }
    }
</script>

<div class="flex flex-col items-center mt-5 w-full max-w-2xl px-4">
    <div class="text-center mb-4">
        <h1 class="text-2xl font-bold">PDF-RAG</h1>
        <p class="text-gray-500 text-sm">PDF 파일을 업로드하여 분석하세요.</p>
    </div>
    <FileList class="mb-4" bind:this={fileListRef} on:fileDeleted={handleFileAction} />
</div>

<hr class="my-8 w-full border-t-2 border-gray-300" />

<div class="w-full max-w-2xl px-4 overflow-y-auto" style="max-height: 600px;">
    <ElasticSearchTitles />
</div>

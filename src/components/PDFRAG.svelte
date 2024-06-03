<!-- src/components/PDFRAG.svelte -->
<script>
    import FileUpload from './FileUpload.svelte';
    import FileList from './FileList.svelte';
    import ElasticSearchTitles from './ElasticSearchTitles.svelte';

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
    <div class="flex w-full gap-4">
        <FileList bind:this={fileListRef} on:fileDeleted={handleFileAction} />
        <FileUpload on:uploadSuccess={handleFileAction} />
    </div>
</div>

<hr class="my-8 w-full border-t-2 border-gray-300" />

<ElasticSearchTitles />

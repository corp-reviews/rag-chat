<!-- src/components/PDFRAG.svelte -->
<script>
    import FileUpload from './FileUpload.svelte';
    import FileList from './FileList.svelte';
    import ElasticSearchTitles from './ElasticSearchTitles.svelte';

    const handleFileAction = () => {
        document.querySelector('file-list').loadFiles();
    }
</script>

<div class="flex flex-col items-center mt-5 w-full max-w-lg px-4">
    <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">PDF-RAG</h1>
        <p class="text-gray-500 text-sm">PDF 파일을 업로드하여 분석하세요.</p>
    </div>
    <div class="w-full flex">
        <FileList on:fileDeleted={handleFileAction} />
        <FileUpload on:uploadSuccess={handleFileAction} />
    </div>
</div>

<hr class="my-8 w-full border-t-2 border-gray-300" />

<ElasticSearchTitles />

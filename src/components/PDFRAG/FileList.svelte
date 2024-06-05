<!-- src/components/FileList.svelte -->
<script>
    import { listFilesFromS3, deleteFileFromS3 } from '../../lib/s3';
    import { createEventDispatcher, onMount } from 'svelte';
    import GoToNextFivePagesButton from '../pagination/GoToNextFivePagesButton.svelte';
    import GoToNextPageButton from '../pagination/GoToNextPageButton.svelte';
    import GoToPreviousPageButton from '../pagination/GoToPreviousPageButton.svelte';
    import GoToPreviousFivePagesButton from '../pagination/GoToPreviousFivePagesButton.svelte';
    import FileUpload from '../PDFRAG/FileUpload.svelte';
    import axios from 'axios';
    import { elasticsearchUsername, elasticsearchPassword } from '../../stores/env';

    let files = [];
    let displayedFiles = [];
    let isLoading = true;
    const dispatch = createEventDispatcher();

    let currentPage = 1;
    const filesPerPage = 5;
    let totalPages = 1;

    let deleteProgress = 0;
    let deleting = false;

    export const loadFiles = async () => {
        isLoading = true;
        files = await listFilesFromS3();
        totalPages = Math.ceil(files.length / filesPerPage);
        updateDisplayedFiles();
        isLoading = false;
    };

    const updateDisplayedFiles = () => {
        const start = (currentPage - 1) * filesPerPage;
        const end = start + filesPerPage;
        displayedFiles = files.slice(start, end);
    };

    const handlePageChange = (page) => {
        currentPage = page;
        updateDisplayedFiles();
    };

    const deleteElasticIndexes = async (fileName) => {
        try {
            const username = $elasticsearchUsername;
            const password = $elasticsearchPassword;
            const auth = `Basic ${btoa(`${username}:${password}`)}`;

            const response = await axios.get('https://elasticsearch.corp.reviews:9200/pdf_objects/_search', {
                params: {
                    q: `file:${fileName}`,
                    size: 1000 // fetch a large number initially
                },
                headers: {
                    'Authorization': auth
                }
            });

            if (response.data.hits && response.data.hits.hits) {
                for (const hit of response.data.hits.hits) {
                    await axios.delete(`https://elasticsearch.corp.reviews:9200/pdf_objects/_doc/${hit._id}`, {
                        headers: {
                            'Authorization': auth
                        }
                    });
                }
            }
        } catch (error) {
            console.error('ElasticSearch 인덱스 삭제 중 오류 발생: ' + error.message);
        }
    };

    const handleFileDelete = async (fileName) => {
        if (confirm('업로드한 파일을 삭제하시겠습니까?')) {
            const result = await deleteFileFromS3(fileName);
            if (result.success) {
                await deleteElasticIndexes(fileName); // Delete related ElasticSearch indexes
                await loadFiles(); // Reload files after delete
                dispatch('fileDeleted');
            } else {
                console.error(`파일 삭제 실패: ${result.message}`);
            }
        }
    };

    const handleDeleteAllFiles = async () => {
        if (confirm('파일을 모두 삭제하시겠습니까?')) {
            deleting = true;
            deleteProgress = 0;
            const totalFiles = files.length;
            for (const [index, file] of files.entries()) {
                const result = await deleteFileFromS3(file.name);
                if (result.success) {
                    await deleteElasticIndexes(file.name); // Delete related ElasticSearch indexes
                } else {
                    console.error(`파일 삭제 실패: ${result.message}`);
                }
                deleteProgress = ((index + 1) / totalFiles) * 100;
            }
            await loadFiles(); // Reload files after deleting all
            deleting = false;
            dispatch('allFilesDeleted');
        }
    };

    onMount(() => {
        loadFiles();
    });
</script>

<div class="w-full flex flex-col items-center" {...$$restProps}>
    <FileUpload class="mb-4" on:uploadSuccess={event => dispatch('uploadSuccess', event.detail)} />
    <h2 class="text-xl font-bold mb-4">Uploaded PDF Files</h2>
    {#if isLoading}
        <p>파일 로딩중...</p>
    {:else if files.length === 0}
        <p>No files uploaded yet.</p>
    {:else}
        <div class="flex flex-col items-center w-full max-h-64 overflow-y-auto">
            <ul class="space-y-2 w-full">
                {#each displayedFiles as file}
                    <li class="flex justify-between items-center text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1">
                        <a href={file.url} class="text-blue-500 hover:underline cursor-pointer break-words w-4/5" target="_blank" rel="noopener noreferrer">{file.name}</a>
                        <button on:click={() => handleFileDelete(file.name)} class="text-red-500 hover:text-red-700 ml-2">
                            삭제
                        </button>
                    </li>
                {/each}
            </ul>
            {#if files.length > 0}
                <div class="flex justify-center mt-4">
                    <GoToPreviousFivePagesButton {currentPage} onPageChange={handlePageChange} />
                    <GoToPreviousPageButton {currentPage} onPageChange={handlePageChange} {totalPages} />
                    <span class="px-2 py-1">{currentPage} / {totalPages}</span>
                    <GoToNextPageButton {currentPage} onPageChange={handlePageChange} {totalPages} />
                    <GoToNextFivePagesButton {currentPage} onPageChange={handlePageChange} {totalPages} />
                </div>
                <div class="flex justify-center mt-4">
                    <button on:click={handleDeleteAllFiles} class="text-red-500 hover:text-red-700">
                        모두 삭제
                    </button>
                </div>
                {#if deleting}
                    <div class="w-full bg-gray-200 rounded mt-4">
                        <div class="bg-red-500 text-xs leading-none py-1 text-center text-white" style="width: {deleteProgress}%;">{deleteProgress}%</div>
                    </div>
                {/if}
            {/if}
        </div>
    {/if}
</div>

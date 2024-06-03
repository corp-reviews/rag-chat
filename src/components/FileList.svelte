<!-- src/components/FileList.svelte -->
<script>
    import { listFilesFromS3 } from '../lib/s3ListFiles';
    import { deleteFileFromS3 } from '../lib/s3DeleteFile';
    import { createEventDispatcher, onMount } from 'svelte';
    import GoToNextFivePagesButton from './pagination/GoToNextFivePagesButton.svelte';
    import GoToNextPageButton from './pagination/GoToNextPageButton.svelte';
    import GoToPreviousPageButton from './pagination/GoToPreviousPageButton.svelte';
    import GoToPreviousFivePagesButton from './pagination/GoToPreviousFivePagesButton.svelte';

    let files = [];
    let displayedFiles = [];
    let isLoading = true;
    const dispatch = createEventDispatcher();

    let currentPage = 1;
    const filesPerPage = 5;
    let totalPages = 1;

    // export loadFiles function to be callable from outside
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

    const handleFileDelete = async (fileName) => {
        if (confirm('업로드한 파일을 삭제하시겠습니까?')) {
            const result = await deleteFileFromS3(fileName);
            if (result.success) {
                await loadFiles(); // Reload files after delete
                dispatch('fileDeleted');
            } else {
                console.error(`파일 삭제 실패: ${result.message}`);
            }
        }
    };

    const handleDeleteAllFiles = async () => {
        if (confirm('파일을 모두 삭제하시겠습니까?')) {
            for (const file of files) {
                const result = await deleteFileFromS3(file.name);
                if (!result.success) {
                    console.error(`파일 삭제 실패: ${result.message}`);
                }
            }
            await loadFiles(); // Reload files after deleting all
            dispatch('allFilesDeleted');
        }
    };

    onMount(() => {
        loadFiles();
    });
</script>

<div class="w-2/5 border-r pr-2">
    <h2 class="text-xl font-bold mb-4">Uploaded PDF Files</h2>
    {#if isLoading}
        <p>파일 로딩중...</p>
    
    {:else}
        <ul class="space-y-2">
            {#each displayedFiles as file}
                <li class="flex justify-between items-center text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1">
                    <a href={file.url} class="text-blue-500 hover:underline cursor-pointer break-words w-4/5" target="_blank" rel="noopener noreferrer">{file.name}</a>
                    <button on:click={() => handleFileDelete(file.name)} class="text-red-500 hover:text-red-700 ml-2">
                        삭제
                    </button>
                </li>
            {/each}
        </ul>
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
    {/if}
</div>

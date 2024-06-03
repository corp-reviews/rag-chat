<!-- src/components/FileList.svelte -->
<script>
    import { listFilesFromS3 } from '../lib/s3ListFiles';
    import { deleteFileFromS3 } from '../lib/s3DeleteFile';
    import { createEventDispatcher, onMount } from 'svelte';

    let files = [];
    let isLoading = true;
    const dispatch = createEventDispatcher();

    // export loadFiles function to be callable from outside
    export const loadFiles = async () => {
        isLoading = true;
        files = await listFilesFromS3();
        isLoading = false;
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
            {#each files as file}
                <li class="flex justify-between items-center text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1">
                    <a href={file.url} class="text-blue-500 hover:underline cursor-pointer" target="_blank" rel="noopener noreferrer">{file.name}</a>
                    <button on:click={() => handleFileDelete(file.name)} class="text-red-500 hover:text-red-700 ml-2">
                        삭제
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

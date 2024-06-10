<!-- src/components/PDFRAG/ElasticSearchTitles.svelte -->
<script>
    import { fetchElasticTitles, deleteElasticTitle } from '../../lib/elasticsearch';
    import { onMount } from 'svelte';
    import Pagination from '../pagination/Pagination.svelte';
    import ProgressBar from '../common/ProgressBar.svelte';
    import { writable } from 'svelte/store';
    import { expanded, isLoading, errorMessage, deleteProgress, deleting } from '../../stores/common';

    let elasticTitles = [], displayedTitles = [];
    let currentPage = writable(1), titlesPerPage = 10, totalPages = writable(0);

    export let setRefreshElasticTitles;

    const loadElasticTitles = async () => {
        isLoading.set(true);
        try {
            elasticTitles = await fetchElasticTitles();
            totalPages.set(Math.ceil(elasticTitles.length / titlesPerPage));
            updateDisplayedTitles();
        } catch (error) {
            errorMessage.set(error.message);
        }
        isLoading.set(false);
    };

    const updateDisplayedTitles = () => {
        const start = ($currentPage - 1) * titlesPerPage;
        displayedTitles = elasticTitles.slice(start, start + titlesPerPage);
    };

    const handlePageChange = (page) => {
        currentPage.set(page);
        updateDisplayedTitles();
    };

    const handleTitleDelete = async (id) => {
        if (confirm('이 항목을 삭제하시겠습니까?')) {
            try {
                await deleteElasticTitle(id);
                await loadElasticTitles();
            } catch (error) {
                console.error('삭제 중 오류 발생: ' + error.message);
            }
        }
    };

    const handleDeleteAllTitles = async () => {
        if (confirm('모든 항목을 삭제하시겠습니까?')) {
            deleting.set(true);
            deleteProgress.set(0);
            try {
                for (const [index, title] of elasticTitles.entries()) {
                    await deleteElasticTitle(title.id);
                    deleteProgress.set(((index + 1) / elasticTitles.length) * 100);
                }
                setTimeout(async () => {
                    await loadElasticTitles();
                }, 500); // 0.5초 지연 후 제목 리프레시
            } catch (error) {
                console.error('모두 삭제 중 오류 발생: ' + error.message);
            }
            deleting.set(false);
        }
    };

    const toggleDetails = (id) => {
        expanded.update(current => ({ ...current, [id]: !current[id] }));
    };

    onMount(() => {
        loadElasticTitles();
        if (typeof setRefreshElasticTitles === 'function') setRefreshElasticTitles(loadElasticTitles);
    });
</script>

<div class="flex flex-col items-center mt-5 w-full max-w-2xl px-4 overflow-y-auto" style="max-height: 600px;">
    <h2 class="text-xl font-bold mb-4">ElasticSearch Titles</h2>
    {#if $errorMessage}
        <p class="text-red-500">{$errorMessage}</p>
    {/if}
    {#if $isLoading}
        <p>로딩 중...</p>
    {:else if displayedTitles.length === 0}
        <p>표시할 제목이 없습니다.</p>
    {:else}
        <ul class="w-full space-y-2">
            {#each displayedTitles as { id, title, source }}
                <li class="flex flex-col justify-between items-start p-2 border border-gray-300 rounded bg-gray-100 mb-2">
                    <div class="flex justify-between items-center w-full">
                        <span>{title}</span>
                        <div>
                            <button type="button" aria-expanded={$expanded[id]} on:click={() => toggleDetails(id)} class="ml-2">
                                {#if $expanded[id]} ▼ {:else} ▶ {/if}
                            </button>
                            <button on:click={() => handleTitleDelete(id)} class="text-red-500 hover:text-red-700 ml-2">삭제</button>
                        </div>
                    </div>
                    {#if $expanded[id]}
                        <pre class="bg-gray-200 p-2 rounded mt-2 text-xs overflow-x-auto">{JSON.stringify(source, null, 2)}</pre>
                    {/if}
                </li>
            {/each}
        </ul>
        <Pagination bind:currentPage={$currentPage} bind:totalPages={$totalPages} onPageChange={handlePageChange} />
        <div class="flex justify-center mt-4">
            <button on:click={handleDeleteAllTitles} class="text-red-500 hover:text-red-700">모두 삭제</button>
        </div>
        {#if $deleting}
            <ProgressBar progress={$deleteProgress} />
        {/if}
    {/if}
</div>

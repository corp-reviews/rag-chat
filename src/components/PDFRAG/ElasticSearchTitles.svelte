<!-- src/components/ElasticSearchTitles.svelte -->
<script>
    import { elasticsearchUsername, elasticsearchPassword } from '../../stores/env';
    import axios from 'axios';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import GoToNextFivePagesButton from '../pagination/GoToNextFivePagesButton.svelte';
    import GoToNextPageButton from '../pagination/GoToNextPageButton.svelte';
    import GoToPreviousPageButton from '../pagination/GoToPreviousPageButton.svelte';
    import GoToPreviousFivePagesButton from '../pagination/GoToPreviousFivePagesButton.svelte';

    let elasticTitles = [];
    let displayedTitles = [];
    let errorMessage = '';
    const expanded = writable({});

    let currentPage = 1;
    const titlesPerPage = 5;
    let totalPages = 1;
    let isLoading = true;

    let deleteProgress = 0;
    let deleting = false;

    const fetchElasticTitles = async () => {
        isLoading = true;
        try {
            const username = $elasticsearchUsername;
            const password = $elasticsearchPassword;
            const auth = `Basic ${btoa(`${username}:${password}`)}`;

            const response = await axios.get('https://elasticsearch.corp.reviews:9200/pdf_objects/_search', {
                params: {
                    q: '*',
                    size: 1000 // fetch a large number initially
                },
                headers: {
                    'Authorization': auth
                }
            });

            if (response.data.hits && response.data.hits.hits) {
                elasticTitles = response.data.hits.hits.map(hit => ({
                    id: hit._id,
                    title: hit._source.title ? hit._source.title : 'No Title',
                    source: hit._source
                }));
                totalPages = Math.ceil(elasticTitles.length / titlesPerPage);
                updateDisplayedTitles();
            } else {
                errorMessage = '응답 데이터 구조가 예상과 다릅니다.';
            }
        } catch (error) {
            errorMessage = '엘라스틱서치 데이터 로드 중 오류 발생: ' + error.message;
        }
        isLoading = false;
    };

    const updateDisplayedTitles = () => {
        const start = (currentPage - 1) * titlesPerPage;
        const end = start + titlesPerPage;
        displayedTitles = elasticTitles.slice(start, end);
    };

    const handlePageChange = (page) => {
        currentPage = page;
        updateDisplayedTitles();
    };

    const handleTitleDelete = async (id) => {
        if (confirm('이 항목을 삭제하시겠습니까?')) {
            try {
                const username = $elasticsearchUsername;
                const password = $elasticsearchPassword;
                const auth = `Basic ${btoa(`${username}:${password}`)}`;

                await axios.delete(`https://elasticsearch.corp.reviews:9200/pdf_objects/_doc/${id}`, {
                    headers: {
                        'Authorization': auth
                    }
                });
                await fetchElasticTitles();
            } catch (error) {
                console.error('삭제 중 오류 발생: ' + error.message);
            }
        }
    };

    const handleDeleteAllTitles = async () => {
        if (confirm('모든 항목을 삭제하시겠습니까?')) {
            deleting = true;
            deleteProgress = 0;
            const totalTitles = elasticTitles.length;
            try {
                const username = $elasticsearchUsername;
                const password = $elasticsearchPassword;
                const auth = `Basic ${btoa(`${username}:${password}`)}`;

                for (const [index, title] of elasticTitles.entries()) {
                    await axios.delete(`https://elasticsearch.corp.reviews:9200/pdf_objects/_doc/${title.id}`, {
                        headers: {
                            'Authorization': auth
                        }
                    });
                    deleteProgress = ((index + 1) / totalTitles) * 100;
                }
                await fetchElasticTitles();
            } catch (error) {
                console.error('모두 삭제 중 오류 발생: ' + error.message);
            }
            deleting = false;
        }
    };

    const toggleDetails = (id) => {
        expanded.update(current => ({
            ...current,
            [id]: !current[id]
        }));
    };

    onMount(() => {
        fetchElasticTitles();
    });
</script>

<div class="flex flex-col items-center mt-5 w-full max-w-2xl px-4 overflow-y-auto" style="max-height: 600px;">
    <h2 class="text-xl font-bold mb-4">ElasticSearch Titles</h2>
    {#if errorMessage}
        <p class="text-red-500">{errorMessage}</p>
    {/if}
    {#if isLoading}
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
        <div class="flex justify-center mt-4">
            <GoToPreviousFivePagesButton {currentPage} onPageChange={handlePageChange} />
            <GoToPreviousPageButton {currentPage} onPageChange={handlePageChange} {totalPages} />
            <span class="px-2 py-1">{currentPage} / {totalPages}</span>
            <GoToNextPageButton {currentPage} onPageChange={handlePageChange} {totalPages} />
            <GoToNextFivePagesButton {currentPage} onPageChange={handlePageChange} {totalPages} />
        </div>
        <div class="flex justify-center mt-4">
            <button on:click={handleDeleteAllTitles} class="text-red-500 hover:text-red-700">
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

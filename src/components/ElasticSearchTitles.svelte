<!-- src/components/ElasticSearchTitles.svelte -->
<script>
    import { elasticsearchUsername, elasticsearchPassword } from '../stores/env';
    import axios from 'axios';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    let elasticTitles = [];
    let errorMessage = '';
    const expanded = writable({});

    const fetchElasticTitles = async () => {
        try {
            const username = $elasticsearchUsername;
            const password = $elasticsearchPassword;
            const auth = `Basic ${btoa(`${username}:${password}`)}`;

            const response = await axios.get('https://elasticsearch.corp.reviews:9200/pdf_objects/_search', {
                params: {
                    q: '*',
                    size: 10
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
            } else {
                errorMessage = '응답 데이터 구조가 예상과 다릅니다.';
            }
        } catch (error) {
            errorMessage = '엘라스틱서치 데이터 로드 중 오류 발생: ' + error.message;
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

<div class="flex flex-col items-center mt-5 w-full max-w-2xl px-4 overflow-y-auto">
    <h2 class="text-xl font-bold mb-4">ElasticSearch Titles</h2>
    {#if errorMessage}
        <p class="text-red-500">{errorMessage}</p>
    {/if}
    <ul class="w-full space-y-2">
        {#each elasticTitles as { id, title, source }}
            <li class="flex flex-col justify-between items-start p-2 border border-gray-300 rounded bg-gray-100 mb-2">
                <div class="flex justify-between items-center w-full">
                    <span>{title}</span>
                    <button type="button" aria-expanded={$expanded[id]} on:click={() => toggleDetails(id)} class="ml-2">
                        {#if $expanded[id]} ▼ {:else} ▶ {/if}
                    </button>
                </div>
                {#if $expanded[id]}
                    <pre class="bg-gray-200 p-2 rounded mt-2 text-xs overflow-x-auto">{JSON.stringify(source, null, 2)}</pre>
                {/if}
            </li>
        {/each}
    </ul>
</div>

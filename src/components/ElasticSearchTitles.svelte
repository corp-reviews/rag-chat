<!-- src/components/ElasticSearchTitles.svelte -->
<script>
    import { elasticsearchUsername, elasticsearchPassword } from '../stores/env';
    import axios from 'axios';
    import { onMount } from 'svelte';

    let elasticTitles = [];
    let errorMessage = '';

    const fetchElasticTitles = async () => {
        try {
            const username = $elasticsearchUsername;
            const password = $elasticsearchPassword;
            const auth = `Basic ${btoa(`${username}:${password}`)}`;

            const response = await axios.get('https://elasticsearch.corp.reviews:9200/pdf_objects/_search', {
                params: {
                    q: '*',
                    size: 10,
                    _source: 'title'
                },
                headers: {
                    'Authorization': auth
                }
            });

            if (response.data.hits && response.data.hits.hits) {
                elasticTitles = response.data.hits.hits.map(hit => {
                    if (hit._source) {
                        return hit._source.title ? hit._source.title : 'No Title';
                    } else {
                        return 'No Title';
                    }
                });
            } else {
                errorMessage = '응답 데이터 구조가 예상과 다릅니다.';
            }
        } catch (error) {
            errorMessage = '엘라스틱서치 데이터 로드 중 오류 발생: ' + error.message;
        }
    };

    onMount(() => {
        fetchElasticTitles();
    });
</script>

<div class="flex flex-col items-center mt-5 w-full max-w-lg px-4">
    <h2 class="text-xl font-bold mb-4">ElasticSearch Titles</h2>
    {#if errorMessage}
        <p class="text-red-500">{errorMessage}</p>
    {/if}
    <ul class="space-y-2">
        {#each elasticTitles as title}
            <li class="text-gray-700 text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1">
                {title}
            </li>
        {/each}
    </ul>
</div>

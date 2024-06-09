<!-- src/components/PDFRAG/ShowResponse.svelte -->
<script>
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { elasticsearchUsername, elasticsearchPassword } from '../../stores/env';

    export let responses = writable([]);
    export let refreshElasticTitles;

    let responseList = [], expanded = {}, username, password;
    const posting = writable(false);

    elasticsearchUsername.subscribe(value => username = value);
    elasticsearchPassword.subscribe(value => password = value);

    const toggleDetails = (file) => expanded = { ...expanded, [file]: !expanded[file] };

    const groupParagraphs = (response) => {
        if (!response.data?.pages) return response;

        const groupedData = [], currentParagraph = [];
        response.data.pages.forEach(page => {
            if (!page.objects) return;

            page.objects.forEach(item => {
                if (item.bbox) {
                    if (currentParagraph.length === 0 || item.bbox.top === currentParagraph[0].bbox.top) {
                        currentParagraph.push(item);
                    } else {
                        groupedData.push(createParagraph(response, page, currentParagraph));
                        currentParagraph.length = 0;
                        currentParagraph.push(item);
                    }
                } else {
                    if (currentParagraph.length > 0) groupedData.push(createParagraph(response, page, currentParagraph));
                    groupedData.push(createItem(response, page, item));
                    currentParagraph.length = 0;
                }
            });
            if (currentParagraph.length > 0) groupedData.push(createParagraph(response, page, currentParagraph));
        });

        postGroupedDataToElasticsearch(groupedData);
        return { ...response, data: groupedData };
    };

    const createParagraph = (response, page, currentParagraph) => ({
        file: response.file,
        page: page.page,
        type: currentParagraph[0].Type,
        index: response.data.length + 1,
        text: currentParagraph.map(i => i.Text).join(' '),
        bbox: currentParagraph[0].bbox
    });

    const createItem = (response, page, item) => ({
        file: response.file,
        page: page.page,
        type: item.Type,
        index: response.data.length + 1,
        text: item.Text,
        bbox: item.bbox
    });

    const postGroupedDataToElasticsearch = async (groupedData) => {
        posting.set(true);
        try {
            const auth = `Basic ${btoa(`${username}:${password}`)}`;
            await Promise.all(groupedData.map(item => axios.post(
                'https://elasticsearch.corp.reviews:9200/pdf_objects/_doc/',
                item,
                { headers: { 'Content-Type': 'application/json', 'Authorization': auth } }
            )));
            if (refreshElasticTitles) refreshElasticTitles();
        } catch (error) {
            console.error('Elasticsearch POST 실패:', error);
        } finally {
            posting.set(false);
        }
    };

    onMount(() => {
        responses.subscribe(value => {
            responseList = value.map(groupParagraphs);
            value.forEach(response => expanded[response.file] ??= false);
        });
    });
</script>

<div class="mt-4 w-full max-w-2xl mx-auto max-h-96 overflow-y-auto">
    {#if $posting}
        <div class="text-center p-4 bg-yellow-200">POST 중...</div>
    {/if}
    {#if responseList.length > 0}
        <ul class="w-full space-y-2">
            {#each responseList as response (response.file)}
                <li class="flex flex-col justify-between items-start p-2 border border-gray-300 rounded bg-gray-100 mb-2">
                    <div class="flex justify-between items-center w-full break-words">
                        <span>{response.file}</span>
                        <button type="button" aria-expanded={expanded[response.file]} on:click={() => toggleDetails(response.file)} class="ml-2">
                            {#if expanded[response.file]} ▼ {:else} ▶ {/if}
                        </button>
                    </div>
                    {#if expanded[response.file]}
                        <pre class="max-h-48 overflow-y-auto bg-gray-200 p-2 rounded mt-2 text-xs overflow-x-scroll break-words">
                            {JSON.stringify(response.data, null, 2)}
                        </pre>
                    {/if}
                </li>
            {/each}
        </ul>
    {:else}
        <p>No responses available.</p>
    {/if}
</div>

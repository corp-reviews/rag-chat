<!-- src/components/PDFRAG/ShowResponse.svelte -->
<script>
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { elasticsearchUsername, elasticsearchPassword } from '../../stores/env'; // 인증 정보 가져오기

    export let responses = writable([]);
    export let refreshElasticTitles; // ElasticSearchTitles 새로고침 함수

    let responseList = [];
    let expanded = {};
    let posting = writable(false); // POST 상태 관리

    let username, password;

    elasticsearchUsername.subscribe(value => username = value);
    elasticsearchPassword.subscribe(value => password = value);

    const toggleDetails = (file) => {
        expanded = { ...expanded, [file]: !expanded[file] };
    };

    onMount(() => {
        responses.subscribe(value => {
            console.log('Responses Updated in ShowResponse:', value);
            responseList = value.map(groupParagraphs);
            value.forEach(response => {
                if (!(response.file in expanded)) {
                    expanded = { ...expanded, [response.file]: false };
                }
            });
        });
    });

    const groupParagraphs = (response) => {
        console.log('groupParagraphs 함수 호출:', response); // 함수 호출 확인
        if (!response.data || !Array.isArray(response.data.pages)) {
            console.log('Invalid response data:', response.data); // 데이터 유효성 확인
            return response;
        }

        const groupedData = [];

        for (const page of response.data.pages) {
            if (!page.objects || !Array.isArray(page.objects)) {
                console.log('Invalid page data:', page); // 페이지 데이터 유효성 확인
                continue;
            }
            let currentParagraph = [];
            for (const item of page.objects) {
                if (item.bbox) {
                    if (currentParagraph.length === 0 || item.bbox.top === currentParagraph[0].bbox.top) {
                        currentParagraph.push(item);
                    } else {
                        groupedData.push({
                            file: response.file,
                            page: page.page,
                            type: currentParagraph[0].Type,
                            index: groupedData.length + 1,
                            text: currentParagraph.map(i => i.Text).join(' '),
                            bbox: currentParagraph[0].bbox
                        });
                        currentParagraph = [item];
                    }
                } else {
                    if (currentParagraph.length > 0) {
                        groupedData.push({
                            file: response.file,
                            page: page.page,
                            type: currentParagraph[0].Type,
                            index: groupedData.length + 1,
                            text: currentParagraph.map(i => i.Text).join(' '),
                            bbox: currentParagraph[0].bbox
                        });
                        currentParagraph = [];
                    }
                    groupedData.push({
                        file: response.file,
                        page: page.page,
                        type: item.Type,
                        index: groupedData.length + 1,
                        text: item.Text,
                        bbox: item.bbox
                    });
                }
            }
            if (currentParagraph.length > 0) {
                groupedData.push({
                    file: response.file,
                    page: page.page,
                    type: currentParagraph[0].Type,
                    index: groupedData.length + 1,
                    text: currentParagraph.map(i => i.Text).join(' '),
                    bbox: currentParagraph[0].bbox
                });
                currentParagraph = [];
            }
        }

        console.log('Grouped Data to be POSTed:', groupedData); // groupedData 콘솔에 표시
        postGroupedDataToElasticsearch(groupedData);

        return { ...response, data: groupedData };
    };

    const postGroupedDataToElasticsearch = async (groupedData) => {
        posting.set(true);
        try {
            const auth = `Basic ${btoa(`${username}:${password}`)}`;
            for (const item of groupedData) {
                const document = {
                    file: item.file,
                    page: item.page,
                    type: item.type,
                    index: item.index,
                    text: item.text,
                    bbox: item.bbox
                };
                const response = await axios.post('https://elasticsearch.corp.reviews:9200/pdf_objects/_doc/', document, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': auth
                    }
                });
                console.log('Elasticsearch POST 성공:', response.data);
            }
            if (refreshElasticTitles) {
                refreshElasticTitles(); // ElasticSearchTitles 새로고침
            }
        } catch (error) {
            console.error('Elasticsearch POST 실패:', error);
        } finally {
            posting.set(false);
        }
    };
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
                        <div>
                            <button type="button" aria-expanded={expanded[response.file]} on:click={() => toggleDetails(response.file)} class="ml-2">
                                {#if expanded[response.file]} ▼ {:else} ▶ {/if}
                            </button>
                        </div>
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

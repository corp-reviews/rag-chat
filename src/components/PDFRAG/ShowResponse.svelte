<!-- src/components/PDFRAG/ShowResponse.svelte -->
<script>
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { elasticsearchUsername, elasticsearchPassword } from '../../stores/env';
	import { vectorizeText } from '../../lib/vectorize'; // Import vectorizeText

	export let responses = writable([]);
	export let refreshElasticTitles;

	let responseList = [],
		expanded = {},
		username,
		password;
	const posting = writable(false);
	const vectorizing = writable(false); // 추가: vectorize 진행 상태 추적

	elasticsearchUsername.subscribe((value) => (username = value));
	elasticsearchPassword.subscribe((value) => (password = value));

	const toggleDetails = (file) => (expanded = { ...expanded, [file]: !expanded[file] });

	const groupParagraphs = async (response) => {
		if (!response.data?.pages) return response;

		const groupedData = [],
			currentParagraph = [];
		for (const page of response.data.pages) {
			if (!page.objects) continue;

			for (const item of page.objects) {
				if (item.bbox) {
					if (currentParagraph.length === 0 || item.bbox.top === currentParagraph[0].bbox.top) {
						currentParagraph.push(item);
					} else {
						groupedData.push(await createParagraph(response, page, currentParagraph));
						currentParagraph.length = 0;
						currentParagraph.push(item);
					}
				} else {
					if (currentParagraph.length > 0)
						groupedData.push(await createParagraph(response, page, currentParagraph));
					groupedData.push(await createItem(response, page, item));
					currentParagraph.length = 0;
				}
			}
			if (currentParagraph.length > 0)
				groupedData.push(await createParagraph(response, page, currentParagraph));
		}

		await postGroupedDataToElasticsearch(groupedData);
		return { ...response, data: groupedData };
	};

	const createParagraph = async (response, page, currentParagraph) => {
		const text = currentParagraph.map((i) => i.Text).join(' ');
		if (!text.trim()) return; // 텍스트가 비어있으면 반환하지 않음
		vectorizing.set(true); // 추가: vectorize 시작 시 상태 변경
		const vector = await vectorizeText(text); // Vectorize the text
		vectorizing.set(false); // 추가: vectorize 완료 시 상태 변경
		return {
			file: response.file,
			page: page.page,
			type: currentParagraph[0].Type,
			index: response.data.length + 1,
			text,
			vector, // Add vector to the paragraph
			bbox: currentParagraph[0].bbox
		};
	};

	const createItem = async (response, page, item) => {
		const text = item.Text;
		if (!text.trim()) return; // 텍스트가 비어있으면 반환하지 않음
		vectorizing.set(true); // 추가: vectorize 시작 시 상태 변경
		const vector = await vectorizeText(text); // Vectorize the text
		vectorizing.set(false); // 추가: vectorize 완료 시 상태 변경
		return {
			file: response.file,
			page: page.page,
			type: item.Type,
			index: response.data.length + 1,
			text,
			vector, // Add vector to the item
			bbox: item.bbox
		};
	};

    const postGroupedDataToElasticsearch = async (groupedData) => {
        posting.set(true);
        try {
            const auth = `Basic ${btoa(`${username}:${password}`)}`;
            console.log("Calling postGroupedDataToElasticsearch function...");
            await Promise.all(
                groupedData.map(async (item) => {
                    if (!item || !item.text.trim()) return; // 텍스트가 비어있으면 발송하지 않음
                    console.log('Posting to Elasticsearch:', item);
                    await axios.post('https://elasticsearch.corp.reviews:9200/pdf_objects/_doc/', item, {
                        headers: { 'Content-Type': 'application/json', Authorization: auth }
                    });
                    console.log('POST request completed for:', item);
                })
            );
            console.log("All POST requests completed successfully.");
            if (refreshElasticTitles) {
                console.log("Calling refreshElasticTitles function...");
                await refreshElasticTitles(); // 수정: POST 작업이 완료된 후에 ElasticSearchTitles 리프레시
                console.log("refreshElasticTitles function called successfully.");
            }
        } catch (error) {
            console.error('Elasticsearch POST 실패:', error);
            console.log("Error occurred during POST requests:", error);
        } finally {
            posting.set(false);
            console.log("postGroupedDataToElasticsearch function execution completed.");
        }
    };

	onMount(() => {
		responses.subscribe(async (value) => {
			responseList = await Promise.all(value.map(groupParagraphs));
			value.forEach((response) => (expanded[response.file] ??= false));
		});
	});
</script>

<div class="mt-4 w-full max-w-2xl mx-auto max-h-96 overflow-y-auto">
	{#if $posting}
		<div class="text-center p-4 bg-yellow-200">POST 중...</div>
	{/if}
	{#if $vectorizing}
		<div class="text-center p-4 bg-blue-200">입력 데이터 벡터화 진행중...</div>
		<!-- 추가: vectorize 중일 때 표시 -->
	{/if}
	{#if responseList.length > 0}
		<ul class="w-full space-y-2">
			{#each responseList as response (response.file)}
				<li
					class="flex flex-col justify-between items-start p-2 border border-gray-300 rounded bg-gray-100 mb-2"
				>
					<div class="flex justify-between items-center w-full break-words">
						<span>{response.file}</span>
						<button
							type="button"
							aria-expanded={expanded[response.file]}
							on:click={() => toggleDetails(response.file)}
							class="ml-2"
						>
							{#if expanded[response.file]}
								▼
							{:else}
								▶
							{/if}
						</button>
					</div>
					{#if expanded[response.file]}
						<pre
							class="max-h-48 overflow-y-auto bg-gray-200 p-2 rounded mt-2 text-xs overflow-x-scroll break-words">
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

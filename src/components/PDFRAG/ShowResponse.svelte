<!-- src/components/PDFRAG/ShowResponse.svelte -->
<script>
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';

    export let responses = writable([]);

    let responseList = [];
    let expanded = {};

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
        if (!response.data || !Array.isArray(response.data)) {
            return response;
        }

        const groupedData = [];
        let currentParagraph = [];

        for (const item of response.data) {
            if (item.bbox) {
                if (currentParagraph.length === 0 || item.bbox.top === currentParagraph[0].bbox.top) {
                    currentParagraph.push(item);
                } else {
                    groupedData.push({ ...currentParagraph[0], text: currentParagraph.map(i => i.text).join(' ') });
                    currentParagraph = [item];
                }
            } else {
                if (currentParagraph.length > 0) {
                    groupedData.push({ ...currentParagraph[0], text: currentParagraph.map(i => i.text).join(' ') });
                    currentParagraph = [];
                }
                groupedData.push(item);
            }
        }

        if (currentParagraph.length > 0) {
            groupedData.push({ ...currentParagraph[0], text: currentParagraph.map(i => i.text).join(' ') });
        }

        return { ...response, data: groupedData };
    };
</script>

<style>
    .json-container {
        text-align: left;
        white-space: pre-wrap;
    }

    .json-container ul {
        list-style-type: none;
        padding-left: 0;
    }

    .json-container li {
        margin-bottom: 10px;
    }

    .json-container pre {
        background-color: #f0f0f0;
        border-radius: 5px;
        padding: 10px;
        overflow-x: auto;
    }
</style>

<div class="json-container mt-4 w-full max-w-2xl mx-auto max-h-96 overflow-y-auto">
    {#if responseList.length > 0}
        <ul class="w-full space-y-2">
            {#each responseList as response (response.file)}
                <li class="flex flex-col justify-between items-start p-2 border border-gray-300 rounded bg-gray-100 mb-2">
                    <div class="flex justify-between items-center w-full max-w-full break-words">
                        <span>{response.file}</span>
                        <div>
                            <button type="button" aria-expanded={expanded[response.file]} on:click={() => toggleDetails(response.file)} class="ml-2">
                                {#if expanded[response.file]} ▼ {:else} ▶ {/if}
                            </button>
                        </div>
                    </div>
                    {#if expanded[response.file]}
                        <pre class="max-h-48 overflow-y-auto bg-gray-200 p-2 rounded mt-2 text-xs overflow-x-auto break-words">
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

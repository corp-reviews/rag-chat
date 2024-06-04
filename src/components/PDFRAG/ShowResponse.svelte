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
            console.log('Responses Updated in ShowResponse:', value); // 콘솔 로그 추가
            responseList = value;
            value.forEach(response => {
                if (!(response.file in expanded)) {
                    expanded = { ...expanded, [response.file]: false };
                }
            });
        });
    });
</script>

<div class="text-center mt-4">
    {#if responseList.length > 0}
        <ul class="w-full space-y-2">
            {#each responseList as response (response.file)}
                <li class="flex flex-col justify-between items-start p-2 border border-gray-300 rounded bg-gray-100 mb-2">
                    <div class="flex justify-between items-center w-full">
                        <span>{response.file}</span>
                        <div>
                            <button type="button" aria-expanded={expanded[response.file]} on:click={() => toggleDetails(response.file)} class="ml-2">
                                {#if expanded[response.file]} ▼ {:else} ▶ {/if}
                            </button>
                        </div>
                    </div>
                    {#if expanded[response.file]}
                        <pre class="bg-gray-200 p-2 rounded mt-2 text-xs overflow-x-auto">{JSON.stringify(response.data, null, 2)}</pre>
                    {/if}
                </li>
            {/each}
        </ul>
    {:else}
        <p>No responses available.</p>
    {/if}
</div>

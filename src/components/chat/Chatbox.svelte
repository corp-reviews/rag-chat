<!-- src/components/Chatbox.svelte -->
<script>
    import { beforeUpdate, afterUpdate } from 'svelte';
    import ErrorMessage from "../ErrorMessage.svelte";
    export let comments;
    export let errorMessage;

    let div;
    let autoscroll = false;

    beforeUpdate(() => {
        if (div) {
            const scrollableDistance = div.scrollHeight - div.offsetHeight;
            autoscroll = div.scrollTop > scrollableDistance - 20;
        }
    });

    afterUpdate(() => {
        if (autoscroll) {
            div.scrollTo(0, div.scrollHeight);
        }
    });
</script>

<div class="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-white" bind:this={div}>
    {#if errorMessage}
        <ErrorMessage {errorMessage} />
    {/if}
    {#each comments as comment}
        <article class="flex {comment.author === 'user' ? 'justify-end' : 'justify-start'} relative">
            <span class="{comment.author === 'user' ? 'bg-blue-600 text-white rounded-xl ml-16' : 'bg-gray-100 text-gray-800 rounded-xl mr-16'} px-4 py-2 break-words">
                {comment.text}
                {#if comment.author === 'gpt' && comment.model}
                    <span class="block mt-2 text-xs text-gray-500 text-right">{comment.model}</span>
                {/if}
            </span>
        </article>
    {/each}
</div>

<!-- src/components/GoToPreviousFivePagesButton.svelte -->
<script>
    export let currentPage;
    export let onPageChange;
</script>

<button
    class="px-2 py-1 mx-1 rounded disabled:bg-gray-300 disabled:text-gray-500"
    class:bg-blue-500={currentPage > 1}
    class:text-white={currentPage > 1}
    on:click={() => onPageChange(currentPage - 1)}
    disabled={currentPage <= 1}
>
    &lt;
</button>

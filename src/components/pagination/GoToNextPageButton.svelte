<!-- src/components/GoToNextPageButton.svelte -->
<script>
    export let currentPage;
    export let totalPages;
    export let onPageChange;
</script>

<button
    class="px-2 py-1 mx-1 rounded disabled:bg-gray-300 disabled:text-gray-500"
    class:bg-blue-500={currentPage < totalPages}
    class:text-white={currentPage < totalPages}
    on:click={() => onPageChange(currentPage + 1)}
    disabled={currentPage >= totalPages || totalPages <= 1}
>
    &gt;
</button>

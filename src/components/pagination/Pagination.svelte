<!-- src/components/pagination/Pagination.svelte -->
<script>
    import GoToNextFivePagesButton from './GoToNextFivePagesButton.svelte';
    import GoToNextPageButton from './GoToNextPageButton.svelte';
    import GoToPreviousPageButton from './GoToPreviousPageButton.svelte';
    import GoToPreviousFivePagesButton from './GoToPreviousFivePagesButton.svelte';

    export let currentPage;
    export let totalPages;
    export let onPageChange;
</script>

<div class="flex justify-center mt-4">
    <GoToPreviousFivePagesButton {currentPage} onPageChange={onPageChange} />
    <GoToPreviousPageButton {currentPage} onPageChange={onPageChange} {totalPages} />
    <span class="px-2 py-1">{currentPage} / {totalPages}</span>
    <GoToNextPageButton {currentPage} onPageChange={onPageChange} {totalPages} />
    <GoToNextFivePagesButton {currentPage} onPageChange={onPageChange} {totalPages} />
</div>

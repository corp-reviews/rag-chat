<!-- src/components/common/ProgressBar.svelte -->
<script>
    import { writable } from 'svelte/store';
    export let progress = writable(0);
</script>

<div class="w-full bg-gray-200 rounded-full h-4">
    <div class="bg-blue-600 h-4 rounded-full" style="width: {progress}%;"></div>
</div>

<!-- src/components/common/ProgressBar.svelte -->
<script>
    export let progress = 0;
</script>

<div class="w-full bg-gray-200 rounded-full h-4">
    <div class="bg-blue-600 h-4 rounded-full" style="width: {progress}%;"></div>
</div>

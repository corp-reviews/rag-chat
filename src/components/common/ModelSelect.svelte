<!--  -->
<script>
    export let models = [];
    export let selectedModel = '';
</script>

<div class="flex-1 pl-2">
    <label for="model-select" class="block text-sm font-medium text-gray-700">Select Model</label>
    <select
        id="model-select"
        bind:value={selectedModel}
        class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 w-full"
    >
        {#each models as model}
            <option value={model}>{model}</option>
        {/each}
    </select>
</div>

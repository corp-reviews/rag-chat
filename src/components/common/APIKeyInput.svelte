<!-- src/components/common/APIKeyInput.svelte -->
<script>
    import { onMount } from 'svelte';
    export let apiKey = '';

    onMount(() => {
        if (!apiKey) {
            apiKey = import.meta.env.VITE_OPENAI_API_KEY || '기본 키를 사용합니다';
        }
    });
</script>

<div class="flex-1 pr-2">
    <label for="api-key" class="block text-sm font-medium text-gray-700">OpenAI API 키</label>
    <input
        id="api-key"
        type="password"
        bind:value={apiKey}
        class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 w-full"
        placeholder="기본 키를 사용합니다"
        disabled
    />
</div>

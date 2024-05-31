<!-- src/routes/+page.svelte -->
<script>
    import Chatbox from '../components/Chatbox.svelte';
    import ChatInput from '../components/ChatInput.svelte';
    import Header from '../components/Header.svelte';
    import Divider from '../components/Divider.svelte';
    import DBLoader from '../components/DBLoader.svelte';
    import { writable } from 'svelte/store';
  
    let comments = [];
    const typing = { author: 'gpt', text: '...', model: '' };
    let apiKey = '';
    let errorMessage = '';
    let selectedModel = 'gpt-3.5-turbo';
    const models = ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'];
    let selectedCorpName = writable('');
  
    const addComment = (comment) => (comments = [...comments, comment]);
    const removeTypingIndicator = () => (comments = comments.filter(comment => comment.text !== '...'));
    const setError = (message) => (errorMessage = message);
    const handleModelChange = (event) => (selectedModel = event.target.value);
</script>
  
<div class="flex h-screen bg-gray-100">
    <div class="flex-1 flex items-center justify-center border-gray-900 rounded-xl shadow-lg overflow-hidden relative border">
        <div class="absolute inset-0 flex items-center justify-center">
            <DBLoader bind:selectedCorpName />
        </div>
    </div>
    <div class="flex-1 flex flex-col max-w-md md:max-w-lg border-gray-900 rounded-xl shadow-lg overflow-hidden relative border">
        <div class="flex flex-col h-full pt-16 pb-4 box-border overflow-hidden">
            <Header />
            <Divider />
            <Chatbox {comments} {errorMessage} />
            <Divider />
        </div>
  
        <div class="w-full px-4 py-2 bg-gray-100 flex items-center">
            <div class="w-3/5 pr-2">
                <label for="api-key" class="block text-sm font-medium text-gray-700">OpenAI API 키</label>
                <input
                    id="api-key"
                    type="password"
                    bind:value={apiKey}
                    class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 w-full"
                    placeholder="키 값을 입력하세요"
                />
            </div>
            <div class="w-2/5 pl-2">
                <label for="model-select" class="block text-sm font-medium text-gray-700">Select Model</label>
                <select
                    id="model-select"
                    bind:value={selectedModel}
                    on:change={handleModelChange}
                    class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 w-full"
                >
                    {#each models as model}
                        <option value={model}>{model}</option>
                    {/each}
                </select>
            </div>
        </div>
  
        <ChatInput {apiKey} {addComment} {removeTypingIndicator} {setError} {typing} {selectedModel} bind:selectedCorpName
            class="w-full px-4 py-2 bg-gray-100"
        />
    </div>
</div>

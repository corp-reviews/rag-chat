<!-- src/routes/+page.svelte -->
<script>
    import Chatbox from '../components/Chatbox.svelte';
    import ChatInput from '../components/ChatInput.svelte';
    import Header from '../components/Header.svelte';
    import Divider from '../components/Divider.svelte';
    import DBLoader from '../components/DBLoader.svelte';
    import PDFRAG from '../components/PDFRAG.svelte';
    import { writable } from 'svelte/store';

    let comments = [];
    const typing = { author: 'gpt', text: '...', model: '' };
    let apiKey = '';
    let errorMessage = '';
    let selectedModel = 'gpt-3.5-turbo';
    const models = ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'];
    let selectedCorpName = writable('');
    let selectedOption = writable('PDFRAG');

    const addComment = (comment) => (comments = [...comments, comment]);
    const removeTypingIndicator = () => (comments = comments.filter(comment => comment.text !== '...'));
    const setError = (message) => (errorMessage = message);
    const handleModelChange = (event) => (selectedModel = event.target.value);
</script>

<div class="flex h-screen bg-gray-100">
    <div class="flex-1 flex flex-col border border-gray-300 rounded-lg shadow-sm overflow-hidden mr-2">
        <div class="absolute top-4 left-4 z-10">
            <label for="view-select" class="block text-sm font-medium text-gray-700">View Select</label>
            <select
                id="view-select"
                bind:value={$selectedOption}
                class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
                <option value="PDFRAG">PDF-RAG</option>
                <option value="DBLoader">기업정보 검색</option>
            </select>
        </div>
        {#if $selectedOption === 'DBLoader'}
            <DBLoader bind:selectedCorpName />
        {:else}
            <PDFRAG />
        {/if}
    </div>
    <div class="flex-1 flex flex-col border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <Header />
        <Divider />
        <div class="flex flex-col flex-1 overflow-hidden">
            <Chatbox {comments} {errorMessage} class="flex-1 overflow-auto" />
        </div>
        <Divider />
        <div class="flex justify-between p-4 bg-gray-100 border-t border-gray-300">
            <div class="flex-1 pr-2">
                <label for="api-key" class="block text-sm font-medium text-gray-700">OpenAI API 키</label>
                <input
                    id="api-key"
                    type="password"
                    bind:value={apiKey}
                    class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 w-full"
                    placeholder="키 값을 입력하세요"
                />
            </div>
            <div class="flex-1 pl-2">
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
        <ChatInput {apiKey} {addComment} {removeTypingIndicator} {setError} {typing} {selectedModel} bind:selectedCorpName bind:selectedOption
            class="w-full px-4 py-2 bg-gray-100"
        />
    </div>
</div>

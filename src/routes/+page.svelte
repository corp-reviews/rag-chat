<!-- src/routes/+page.svelte -->
<script>
    import { writable } from 'svelte/store';
    import Chatbox from '../components/chat/Chatbox.svelte';
    import ChatInput from '../components/chat/ChatInput.svelte';
    import Header from '../components/common/Header.svelte';
    import Divider from '../components/common/Divider.svelte';
    import DBLoader from '../components/company-RAG/DBLoader.svelte';
    import PDFRAG from '../components/PDFRAG/PDFRAG.svelte';
    import ViewSelect from '../components/common/ViewSelect.svelte';
    import APIKeyInput from '../components/common/APIKeyInput.svelte';
    import ModelSelect from '../components/common/ModelSelect.svelte';

    let comments = [];
    let apiKey = '';
    let errorMessage = '';
    let selectedModel = 'gpt-3.5-turbo';
    const models = ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'];
    let selectedCorpName = writable('');
    let selectedOption = writable('PDFRAG');

    const typing = { author: 'gpt', text: '...', model: '' };

    const addComment = (comment) => (comments = [...comments, comment]);
    const removeTypingIndicator = () => (comments = comments.filter(comment => comment.text !== '...'));
    const setError = (message) => (errorMessage = message);
    const handleModelChange = (event) => (selectedModel = event.target.value);
</script>

<div class="flex h-screen bg-gray-100">
    <div class="flex-1 flex flex-col border border-gray-300 rounded-lg shadow-sm overflow-hidden mr-2">
        <div class="absolute top-4 left-4 z-10">
            <ViewSelect bind:selectedOption />
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
            <APIKeyInput bind:apiKey />
            <ModelSelect {models} bind:selectedModel on:change={handleModelChange} />
        </div>
        <ChatInput {apiKey} {addComment} {removeTypingIndicator} {setError} {typing} {selectedModel} bind:selectedCorpName bind:selectedOption
            class="w-full px-4 py-2 bg-gray-100"
        />
    </div>
</div>

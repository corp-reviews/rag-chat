<!-- src/routes/+page.svelte -->
<script>
    import { writable } from 'svelte/store';
    import Header from '../components/common/Header.svelte';
    import Divider from '../components/common/Divider.svelte';
    import PDFRAG from '../components/PDFRAG/PDFRAG.svelte';
    import APIKeyInput from '../components/common/APIKeyInput.svelte';
    import ModelSelect from '../components/common/ModelSelect.svelte';
    import ChatContainer from '../components/chat/ChatContainer.svelte';

    let comments = [];
    let apiKey = '';
    let errorMessage = '';
    let selectedModel = 'gpt-3.5-turbo';
    const models = ['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'];

    const typing = { author: 'gpt', text: '...', model: '' };

    const addComment = (comment) => (comments = [...comments, comment]);
    const removeTypingIndicator = () => (comments = comments.filter(comment => comment.text !== '...'));
    const setError = (message) => (errorMessage = message);
    const handleModelChange = (event) => (selectedModel = event.target.value);

    let refreshElasticTitles;

    export const setRefreshElasticTitles = (func) => {
        refreshElasticTitles = func;
    };
</script>

<div class="flex h-screen bg-gray-100">
    <PDFRAG {refreshElasticTitles} {setRefreshElasticTitles} />

    <div class="w-1/3 flex flex-col border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <Header />
        <Divider />
        <ChatContainer {comments} {errorMessage} {apiKey} {selectedModel} {addComment} {removeTypingIndicator} {setError} {typing} />
        <Divider />
        <div class="flex justify-between p-4 bg-gray-100 border-t border-gray-300">
            <APIKeyInput bind:apiKey />
            <ModelSelect {models} bind:selectedModel on:change={handleModelChange} />
        </div>
    </div>
</div>

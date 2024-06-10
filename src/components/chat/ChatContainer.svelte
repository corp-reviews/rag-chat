<!-- src/components/chat/ChatContainer.svelte -->
<script>
    import Chatbox from './Chatbox.svelte';
    import ChatInput from './ChatInput.svelte';

    export let comments = [];
    export let errorMessage = '';
    export let apiKey = '';
    export let selectedModel = 'gpt-3.5-turbo';
    export let addComment;
    export let removeTypingIndicator;
    export let setError;
    export let typing;

    const handleModelChange = (event) => (selectedModel = event.target.value);
</script>

<div class="flex flex-col flex-1 overflow-hidden">
    <Chatbox {comments} {errorMessage} class="flex-1 overflow-auto" />
    <ChatInput {apiKey} {addComment} {removeTypingIndicator} {setError} {typing} {selectedModel} 
        class="w-full px-4 py-2 bg-gray-100"
    />
</div>

<!-- src/components/ChatInput.svelte -->
<script>
    import { get } from 'svelte/store';
    export let apiKey;
    export let addComment;
    export let removeTypingIndicator;
    export let setError;
    export let typing;
    export let selectedModel;
    export let selectedCorpName;

    let message = '';

    async function handleKeydown(event) {
        if (event.key === 'Enter' && message) {
            await sendMessage();
        }
    }

    async function sendMessage() {
        if (!apiKey) {
            alert('Input your API key');
            return;
        }

        const comment = {
            author: 'user',
            text: message
        };

        message = '';
        addComment(comment);
        setError('');

        const typingComment = { ...typing, text: '...', model: selectedModel };
        addComment(typingComment);

        const corpName = get(selectedCorpName);
        const reply = await getGPTResponse(comment.text, corpName);

        if (reply.error) {
            setError(reply.error);
        } else {
            reply.model = selectedModel;
            removeTypingIndicator();
            addComment(reply);
        }
    }

    async function getGPTResponse(userInput, corpName) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userInput, apiKey, selectedModel, corpName }),  // selectedModel 추가
            });
            const data = await response.json();
            if (response.ok) {
                return { author: 'gpt', text: data.text };
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error getting GPT response:', error);
            return { error: error.message };
        }
    }
</script>

<div class="flex items-start mt-2 mb-4 mx-4 bg-gray-100 space-x-2">
    <div class="w-1/4">
        <label for="corp-name" class="block text-sm font-medium text-gray-700">기업명</label>
        <input
            id="corp-name"
            class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 w-full h-10"
            value={$selectedCorpName}
            disabled
        />
    </div>
    <div class="w-3/4">
        <label for="message" class="block text-sm font-medium text-gray-700">질문</label>
        <input
            id="message"
            class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 w-full h-10"
            bind:value={message}
            on:keydown={handleKeydown}
            placeholder="궁금한 점을 입력하고 엔터키를 누르세요"
        />
    </div>
    <button
        class="mt-7 p-2 text-white rounded-md h-10"
        on:click={sendMessage}
        class:bg-blue-600={message !== ''}
        class:bg-gray-400={message === ''}
        disabled={!message}
    >
        ↵
    </button>
</div>

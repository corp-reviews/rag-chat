<!-- src/components/ChatInput.svelte -->
<script>
    import { get } from 'svelte/store';
    import { fetchData } from '../../lib/fetchHelper';
    import { vectorizeText } from '../../lib/vectorize';
    import { searchSimilarDocuments } from '../../lib/elasticsearch';

    export let apiKey;
    export let addComment;
    export let removeTypingIndicator;
    export let setError;
    export let typing;
    export let selectedModel;
    export let selectedCorpName;
    export let selectedOption;

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

        const comment = { author: 'user', text: message };
        message = '';
        addComment(comment);
        setError('');

        const typingComment = { ...typing, text: '...', model: selectedModel };
        addComment(typingComment);

        const corpName = get(selectedCorpName);

        // 사용자 입력 메시지를 벡터화 시도
        const vector = await vectorizeText(comment.text);
        if (!vector) {
            setError('Failed to vectorize the message');
            return;
        }
        console.log('Vectorized message:', vector); // 벡터화 결과를 콘솔에 출력

        // Elasticsearch에서 유사한 문서 검색
        const similarDocuments = await searchSimilarDocuments(vector);
        console.log('Top 3 similar documents:', similarDocuments); // 상위 3개 유사한 문서 결과를 콘솔에 출력

        const reply = await fetchData('/api/chat', 'POST', { userInput: comment.text, apiKey, selectedModel, corpName });

        if (reply.error) {
            setError(reply.error);
        } else {
            reply.model = selectedModel;
            removeTypingIndicator();
            addComment(reply);
        }
    }
</script>

<div class="flex items-start mt-2 mb-4 mx-4 bg-gray-100 space-x-2" {...$$restProps}>
    {#if $selectedOption === 'DBLoader'}
    <div class="w-1/4">
        <label for="corp-name" class="block text-sm font-medium text-gray-700">기업명</label>
        <input
            id="corp-name"
            class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 w-full h-10"
            value={$selectedCorpName}
            disabled
        />
    </div>
    {/if}
    <div class={$selectedOption === 'DBLoader' ? 'w-3/4' : 'w-full'}>
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

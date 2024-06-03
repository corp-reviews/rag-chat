<!-- src/components/DBLoader.svelte -->
<script>
    import { supabase } from '../../lib/supabaseClient';
    import { writable } from 'svelte/store';
    export let selectedCorpName;

    let searchTerm = '';
    let searchResult = writable(null);
    let searchError = writable(null);
    let isLoading = writable(false);
    let isCorpSelected = writable(false); // Add this line

    async function search() {
        if (!searchTerm) return;
        isLoading.set(true);
        try {
            const { data: result, error: queryError } = await supabase
                .from('companies_ko')
                .select('*')
                .eq('corp_name', searchTerm)
                .order('id')
                .limit(1);
            if (queryError) throw queryError;
            if (result.length === 0) {
                searchResult.set(null);
                searchError.set("검색 결과가 없습니다");
            } else {
                searchResult.set(result[0]);
                searchError.set(null);
            }
        } catch (err) {
            searchError.set(err.message);
            searchResult.set(null);
        } finally {
            isLoading.set(false);
        }
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            search();
        }
    }

    function selectCorp(corpName) {
        selectedCorpName.set(corpName);
        isCorpSelected.set(true); // Set the corporation as selected
    }

    function cancelSelection() {
        selectedCorpName.set('');
        isCorpSelected.set(false); // Set the corporation as not selected
    }
</script>

<div class="flex flex-col items-center mt-5 w-full max-w-lg px-4">
    <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">기업정보 검색</h1>
        <p class="text-gray-500 text-sm">기업명으로 상세정보를 찾아보세요.</p>
    </div>
    <div class="flex items-center mb-5 w-full bg-gray-100 p-2 rounded-md">
        <input
            type="text"
            placeholder="기업명을 정확하게 입력하세요"
            bind:value={searchTerm}
            on:keypress={handleKeyPress}
            class="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
            class="ml-2 p-2 text-white rounded-md"
            on:click={search}
            class:bg-blue-600={searchTerm !== ''}
            class:bg-gray-400={searchTerm === ''}
            disabled={!searchTerm}
        >
        ↵
        </button>
    </div>
    <div class="w-full">
        {#if $isLoading}
            <div class="text-gray-500">검색중...</div>
        {:else if $searchError}
            <div class="text-red-500">{$searchError}</div>
        {:else if $searchResult}
            <pre class="bg-white p-4 rounded shadow overflow-auto max-h-96">{JSON.stringify($searchResult, null, 2)}</pre>
            {#if $isCorpSelected}
                <button 
                    class="mt-2 p-2 text-red-600"
                    on:click={cancelSelection}
                >
                    선택 취소
                </button>
            {:else}
                <button 
                    class="mt-2 p-2 bg-green-600 text-white rounded-md"
                    on:click={() => selectCorp($searchResult.corp_name)}
                >
                    기업 선택
                </button>
            {/if}
        {/if}
    </div>
</div>

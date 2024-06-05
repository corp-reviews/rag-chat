<!--  -->
<script>
    import { writable } from 'svelte/store';

    export let selectedOption = writable('PDFRAG');
</script>

<label for="view-select" class="block text-sm font-medium text-gray-700">View Select</label>
<select
    id="view-select"
    bind:value={$selectedOption}
    class="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
>
    <option value="PDFRAG">PDF-RAG</option>
    <option value="DBLoader">기업정보 검색</option>
</select>

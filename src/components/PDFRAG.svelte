<!-- src/components/PDFRAG.svelte -->
<script>
    import { uploadFileToS3 } from '../lib/s3Upload';
    import { listFilesFromS3 } from '../lib/s3ListFiles';
    import { deleteFileFromS3 } from '../lib/s3DeleteFile';
    import { onMount } from 'svelte';
    import { bucketName, elasticsearchUsername, elasticsearchPassword } from '../stores/env';
    import axios from 'axios';

    let selectedFile = null;
    let uploadMessage = '';
    let fileName = '';
    let isUploading = false;
    let files = [];
    let elasticTitles = [];
    let errorMessage = '';

    const handleFileChange = (event) => {
        selectedFile = event.target.files[0];
        fileName = selectedFile ? selectedFile.name : '';
    };

    const handleFileUpload = async () => {
        if (selectedFile) {
            isUploading = true;
            const result = await uploadFileToS3(selectedFile);
            isUploading = false;
            if (result.success) {
                uploadMessage = '파일 업로드 성공!';
                fileName = selectedFile.name; // Store file name
                selectedFile = null; // Reset the selected file
                document.querySelector('input[type="file"]').value = ''; // Clear the file input
                await loadFiles(); // Reload files after upload
            } else {
                uploadMessage = `업로드 실패: ${result.message}`;
            }
        } else {
            uploadMessage = '파일을 선택하세요.';
        }
    };

    const handleFileDelete = async (fileName) => {
        if (confirm('업로드한 파일을 삭제하시겠습니까?')) {
            const result = await deleteFileFromS3(fileName);
            if (result.success) {
                await loadFiles(); // Reload files after delete
            } else {
                console.error(`파일 삭제 실패: ${result.message}`);
            }
        }
    };

    const loadFiles = async () => {
        files = await listFilesFromS3();
    };

    const fetchElasticTitles = async () => {
        try {
            const username = $elasticsearchUsername;
            const password = $elasticsearchPassword;
            const auth = `Basic ${btoa(`${username}:${password}`)}`;

            const response = await axios.get('https://elasticsearch.corp.reviews:9200/pdf_objects/_search', {
                params: {
                    q: '*',
                    size: 10,
                    _source: 'title'
                },
                headers: {
                    'Authorization': auth
                }
            });

            console.log(response.data); // 응답 데이터 구조 확인

            if (response.data.hits && response.data.hits.hits) {
                elasticTitles = response.data.hits.hits.map(hit => {
                    if (hit._source) {
                        console.log(hit._source); // _source 필드 확인
                        return hit._source.title ? hit._source.title : 'No Title';
                    } else {
                        return 'No Title';
                    }
                });
            } else {
                errorMessage = '응답 데이터 구조가 예상과 다릅니다.';
            }
        } catch (error) {
            errorMessage = '엘라스틱서치 데이터 로드 중 오류 발생: ' + error.message;
        }
    };

    onMount(() => {
        loadFiles();
        fetchElasticTitles();
    });
</script>

<div class="flex flex-col items-center mt-5 w-full max-w-lg px-4">
    <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">PDF-RAG</h1>
        <p class="text-gray-500 text-sm">PDF 파일을 업로드하여 분석하세요.</p>
    </div>
    <div class="w-full flex">
        <div class="w-2/5 border-r pr-2">
            <h2 class="text-xl font-bold mb-4">Uploaded PDF Files</h2>
            <ul class="space-y-2">
                {#each files as file}
                    <li class="flex justify-between items-center text-blue-500 hover:underline cursor-pointer text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1">
                        <span>{file}</span>
                        <button on:click={() => handleFileDelete(file)} class="text-red-500 hover:text-red-700">
                            삭제
                        </button>
                    </li>
                {/each}
            </ul>
        </div>
        <div class="w-3/5 pl-4">
            <input type="file" accept="application/pdf" on:change={handleFileChange} class="mb-4 p-2 border border-gray-300 rounded-md w-full" />
            {#if selectedFile}
                <button on:click={handleFileUpload} class="p-2 bg-blue-600 text-white rounded-md w-full" disabled={isUploading} class:opacity-50={isUploading}>
                    {#if isUploading}업로드 중...{/if}
                    {#if !isUploading}업로드{/if}
                </button>
            {/if}
            {#if uploadMessage}
                <div class="mt-4 text-center text-gray-700">
                    {#if fileName}
                        <code class="bg-gray-100 border border-gray-300 rounded px-2 py-1">{fileName}</code> {uploadMessage}
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>

<hr class="my-8 w-full border-t-2 border-gray-300" />

<div class="flex flex-col items-center mt-5 w-full max-w-lg px-4">
    <h2 class="text-xl font-bold mb-4">ElasticSearch Titles</h2>
    {#if errorMessage}
        <p class="text-red-500">{errorMessage}</p>
    {/if}
    <ul class="space-y-2">
        {#each elasticTitles as title}
            <li class="text-gray-700 text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1">
                {title}
            </li>
        {/each}
    </ul>
</div>

<!-- src/components/PDFRAG/ShowResponse.svelte -->
<script>
    import { onMount } from 'svelte';

    let message = 'Loading...';

    onMount(async () => {
        try {
            const response = await fetch('https://asia-northeast3-chat-corp-reviews.cloudfunctions.net/hello-world', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.text();
                message = data;
            } else {
                console.error('Failed to fetch message:', response.status, response.statusText);
                message = `Failed to load message: ${response.status} ${response.statusText}`;
            }
        } catch (error) {
            console.error('Error fetching message:', error);
            message = 'Error loading message. Check console for details.';
        }
    });
</script>

<div class="text-center mt-4">
    <p class="text-lg text-gray-700">{message}</p>
</div>

<!-- src/components/DBLoader.svelte -->
<script>
    import { supabase } from '../lib/supabaseClient';
    import { onMount } from 'svelte';
  
    let data = null;
    let error = null;
  
    onMount(async () => {
      try {
        const { data: result, error: queryError } = await supabase
          .from('companies_ko')
          .select('*')
          .order('id')
          .limit(1);
        if (queryError) throw queryError;
        data = result[0];
      } catch (err) {
        error = err.message;
      }
    });
  </script>
  
  {#if error}
  <div class="text-red-500">{error}</div>
{:else if data}
  <pre>{JSON.stringify(data, null, 2)}</pre>
{:else}
  <div>Loading...</div>
{/if}

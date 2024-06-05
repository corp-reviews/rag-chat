// src/lib/fetchHelper.js
export async function fetchData(url, method, body, headers = {}) {
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Unknown error');
        }
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        return { error: error.message };
    }
}

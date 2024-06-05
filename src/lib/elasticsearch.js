// src/lib/elasticsearch.js
import axios from 'axios';
import { get } from 'svelte/store';
import { elasticsearchUsername, elasticsearchPassword } from '../stores/env';

async function getElasticsearchAuth() {
    const username = get(elasticsearchUsername);
    const password = get(elasticsearchPassword);
    return `Basic ${btoa(`${username}:${password}`)}`;
}

export async function fetchElasticTitles() {
    const auth = await getElasticsearchAuth();
    try {
        const response = await axios.get('https://elasticsearch.corp.reviews:9200/pdf_objects/_search', {
            params: { q: '*', size: 1000 },
            headers: { 'Authorization': auth }
        });
        if (response.data.hits && response.data.hits.hits) {
            return response.data.hits.hits.map(hit => ({
                id: hit._id,
                title: `${hit._source.file}-${hit._source.page}-${hit._source.object_number}`,
                source: hit._source
            }));
        } else {
            throw new Error('Unexpected response structure');
        }
    } catch (error) {
        throw new Error(`Failed to fetch Elasticsearch titles: ${error.message}`);
    }
}

export async function deleteElasticTitle(id) {
    const auth = await getElasticsearchAuth();
    try {
        await axios.delete(`https://elasticsearch.corp.reviews:9200/pdf_objects/_doc/${id}`, {
            headers: { 'Authorization': auth }
        });
    } catch (error) {
        throw new Error(`Failed to delete Elasticsearch title: ${error.message}`);
    }
}

export async function deleteAllElasticTitles(titles) {
    const auth = await getElasticsearchAuth();
    try {
        for (const title of titles) {
            await axios.delete(`https://elasticsearch.corp.reviews:9200/pdf_objects/_doc/${title.id}`, {
                headers: { 'Authorization': auth }
            });
        }
    } catch (error) {
        throw new Error(`Failed to delete all Elasticsearch titles: ${error.message}`);
    }
}

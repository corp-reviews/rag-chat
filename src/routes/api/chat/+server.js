// src/routes/api/chat/+server.js
import { createLangchainClient, getLangchainResponse } from './openaiClient';
import { handleError } from './errorHandler';
import { SystemMessage, HumanMessage } from "@langchain/core/messages";  // 추가된 부분

export async function POST({ request }) {
    try {
        const { userInput, apiKey, selectedModel, systemMessage } = await request.json();
        console.log('User input:', userInput);

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key is required' }), { status: 400 });
        }

        const client = createLangchainClient(apiKey, selectedModel);
        const messages = [
            new SystemMessage(`Use the following information to assist with the response:\n\n${systemMessage}`),
            new HumanMessage(userInput)
        ];
        const reply = await getLangchainResponse(client, messages);

        console.log('Langchain response:', reply);

        return new Response(JSON.stringify({ text: reply }), { status: 200 });
    } catch (error) {
        const { status, errorMessage } = handleError(error);
        return new Response(JSON.stringify({ error: errorMessage }), { status });
    }
}

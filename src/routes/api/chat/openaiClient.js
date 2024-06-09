// src/routes/api/chat/openaiClient.js
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

/**
 * Initializes Langchain ChatOpenAI client with provided API key and model.
 * @param {string} apiKey - The API key for OpenAI.
 * @param {string} model - The model to use for the completion.
 * @returns {ChatOpenAI} - The ChatOpenAI client instance.
 */
export function createLangchainClient(apiKey, model) {
    return new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: model
    });
}

/**
 * Sends a series of messages to Langchain ChatOpenAI and returns the response.
 * @param {ChatOpenAI} client - The ChatOpenAI client instance.
 * @param {Array} messages - The messages to send to OpenAI.
 * @returns {Promise<string>} - The response from ChatOpenAI.
 */
export async function getLangchainResponse(client, messages) {
    if (!Array.isArray(messages)) {
        throw new Error("messages must be an array");
    }
    
    const parser = new StringOutputParser();
    const chain = client.pipe(parser);
    const response = await chain.invoke(messages);

    return response;
}

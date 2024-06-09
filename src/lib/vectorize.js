// src/lib/vectorize.js
import axios from 'axios';

export const vectorizeText = async (text) => {
    try {
        console.log('Sending text to vectorize:', text);  // 디버깅을 위해 로그 추가
        const response = await axios.post('https://asia-northeast3-chat-corp-reviews.cloudfunctions.net/hello-world-1', { text });
        console.log('Received vector response:', response.data.vector);  // 디버깅을 위해 로그 추가
        return response.data.vector;
    } catch (error) {
        console.error('Error vectorizing text:', error);
        return null;
    }
};

// src/lib/vectorize.js
import axios from 'axios';

export const vectorizeText = async (text) => {
    try {
        console.log('Sending text to vectorize:', text);  // 디버깅을 위해 로그 추가
        const response = await axios.post('https://asia-northeast3-chat-corp-reviews.cloudfunctions.net/hello-world-1', { text });
        const fullVector = response.data.vector;
        console.log('Received vector response:', fullVector);  // 디버깅을 위해 로그 추가

        // 평균 풀링을 사용하여 벡터 차원 축소
        const reducedVector = averagePooling(fullVector, 300);
        return reducedVector;
    } catch (error) {
        console.error('Error vectorizing text:', error);
        return null;
    }
};

const averagePooling = (vector, targetDim) => {
    const pooledVector = [];
    const poolSize = Math.floor(vector.length / targetDim);
    
    for (let i = 0; i < targetDim; i++) {
        const startIdx = i * poolSize;
        const endIdx = startIdx + poolSize;
        const pool = vector.slice(startIdx, endIdx);
        const avg = pool.reduce((sum, val) => sum + val, 0) / pool.length;
        pooledVector.push(avg);
    }
    
    return pooledVector;
};

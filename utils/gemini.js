import dotenv from 'dotenv';
dotenv.config(); // Load env variables first
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export async function geminiData(prompt, temperature) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${prompt}`,
            config: {
                temperature,
            },
        });
        
        console.log(response.text);
        return response.text;
    } catch (error) {
        console.log("Error while verifying image", error);
        throw new Error(error)
    }
}
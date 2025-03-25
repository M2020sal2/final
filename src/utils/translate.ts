import axios from 'axios';
import { translate } from '@vitalets/google-translate-api';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

    export async function translateText(text: string, targetLanguage: string): Promise<string> {
        const cacheKey = `${text}-${targetLanguage}`;
        const cachedTranslation = cache.get<string>(cacheKey);
    
        if (cachedTranslation) return cachedTranslation;
    
        try {
            const response = await axios.get(`https://api.mymemory.translated.net/get`, {
                params: {
                    q: text,
                    langpair: `en|${targetLanguage}`
                }
            });
    
            if (response.data.responseData?.translatedText) {
                const translatedText = response.data.responseData.translatedText;
                cache.set(cacheKey, translatedText);
                return translatedText;
            }
        } catch (error) {
            console.error('MyMemory API failed');
        }
    
        return text;
    }

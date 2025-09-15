import axios from 'axios';
import { logger } from '../utils/logger';

export interface ChatResponse {
  text: string;
  images?: Array<{
    data: string;
    mimeType: string;
    filename: string;
  }>;
}

export class ChatService {
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  
  static async generateContent(message: string): Promise<ChatResponse> {
    try {
      logger.info('Chat request received:', { message });
      
      const geminiApiKey = process.env.GEMINI_API_KEY;
      
      if (!geminiApiKey) {
        logger.error('GEMINI_API_KEY not found in environment variables');
        throw new Error('Gemini API key not configured');
      }

      logger.info('Calling Gemini API with key:', { keyPrefix: geminiApiKey.substring(0, 10) + '...' });

      const response = await axios.post(
        `${this.GEMINI_API_URL}?key=${geminiApiKey}`,
        {
          contents: [{
            parts: [{
              text: `You are an AI assistant for a CRM system. Help users with customer insights, data analysis, content generation, and business questions. Be helpful, professional, and concise. 

User message: ${message}

Please provide a helpful response related to CRM, customer management, or business insights.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      );

      logger.info('Gemini API response received:', { 
        status: response.status,
        hasCandidates: !!(response.data.candidates && response.data.candidates.length > 0)
      });

      if (response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
        const generatedText = response.data.candidates[0].content.parts[0].text;
        
        logger.info('Successfully generated response from Gemini API');
        
        return {
          text: generatedText,
          images: [] // Gemini Pro doesn't generate images
        };
      } else {
        logger.error('Invalid response format from Gemini API:', response.data);
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error: any) {
      logger.error('Gemini API error:', { 
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Return a fallback response instead of throwing
      return {
        text: `I apologize, but I'm having trouble connecting to the AI service right now. Your message was: "${message}". Please try again in a moment, or contact support if the issue persists.`,
        images: []
      };
    }
  }
}

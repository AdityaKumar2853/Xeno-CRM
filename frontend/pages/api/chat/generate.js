import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatbotTrainingData } from './training-data';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is required' },
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: { message: 'GEMINI_API_KEY not configured' },
      });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Create a comprehensive system prompt with training data
      const trainingContext = chatbotTrainingData.map(qa => 
        `Q: ${qa.messages[0].content}\nA: ${qa.messages[1].content}`
      ).join('\n\n');
      
      const prompt = `You are an AI assistant for a comprehensive CRM system. Use the following Q&A examples to provide accurate, helpful responses about the CRM functionality:

${trainingContext}

Based on the above examples, provide a helpful, professional, and concise response to the user's question. If the question is about specific features not covered above, use your knowledge to provide relevant guidance about CRM best practices.

User message: ${message}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.status(200).json({
        success: true,
        data: {
          text: text,
        },
      });
    } catch (error) {
      console.error('❌ Gemini API error:', error.message);
      
      res.status(500).json({
        success: false,
        error: { 
          message: 'Failed to generate response: ' + error.message,
          code: error.code,
        },
      });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

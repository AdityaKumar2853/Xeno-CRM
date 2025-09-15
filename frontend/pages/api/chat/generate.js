import { GoogleGenerativeAI } from '@google/generative-ai';

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
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `You are an AI assistant for a CRM system. Help the user with customer insights, data analysis, content generation, and answer questions about their CRM. Be helpful, professional, and concise.

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
      console.error('❌ Gemini API error:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name,
      });
      
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

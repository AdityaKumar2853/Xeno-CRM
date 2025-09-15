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
  
  private static getQuickResponse(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    // Customer Segmentation Questions
    if (lowerMessage.includes('segment') && lowerMessage.includes('spend') && lowerMessage.includes('10000')) {
      return `To create a segment of customers who spent more than ₹10,000:

**Step 1:** Go to the Segments page
**Step 2:** Click "Create Segment"
**Step 3:** Set the rule: \`total_spend > 10000\`
**Step 4:** Click "Preview Audience" to see how many customers match
**Step 5:** Save the segment with a descriptive name like "High Value Customers"

You can also combine conditions:
- \`total_spend > 10000 AND order_count >= 3\` (high spenders with multiple orders)
- \`total_spend > 10000 AND last_purchase_date > today - 30\` (recent high spenders)

Would you like help with more complex segmentation rules?`;
    }
    
    if (lowerMessage.includes('segment') && (lowerMessage.includes('3 times') || lowerMessage.includes('90 days'))) {
      return `To find customers who ordered at least 3 times but haven't purchased in the last 90 days:

**Rule:** \`order_count >= 3 AND last_purchase_date < today - 90 days\`

**Steps:**
1. Go to Segments → Create Segment
2. Add condition: Order Count ≥ 3
3. Add condition: Last Purchase Date < (Today - 90 days)
4. Use AND operator to combine conditions
5. Preview audience size
6. Save as "Inactive High-Value Customers"

This segment is perfect for win-back campaigns! Would you like help creating a campaign message for these customers?`;
    }
    
    if (lowerMessage.includes('combine') && (lowerMessage.includes('and') || lowerMessage.includes('or'))) {
      return `Yes! You can create flexible segment rules using AND/OR operators:

**AND Logic:** All conditions must be true
- \`spend > 5000 AND visits < 2\` (high spenders with low engagement)

**OR Logic:** Any condition can be true  
- \`inactive_days > 60 OR total_spend < 1000\` (inactive OR low-value customers)

**Complex Combinations:**
- \`(spend > 5000 AND visits < 2) OR inactive_days > 60\`
- \`(order_count >= 3 AND last_purchase > today - 30) OR total_spend > 20000\`

**Pro Tips:**
- Use parentheses to group conditions
- Preview audience after each rule change
- Test different combinations to find the right audience size

Need help with a specific segmentation scenario?`;
    }
    
    // Campaign Questions
    if (lowerMessage.includes('campaign') && lowerMessage.includes('create')) {
      return `To create a new campaign:

**Step 1:** Create or select a customer segment
**Step 2:** Go to Campaigns → Create Campaign  
**Step 3:** Choose your segment from the dropdown
**Step 4:** Write your message (use {name} for personalization)
**Step 5:** Save the campaign

**Message Examples:**
- "Hi {name}, enjoy 10% off your next order!"
- "We miss you, {name}! Here's a ₹500 voucher just for you."
- "Thank you for being a valued customer, {name}!"

**After Saving:**
- Campaign appears in Campaign History
- Messages sent via vendor API (~90% success rate)
- Track delivery status in communication logs

What type of campaign are you looking to create?`;
    }
    
    if (lowerMessage.includes('personalize') || lowerMessage.includes('{name}')) {
      return `Yes! You can personalize messages with customer data:

**Available Variables:**
- \`{name}\` - Customer's name
- \`{email}\` - Customer's email
- \`{total_spend}\` - Total amount spent
- \`{order_count}\` - Number of orders
- \`{last_purchase}\` - Last purchase date

**Example Messages:**
- "Hi {name}, you've spent ₹{total_spend} with us!"
- "Dear {name}, it's been {days_since_last_purchase} days since your last order"
- "Hello {name}, as a customer with {order_count} orders, here's a special offer!"

**Pro Tips:**
- Keep messages conversational and natural
- Test with different customer profiles
- Use variables sparingly to avoid spam-like appearance

Would you like help crafting a specific personalized message?`;
    }
    
    // Authentication Questions
    if (lowerMessage.includes('login') || lowerMessage.includes('google') || lowerMessage.includes('auth')) {
      return `**Authentication in Xeno CRM:**

**Login Process:**
1. Click "Sign in with Google" on the login page
2. Use your Google account credentials
3. Grant necessary permissions
4. You'll be redirected to the dashboard

**Access Levels:**
- **Authenticated Users:** Full access to all features
- **Unauthenticated:** Limited to viewing only

**Features Requiring Login:**
- Creating customer segments
- Managing campaigns
- Viewing detailed analytics
- Exporting data
- AI-powered features

**Team Access:**
- Each team member needs their own Google account
- All authenticated users have equal access
- Secure, role-based permissions

Having trouble logging in? Let me know what specific issue you're facing!`;
    }
    
    // AI Features Questions
    if (lowerMessage.includes('plain english') || lowerMessage.includes('natural language')) {
      return `Yes! The AI can convert plain English to segment rules:

**Examples:**
- "People who haven't shopped in 6 months and spent over ₹5K"
  → \`last_purchase_date < today - 180 days AND total_spend > 5000\`

- "Customers with more than 5 orders in the last 3 months"
  → \`order_count > 5 AND last_purchase_date > today - 90 days\`

- "High spenders who are inactive"
  → \`total_spend > 10000 AND last_purchase_date < today - 60 days\`

**How to Use:**
1. Describe your target audience in plain English
2. The AI will suggest the appropriate rules
3. Review and modify if needed
4. Preview the audience size

**Pro Tips:**
- Be specific about time periods
- Mention spending thresholds clearly
- Include engagement criteria when relevant

Try describing your ideal customer segment in plain English!`;
    }
    
    if (lowerMessage.includes('suggest') && lowerMessage.includes('message')) {
      return `The AI can suggest campaign messages based on your objective:

**Win-Back Campaigns:**
- "We miss you! Enjoy 20% off your next order."
- "It's been a while! Here's a ₹500 voucher just for you."
- "Come back and discover what's new at 15% off!"

**High-Value Customer Campaigns:**
- "Thank you for being our valued customer! Here's an exclusive offer."
- "As one of our top customers, enjoy VIP treatment with 25% off."

**Reactivation Campaigns:**
- "Don't miss out! Your favorites are back in stock."
- "Something new just arrived - check it out with 10% off!"

**Personalization Examples:**
- "Hi {name}, we noticed you love [category] - here's something special!"
- "Dear {name}, your last order was [product] - here's a complementary item!"

**AI Recommendations:**
- Best sending times (e.g., weekdays at 7 PM)
- Optimal message length
- Call-to-action suggestions
- Subject line optimization

What type of campaign are you planning? I can suggest specific messages!`;
    }
    
    // General Help
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `I'm your AI assistant for Xeno CRM! Here's what I can help you with:

**🎯 Customer Segmentation**
- Create complex segment rules (AND/OR conditions)
- Convert plain English to technical rules
- Preview audience sizes
- Suggest optimal targeting criteria

**📧 Campaign Management**
- Write effective campaign messages
- Personalize with customer data variables
- Suggest optimal sending times
- Recommend campaign strategies

**📊 Data Analysis**
- Analyze customer behavior patterns
- Provide spending insights
- Track engagement metrics
- Generate performance reports

**🔧 System Features**
- Explain CRM workflows
- Troubleshoot issues
- Guide through feature usage
- Provide best practices

**💡 AI-Powered Features**
- Auto-tag campaigns
- Suggest message content
- Recommend timing
- Convert natural language to rules

**Quick Examples:**
- "Create a segment for customers who spent over ₹10K"
- "Write a win-back campaign message"
- "Show me high-value customers who haven't ordered recently"

What would you like to explore first?`;
    }
    
    return null; // No quick response found, will use Gemini API
  }
  
  static async generateContent(message: string): Promise<ChatResponse> {
    try {
      logger.info('Chat request received:', { message });
      
      // Check for common questions and provide quick responses
      const quickResponse = this.getQuickResponse(message);
      if (quickResponse) {
        logger.info('Using quick response for common question');
        return {
          text: quickResponse,
          images: []
        };
      }
      
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
              text: `You are an AI assistant for a comprehensive CRM system called "Xeno CRM". You help users with customer segmentation, campaign creation, data analysis, and business insights. 

SYSTEM CAPABILITIES:
- Customer Segmentation: Create rules like total_spend > 10000, order_count >= 3, last_purchase_date < today - 90 days
- Campaign Management: Create personalized campaigns with variables like {name}, track delivery status
- Data Analysis: Provide insights on customer behavior, spending patterns, engagement metrics
- Authentication: Google OAuth 2.0 login required for most features
- AI Features: Convert plain English to segment rules, suggest campaign messages, recommend timing

COMMON TASKS YOU CAN HELP WITH:
1. Creating customer segments with complex rules (AND/OR conditions)
2. Writing effective campaign messages with personalization
3. Analyzing customer data and providing insights
4. Explaining CRM features and workflows
5. Troubleshooting campaign delivery issues
6. Suggesting optimal campaign timing and strategies

RESPONSE STYLE:
- Be helpful, professional, and detailed
- Provide specific examples when explaining features
- Use bullet points for clarity
- Include relevant metrics and statistics when appropriate
- Ask follow-up questions to better understand user needs

User message: ${message}

Please provide a comprehensive and helpful response about the CRM system.`
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

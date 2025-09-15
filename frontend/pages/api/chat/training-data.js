// CRM Chatbot Training Data - Q&A Pairs
// This file contains comprehensive Q&A pairs for the CRM chatbot

export const chatbotTrainingData = [
  // Basic CRM Overview
  {
    "messages": [
      {"role": "user", "content": "What does this CRM system do?"},
      {"role": "assistant", "content": "This is a comprehensive Customer Relationship Management system that helps you manage customers, orders, segments, and marketing campaigns. You can authenticate with Google OAuth, create customer profiles, track orders, build audience segments using flexible rules, launch personalized marketing campaigns, and get AI-powered insights. The system includes features like customer data management, order tracking, segment building with AND/OR logic, campaign creation, delivery tracking, and AI assistance for content generation and analytics."}
    ]
  },
  
  // Customer Management
  {
    "messages": [
      {"role": "user", "content": "How do I add a new customer?"},
      {"role": "assistant", "content": "To add a new customer, go to the Customers page and click the 'Add Customer' button. Fill in the customer details including name, email, phone, address, city, state, country, and postal code. The system will automatically create a customer profile with a unique ID and track their total spent amount and order count. You can also edit or delete existing customers using the action buttons in the customer list."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "How do I edit customer information?"},
      {"role": "assistant", "content": "To edit a customer, go to the Customers page, find the customer you want to edit, and click the 'Edit' button (pencil icon). This will open a modal where you can modify any customer details like name, email, phone, or address. Click 'Save' to update the information. The system will automatically update the customer record in the database."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "Can I delete a customer?"},
      {"role": "assistant", "content": "Yes, you can delete a customer by clicking the 'Delete' button (trash icon) next to their name in the customer list. The system will ask for confirmation before deleting. Note that deleting a customer will also remove all their associated orders, so make sure this is what you want to do."}
    ]
  },
  
  // Order Management
  {
    "messages": [
      {"role": "user", "content": "How do I create a new order?"},
      {"role": "assistant", "content": "To create a new order, go to the Orders page and click 'Add Order'. Select a customer from the dropdown (you'll see their name and email), enter an order number, specify the total amount, and choose the order status (pending, completed, cancelled, or refunded). The system will automatically update the customer's total spent amount and order count when you save the order."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "How do I track order status?"},
      {"role": "assistant", "content": "Order statuses are tracked in the Orders page. You can see the current status of each order (pending, completed, cancelled, refunded) with color-coded badges. To update an order status, click the 'Edit' button next to the order and change the status in the dropdown. The system will automatically update the order and recalculate customer statistics."}
    ]
  },
  
  // Segment Building
  {
    "messages": [
      {"role": "user", "content": "How do I create a customer segment?"},
      {"role": "assistant", "content": "To create a segment, go to the Segments page and click 'Add Segment'. Enter a name and description for your segment, then define the rules using JSON format. For example, to target high-value customers: {\"field\":\"totalSpent\",\"operator\":\">\",\"value\":1000}. You can use operators like >, <, >=, <=, =, and contains. The system will show you how many customers match your criteria before saving."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "How do I build complex segments with multiple conditions?"},
      {"role": "assistant", "content": "For complex segments, use JSON with AND/OR logic. Example: {\"op\":\"AND\",\"rules\":[{\"field\":\"totalSpent\",\"operator\":\">\",\"value\":5000},{\"field\":\"totalOrders\",\"operator\":\">=\",\"value\":3}]} for customers who spent over ₹5000 AND have 3+ orders. For OR conditions: {\"op\":\"OR\",\"rules\":[{\"field\":\"city\",\"operator\":\"=\",\"value\":\"Mumbai\"},{\"field\":\"city\",\"operator\":\"=\",\"value\":\"Delhi\"}]} for customers in Mumbai OR Delhi."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "Can I preview how many customers match my segment rules?"},
      {"role": "assistant", "content": "Yes! When you create or edit a segment, the system automatically calculates and shows you the number of customers that match your rules. This helps you verify that your segment criteria are working as expected before saving. You can adjust your rules and see the count update in real-time."}
    ]
  },
  
  // Campaign Management
  {
    "messages": [
      {"role": "user", "content": "How do I create a marketing campaign?"},
      {"role": "assistant", "content": "To create a campaign, go to the Campaigns page and click 'Create Campaign'. Enter a campaign name and description, write your message content, and select a target segment. Choose the campaign status (draft, running, completed) and optionally set a schedule date. The system will create the campaign and prepare it for delivery to customers in the selected segment."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "How do I track campaign performance?"},
      {"role": "assistant", "content": "Campaign performance is tracked in the Campaigns page. You can see each campaign's status, the number of customers targeted, delivery success rate, and other metrics. The system provides detailed analytics including open rates, click rates, and conversion metrics to help you measure campaign effectiveness."}
    ]
  },
  
  // Dashboard and Analytics
  {
    "messages": [
      {"role": "user", "content": "What insights can I see on the dashboard?"},
      {"role": "assistant", "content": "The dashboard shows key metrics including total customers, total revenue, average order value, campaign performance, and recent activity. You can see customer growth trends, order statistics, and campaign success rates. The AI assistant can also provide deeper insights and analysis of your data patterns."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "How do I get customer insights?"},
      {"role": "assistant", "content": "You can get customer insights through the dashboard analytics and by asking the AI assistant specific questions. For example, ask 'Show me my top customers' or 'What's the average order value?' The system analyzes your customer data and provides actionable insights to help you understand customer behavior and improve your marketing strategies."}
    ]
  },
  
  // Authentication and Security
  {
    "messages": [
      {"role": "user", "content": "How do I log in to the system?"},
      {"role": "assistant", "content": "Click the 'Sign in with Google' button on the login page. The system uses Google OAuth 2.0 for secure authentication. After you authorize the application, you'll be automatically logged in and redirected to the dashboard. Your session is securely managed, and you can log out anytime using the logout option."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "Is my data secure?"},
      {"role": "assistant", "content": "Yes, your data is secure. The system uses Google OAuth for authentication, encrypts data in transit, and follows security best practices. All API endpoints are protected, and customer data is stored securely in the database. Only authenticated users can access the system and view customer information."}
    ]
  },
  
  // AI Features
  {
    "messages": [
      {"role": "user", "content": "What can the AI assistant help me with?"},
      {"role": "assistant", "content": "The AI assistant can help you with customer insights, data analysis, content generation, campaign optimization, and answering questions about your CRM data. You can ask questions like 'What are my top performing campaigns?', 'Generate email content for a sale', 'Analyze customer spending patterns', or 'Suggest improvements for my marketing strategy'."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "Can the AI help me write marketing messages?"},
      {"role": "assistant", "content": "Yes! The AI can help you write compelling marketing messages for your campaigns. Just ask questions like 'Write a welcome email for new customers', 'Create a promotional message for a 20% discount', or 'Suggest subject lines for my email campaign'. The AI will generate personalized, engaging content based on your requirements."}
    ]
  },
  
  // Data Management
  {
    "messages": [
      {"role": "user", "content": "How do I search for specific customers or orders?"},
      {"role": "assistant", "content": "Use the search functionality on each page. In the Customers page, you can search by name or email. In the Orders page, you can search by order number or customer name. The search is real-time and will filter results as you type. You can also use the AI assistant to ask specific questions about your data."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "Can I export my data?"},
      {"role": "assistant", "content": "Currently, the system focuses on data management and analysis within the platform. For data export needs, you can use the AI assistant to generate reports or summaries of your data. Future updates may include direct export functionality for customer lists, order reports, and campaign analytics."}
    ]
  },
  
  // Troubleshooting
  {
    "messages": [
      {"role": "user", "content": "Why can't I see any data on the dashboard?"},
      {"role": "assistant", "content": "If you're not seeing data on the dashboard, make sure you have added customers and orders to the system. The dashboard shows real-time data from your database. If you've added data but still see zeros, try refreshing the page or check if there are any connection issues. The AI assistant can also help diagnose data-related problems."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "What if I make a mistake in a segment rule?"},
      {"role": "assistant", "content": "You can easily edit segment rules by clicking the 'Edit' button next to any segment. Modify the JSON rules and save the changes. The system will recalculate how many customers match the updated criteria. If you're unsure about the correct JSON format, ask the AI assistant for help with specific rule examples."}
    ]
  },
  
  // Advanced Features
  {
    "messages": [
      {"role": "user", "content": "How do I create a segment for high-value customers?"},
      {"role": "assistant", "content": "To create a high-value customer segment, use rules like: {\"field\":\"totalSpent\",\"operator\":\">\",\"value\":10000} for customers who spent over ₹10,000. You can also combine conditions like {\"op\":\"AND\",\"rules\":[{\"field\":\"totalSpent\",\"operator\":\">\",\"value\":5000},{\"field\":\"totalOrders\",\"operator\":\">=\",\"value\":5}]} for customers with high spending AND multiple orders."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "How do I target inactive customers?"},
      {"role": "assistant", "content": "To target inactive customers, create a segment with rules based on their last order date. For example: {\"field\":\"lastOrderAt\",\"operator\":\"<\",\"value\":\"2024-01-01\"} for customers who haven't ordered since 2024. You can also use relative dates or combine with spending criteria to find inactive high-value customers who might be worth re-engaging."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "Can I schedule campaigns for later?"},
      {"role": "assistant", "content": "Yes, when creating a campaign, you can set it to 'draft' status initially and then activate it later. The system allows you to prepare campaigns in advance and launch them when you're ready. You can also edit campaign details and change the status as needed."}
    ]
  },
  
  // Best Practices
  {
    "messages": [
      {"role": "user", "content": "What are some best practices for customer segmentation?"},
      {"role": "assistant", "content": "Best practices for segmentation include: 1) Start with simple rules and gradually add complexity, 2) Use meaningful segment names and descriptions, 3) Test segments with small audiences first, 4) Combine demographic and behavioral data, 5) Regularly review and update segments based on performance, 6) Use the preview feature to verify segment size, and 7) Document your segmentation strategy for consistency."}
    ]
  },
  
  {
    "messages": [
      {"role": "user", "content": "How often should I update my customer data?"},
      {"role": "assistant", "content": "Update customer data regularly to maintain accuracy. Key times to update include: when customers place new orders (automatic), when contact information changes, after major campaigns to track engagement, and quarterly for comprehensive data review. The system automatically updates spending and order counts, but you should manually update contact details and preferences as needed."}
    ]
  }
];

export default chatbotTrainingData;

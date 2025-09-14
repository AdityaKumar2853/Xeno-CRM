import OpenAI from 'openai';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { errors } from '../utils/errorHandler';
import { config } from '../config/app';
import { RuleGroup, RuleCondition } from '../utils/sqlBuilder';

export class AIService {
  private static openai = new OpenAI({
    apiKey: config.ai.openaiApiKey,
  });

  static async parseNaturalLanguageToRules(prompt: string): Promise<{ rules: RuleGroup | RuleCondition; confidence: number }> {
    try {
      const systemPrompt = `You are an expert at converting natural language descriptions into structured database query rules for customer segmentation.

Available fields and their types:
- email (string): Customer email address
- name (string): Customer name
- phone (string): Customer phone number
- city (string): Customer city
- state (string): Customer state
- country (string): Customer country
- postalCode (string): Customer postal code
- totalSpent (number): Total amount spent by customer
- totalOrders (number): Total number of orders placed
- lastOrderAt (date): Date of last order
- createdAt (date): Customer creation date

Available operators:
- For strings: eq, ne, contains, startsWith, endsWith, in, notIn, isNull, isNotNull
- For numbers: eq, ne, gt, gte, lt, lte, in, notIn, isNull, isNotNull
- For dates: eq, ne, gt, gte, lt, lte, isNull, isNotNull

Return a JSON object with this structure:
{
  "rules": {
    "operator": "AND" | "OR",
    "conditions": [
      {
        "field": "fieldName",
        "operator": "operatorName",
        "value": "fieldValue"
      }
    ]
  },
  "confidence": 0.95
}

For simple conditions, return:
{
  "rules": {
    "field": "fieldName",
    "operator": "operatorName",
    "value": "fieldValue"
  },
  "confidence": 0.95
}

Examples:
- "People who spent more than 1000" -> {"field": "totalSpent", "operator": "gt", "value": 1000}
- "Customers from Mumbai" -> {"field": "city", "operator": "eq", "value": "Mumbai"}
- "High value customers who haven't ordered in 6 months" -> {"operator": "AND", "conditions": [{"field": "totalSpent", "operator": "gt", "value": 10000}, {"field": "lastOrderAt", "operator": "lt", "value": "2023-06-01"}]}`;

      const response = await this.openai.chat.completions.create({
        model: config.ai.openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw errors.INTERNAL_SERVER_ERROR('No response from AI service');
      }

      const result = JSON.parse(content);
      
      // Log AI usage
      await this.logAIUsage('rule_parser', { prompt }, result, response.usage);

      return result;
    } catch (error) {
      logger.error('Failed to parse natural language to rules:', error);
      throw errors.INTERNAL_SERVER_ERROR('Failed to parse natural language to rules');
    }
  }

  static async generateMessageSuggestions(
    campaignObjective: string,
    audienceDescription?: string,
    tone?: string
  ): Promise<{ suggestions: string[]; confidence: number }> {
    try {
      const systemPrompt = `You are an expert marketing copywriter who creates compelling campaign messages for customer engagement.

Generate 3 different message variations for the given campaign objective. Each message should be:
- Personalized and engaging
- Clear and actionable
- Appropriate for the target audience
- Professional yet friendly

Consider the tone: ${tone || 'friendly'}
Audience: ${audienceDescription || 'General customers'}

Return a JSON object with this structure:
{
  "suggestions": [
    "Message 1",
    "Message 2", 
    "Message 3"
  ],
  "confidence": 0.9
}`;

      const response = await this.openai.chat.completions.create({
        model: config.ai.openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: campaignObjective },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw errors.INTERNAL_SERVER_ERROR('No response from AI service');
      }

      const result = JSON.parse(content);
      
      // Log AI usage
      await this.logAIUsage('message_suggestion', { campaignObjective, audienceDescription, tone }, result, response.usage);

      return result;
    } catch (error) {
      logger.error('Failed to generate message suggestions:', error);
      throw errors.INTERNAL_SERVER_ERROR('Failed to generate message suggestions');
    }
  }

  static async generatePerformanceSummary(campaignId: string): Promise<{ summary: string; insights: string[]; confidence: number }> {
    try {
      // Get campaign data
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          segment: {
            include: {
              customers: {
                include: {
                  customer: true,
                },
              },
            },
          },
          communicationLogs: {
            select: {
              status: true,
              sentAt: true,
              deliveredAt: true,
              failedAt: true,
              failureReason: true,
            },
          },
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      const stats = {
        totalSent: campaign.communicationLogs.length,
        totalDelivered: campaign.communicationLogs.filter(log => log.status === 'delivered').length,
        totalFailed: campaign.communicationLogs.filter(log => log.status === 'failed').length,
        audienceSize: campaign.segment.customers.length,
        deliveryRate: campaign.communicationLogs.length > 0 
          ? (campaign.communicationLogs.filter(log => log.status === 'delivered').length / campaign.communicationLogs.length) * 100 
          : 0,
      };

      const systemPrompt = `You are an expert marketing analyst who creates insightful performance summaries for email campaigns.

Analyze the campaign data and provide:
1. A human-readable summary of the campaign performance
2. Key insights and recommendations
3. Areas for improvement

Campaign Data:
- Campaign Name: ${campaign.name}
- Audience Size: ${stats.audienceSize}
- Total Sent: ${stats.totalSent}
- Total Delivered: ${stats.totalDelivered}
- Total Failed: ${stats.totalFailed}
- Delivery Rate: ${stats.deliveryRate.toFixed(2)}%

Return a JSON object with this structure:
{
  "summary": "Human-readable summary of the campaign performance",
  "insights": [
    "Key insight 1",
    "Key insight 2",
    "Key insight 3"
  ],
  "confidence": 0.9
}`;

      const response = await this.openai.chat.completions.create({
        model: config.ai.openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate performance summary' },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw errors.INTERNAL_SERVER_ERROR('No response from AI service');
      }

      const result = JSON.parse(content);
      
      // Log AI usage
      await this.logAIUsage('performance_summary', { campaignId }, result, response.usage);

      return result;
    } catch (error) {
      logger.error('Failed to generate performance summary:', error);
      throw errors.INTERNAL_SERVER_ERROR('Failed to generate performance summary');
    }
  }

  static async suggestOptimalScheduling(customerIds: string[]): Promise<{ bestTime: string; bestDay: string; confidence: number }> {
    try {
      // Get customer order patterns
      const customers = await prisma.customer.findMany({
        where: { id: { in: customerIds } },
        include: {
          orders: {
            select: {
              orderDate: true,
            },
            orderBy: { orderDate: 'desc' },
            take: 10,
          },
        },
      });

      // Analyze order patterns
      const orderHours = customers.flatMap(c => 
        c.orders.map(o => new Date(o.orderDate).getHours())
      );
      
      const orderDays = customers.flatMap(c => 
        c.orders.map(o => new Date(o.orderDate).getDay())
      );

      // Find most common patterns
      const hourCounts = orderHours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const dayCounts = orderDays.reduce((acc, day) => {
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const bestHour = Object.entries(hourCounts).reduce((a, b) => 
        hourCounts[Number(a[0])] > hourCounts[Number(b[0])] ? a : b
      )[0];

      const bestDay = Object.entries(dayCounts).reduce((a, b) => 
        dayCounts[Number(a[0])] > dayCounts[Number(b[0])] ? a : b
      )[0];

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      return {
        bestTime: `${bestHour}:00`,
        bestDay: dayNames[Number(bestDay)],
        confidence: 0.8,
      };
    } catch (error) {
      logger.error('Failed to suggest optimal scheduling:', error);
      throw errors.INTERNAL_SERVER_ERROR('Failed to suggest optimal scheduling');
    }
  }

  static async generateLookalikeAudience(segmentId: string): Promise<{ rules: RuleGroup | RuleCondition; description: string; confidence: number }> {
    try {
      // Get segment customers
      const segment = await prisma.segment.findUnique({
        where: { id: segmentId },
        include: {
          customers: {
            include: {
              customer: true,
            },
          },
        },
      });

      if (!segment) {
        throw errors.NOT_FOUND('Segment not found');
      }

      const customers = segment.customers.map(sc => sc.customer);
      
      // Analyze customer characteristics
      const avgSpent = customers.reduce((sum, c) => sum + Number(c.totalSpent), 0) / customers.length;
      const avgOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length;
      
      const cities = customers.map(c => c.city).filter(Boolean);
      const countries = customers.map(c => c.country).filter(Boolean);
      
      const mostCommonCity = cities.reduce((a, b, i, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      );
      
      const mostCommonCountry = countries.reduce((a, b, i, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      );

      // Generate lookalike rules
      const rules: RuleGroup = {
        operator: 'AND',
        conditions: [
          { field: 'totalSpent', operator: 'gte', value: avgSpent * 0.8 },
          { field: 'totalSpent', operator: 'lte', value: avgSpent * 1.2 },
          { field: 'totalOrders', operator: 'gte', value: Math.floor(avgOrders * 0.8) },
        ],
      };

      if (mostCommonCity) {
        rules.conditions.push({ field: 'city', operator: 'eq', value: mostCommonCity });
      }

      if (mostCommonCountry) {
        rules.conditions.push({ field: 'country', operator: 'eq', value: mostCommonCountry });
      }

      const description = `Lookalike audience based on customers with similar spending patterns (₹${avgSpent.toFixed(0)} average) and order frequency (${avgOrders.toFixed(1)} orders)`;

      return {
        rules,
        description,
        confidence: 0.85,
      };
    } catch (error) {
      logger.error('Failed to generate lookalike audience:', error);
      throw errors.INTERNAL_SERVER_ERROR('Failed to generate lookalike audience');
    }
  }

  static async autoTagCampaign(campaignId: string): Promise<{ tags: string[]; confidence: number }> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          segment: {
            include: {
              customers: {
                include: {
                  customer: true,
                },
              },
            },
          },
        },
      });

      if (!campaign) {
        throw errors.NOT_FOUND('Campaign not found');
      }

      const systemPrompt = `You are an expert marketing analyst who automatically tags campaigns based on their characteristics.

Analyze the campaign and assign relevant tags from this list:
- Win-back: For campaigns targeting inactive customers
- High Value: For campaigns targeting high-spending customers
- New Customer: For campaigns targeting new customers
- Seasonal: For campaigns with seasonal messaging
- Promotional: For campaigns with discounts or offers
- Retention: For campaigns focused on customer retention
- Acquisition: For campaigns focused on new customer acquisition
- Upsell: For campaigns promoting higher-value products
- Cross-sell: For campaigns promoting related products
- Re-engagement: For campaigns targeting disengaged customers

Campaign Details:
- Name: ${campaign.name}
- Description: ${campaign.description || 'N/A'}
- Message: ${campaign.message}
- Audience Size: ${campaign.segment.customers.length}

Return a JSON object with this structure:
{
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.9
}`;

      const response = await this.openai.chat.completions.create({
        model: config.ai.openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyze and tag this campaign' },
        ],
        temperature: 0.2,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw errors.INTERNAL_SERVER_ERROR('No response from AI service');
      }

      const result = JSON.parse(content);
      
      // Log AI usage
      await this.logAIUsage('auto_tagging', { campaignId }, result, response.usage);

      return result;
    } catch (error) {
      logger.error('Failed to auto-tag campaign:', error);
      throw errors.INTERNAL_SERVER_ERROR('Failed to auto-tag campaign');
    }
  }

  private static async logAIUsage(
    type: string,
    input: any,
    output: any,
    usage?: any
  ): Promise<void> {
    try {
      await prisma.aIIntegration.create({
        data: {
          type,
          input: input as any,
          output: output as any,
          model: config.ai.openaiModel,
          tokens: usage?.total_tokens || 0,
          cost: usage?.total_tokens ? usage.total_tokens * 0.0001 : 0, // Rough estimate
        },
      });
    } catch (error) {
      logger.error('Failed to log AI usage:', error);
    }
  }
}

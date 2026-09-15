import { GoogleGenAI } from '@google/genai';
import prisma from '../../config/database';
import logger from '../../config/logger';
import { weatherService } from '../../services/weather.service';
import { calendarService } from '../../services/calendar.service';

// Initialize the Google Gen AI client
// The SDK automatically picks up GEMINI_API_KEY from the environment
let aiClient: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (error) {
  logger.warn('Failed to initialize GoogleGenAI. AI Copilot will operate in mock mode.');
}

export class CopilotService {
  /**
   * Generates a context-aware AI response based on the user's role and database context
   */
  public async generateChatResponse(
    userId: string,
    role: string,
    organizationId: string | null,
    message: string,
    history: any[] = []
  ): Promise<string> {
    try {
      // 1. Context Gathering (RAG)
      let contextData = '';
      if (role === 'CONSUMER') {
        const profile = await prisma.consumerProfile.findUnique({
          where: { userId },
          include: { bills: { take: 1, orderBy: { createdAt: 'desc' } } }
        });
        contextData = `User is a Consumer. Latest Bill: ${profile?.bills[0]?.totalAmount || 'None'}. 
        Focus on energy savings and explaining bills in simple terms.`;
      } else if (role === 'UTILITY_OFFICER') {
        contextData = `User is a Utility Officer in the field. Focus on smart meter diagnostics, theft detection, and transformer health.`;
      } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        const stats = await prisma.meter.count();
        const activeAlerts = await prisma.alert.count({ where: { status: 'NEW' } });
        contextData = `User is a System Administrator. Total Meters: ${stats}. Active Alerts: ${activeAlerts}. 
        Focus on high-level analytics, grid stability, and revenue protection.`;
      }

      // -- External Data Integration (Weather & Calendar) --
      try {
        const weather = await weatherService.getCurrentWeather();
        const calendar = calendarService.getCalendarInfo();
        
        const extContext = `\n\n[EXTERNAL CONTEXT]
        - Live Weather: ${weather ? `${weather.temperature}°C, ${weather.humidity}% Humidity, Rain: ${weather.rainfall}mm, Wind: ${weather.windSpeed}km/h` : 'Unknown'}
        - Date Context: Today is ${calendar.isHoliday ? 'a Holiday' : 'a standard workday'}. ${calendar.isFestival ? `Festival active: ${calendar.eventDescription}.` : ''}
        - AI Load Multiplier: Base demand is mathematically modified by x${calendar.loadImpactMultiplier} today based on the calendar.
        Use this external data to improve your demand forecasts, energy predictions, and peak load analysis in your answers.`;
        
        contextData += extContext;
      } catch (err) {
        logger.warn('Failed to attach external context to AI prompt.');
      }

      // Format history for the Gemini API
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const systemInstruction = `You are PowerGuard AI Copilot, a helpful AI assistant for an enterprise Smart Grid platform. 
      Your goal is to answer queries concisely based on the user's role and data context. Use Markdown formatting.
      Context Data: ${contextData}`;

      // 2. Generate Response
      if (aiClient) {
        // Use Gemini 3.1 Pro (or similar modern model)
        const chat = aiClient.chats.create({
          model: 'gemini-2.5-flash', // Using a standard fast model for chat
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.2
          }
        });

        // Seed history if supported (some SDKs require manual array management)
        // For simplicity with this version of the SDK, we'll append history manually if needed
        // but let's just send the message with context for a standard call
        
        const prompt = `Context Reminder: ${contextData}\n\nUser Query: ${message}`;
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.3
          }
        });
        
        return response.text || 'I could not generate a response.';
      } else {
        // Mock fallback if no API key is provided
        return await this.generateMockResponse(role, message);
      }
    } catch (error: any) {
      logger.error('Error generating AI response:', error);
      return 'I encountered an error while trying to process your request. Please ensure the AI API is configured correctly.';
    }
  }

  private async generateMockResponse(role: string, message: string): Promise<string> {
    const query = message.toLowerCase();
    
    // Fetch live external data for mock augmentation
    const weather = await weatherService.getCurrentWeather();
    const calendar = calendarService.getCalendarInfo();
    const weatherStr = weather ? `${weather.temperature}°C with ${weather.humidity}% humidity` : 'moderate';
    const dayContext = calendar.isHoliday ? 'Holiday' : calendar.isFestival ? 'Festival' : 'standard workday';
    
    if (role === 'CONSUMER') {
      if (query.includes('bill') || query.includes('high')) {
        return `Based on your recent data, your bill is higher due to **Air Conditioning** usage during Peak Hours. The live weather is currently **${weatherStr}**, driving up cooling costs. Consider shifting heavy usage to off-peak hours to save money.`;
      }
      if (query.includes('forecast') || query.includes('predict')) {
        return `Tomorrow is a **${dayContext}**. Expected energy usage will likely ${calendar.loadImpactMultiplier > 1 ? 'increase significantly' : 'decrease'}, so plan your appliances accordingly!`;
      }
      return "I can help you understand your energy usage and suggest ways to lower your electricity bill. What would you like to know?";
    }
    
    if (role === 'UTILITY_OFFICER') {
      if (query.includes('theft') || query.includes('anomaly')) {
        return "I found **3 potential theft cases** in Sector 4. The anomaly detection model flagged a 45% voltage drop bypassing Meter `M-782`. Recommend immediate field inspection.";
      }
      if (query.includes('peak') || query.includes('load')) {
        return `Since today is a **${dayContext}** and the weather is **${weatherStr}**, our models predict peak load will hit 115% capacity at 6 PM. Deploying load balancing is recommended.`;
      }
      return "I can analyze meter diagnostics and help you locate grid faults. How can I assist your field operations today?";
    }
    
    // Admin/Super Admin
    if (query.includes('summary') || query.includes('report')) {
      return `### Daily Grid Summary\n- **External Context**: ${weatherStr} | ${dayContext}\n- **Active Alerts**: 12 (3 High Priority)\n- **Grid Load**: ${calendar.loadImpactMultiplier * 85}% capacity expected today.\n- **Theft Detections**: 2 confirmed in North Region.\n\nAll transformers are operating within normal parameters.`;
    }
    
    return "I am the PowerGuard Copilot. I can analyze system metrics, generate theft reports, and explain grid anomalies. (Note: Running in Mock Mode - Please set GEMINI_API_KEY).";
  }
}

export const copilotService = new CopilotService();

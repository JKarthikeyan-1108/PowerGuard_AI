import axios from 'axios';
import logger from '../config/logger';

const AI_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000/api/ai';

export class AIService {
  async predictTheft(meterId: string, voltage: number, current: number, powerFactor: number, frequency: number, value: number) {
    try {
      const response = await axios.post(`${AI_URL}/theft`, {
        meter_id: meterId,
        voltage,
        current,
        power: voltage * current, // basic calc
        energy: value,
        frequency,
        power_factor: powerFactor,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error: any) {
      logger.error(`AI Engine Theft Predict Error: ${error.message}`);
      return null;
    }
  }

  async predictBill(consumerId: string, historicalUsage: number[], tariffRate: number, avgTemp: number) {
    try {
      const response = await axios.post(`${AI_URL}/bill`, {
        consumer_id: consumerId,
        historical_usage: historicalUsage,
        tariff_rate: tariffRate,
        avg_temp: avgTemp
      });
      return response.data;
    } catch (error: any) {
      logger.error(`AI Engine Bill Predict Error: ${error.message}`);
      return null;
    }
  }

  async forecastDemand(areaId: string, historicalDemand: number[]) {
    try {
      const response = await axios.post(`${AI_URL}/forecast`, {
        area_id: areaId,
        historical_demand: historicalDemand
      });
      return response.data;
    } catch (error: any) {
      logger.error(`AI Engine Forecast Error: ${error.message}`);
      return null;
    }
  }

  async getConsumerCluster(consumerId: string, avgDailyUsage: number, peakRatio: number, nightRatio: number) {
    try {
      const response = await axios.post(`${AI_URL}/cluster`, {
        consumer_id: consumerId,
        avg_daily_usage: avgDailyUsage,
        peak_ratio: peakRatio,
        night_ratio: nightRatio
      });
      return response.data;
    } catch (error: any) {
      logger.error(`AI Engine Clustering Error: ${error.message}`);
      return null;
    }
  }

  async getRecommendations(consumerId: string, avgDailyUsage: number, peakRatio: number, nightRatio: number) {
    try {
      const response = await axios.get(`${AI_URL}/recommendations/${consumerId}?avg_daily_usage=${avgDailyUsage}&peak_ratio=${peakRatio}&night_ratio=${nightRatio}`);
      return response.data;
    } catch (error: any) {
      logger.error(`AI Engine Recommendation Error: ${error.message}`);
      return null;
    }
  }
}

export const aiService = new AIService();

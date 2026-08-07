import axios from 'axios';
import logger from '../config/logger';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  isExtremeWeather: boolean;
}

export class WeatherService {
  /**
   * Fetches current weather data for a given location using Open-Meteo (No API Key required)
   */
  public async getCurrentWeather(lat: number = 28.6139, lon: number = 77.2090): Promise<WeatherData | null> {
    try {
      // Defaulting to New Delhi coordinates if none provided
      const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,rain,wind_speed_10m',
          timezone: 'auto'
        }
      });

      const current = response.data.current;
      if (!current) return null;

      const temp = current.temperature_2m;
      const rain = current.rain;
      const wind = current.wind_speed_10m;
      
      // Determine if weather is extreme (could impact grid stability)
      const isExtremeWeather = temp > 40 || temp < -5 || rain > 15 || wind > 50;

      return {
        temperature: temp,
        humidity: current.relative_humidity_2m,
        windSpeed: wind,
        rainfall: rain,
        isExtremeWeather
      };
    } catch (error: any) {
      logger.error(`[WeatherService] Failed to fetch weather data: ${error.message}`);
      return null;
    }
  }

  /**
   * Fetches a 3-day forecast to aid in demand prediction
   */
  public async getForecast(lat: number = 28.6139, lon: number = 77.2090): Promise<any | null> {
    try {
      const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          daily: 'temperature_2m_max,temperature_2m_min,rain_sum',
          timezone: 'auto',
          forecast_days: 3
        }
      });
      return response.data.daily;
    } catch (error: any) {
      logger.error(`[WeatherService] Failed to fetch forecast data: ${error.message}`);
      return null;
    }
  }
}

export const weatherService = new WeatherService();

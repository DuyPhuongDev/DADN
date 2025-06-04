import axios from "axios";
import { Alert } from "react-native";

// OpenWeatherMap API Constants
const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY";
const OPENWEATHER_BASE_URL = "YOUR_OPENWEATHER_BASE_URL";

// Weather API Types
export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  cloudiness: number;
  weatherMain: string;
  weatherDesc: string;
  iconCode: string;
  observedAt: string;
  uvi?: number;
  visibility?: number;
  rain1h?: number;
  snow1h?: number;
}

export interface ForecastItem {
  forecastFor: string;
  temp: number;
  weatherMain: string;
  weatherDesc: string;
  iconCode: string;
  pop: number; // Probability of precipitation
}

export interface WeatherResponse {
  current: WeatherData;
  hourly: ForecastItem[];
  daily: ForecastItem[];
}

/**
 * Weather Service
 *
 * Handles API calls to OpenWeatherMap for current weather and forecasts
 */
class WeatherService {
  /**
   * Get weather data for a location by coordinates
   *
   * @param lat Latitude of the location
   * @param lng Longitude of the location
   * @returns Weather data including current conditions and forecasts
   */
  async getWeatherByCoordinates(
    lat: number,
    lng: number
  ): Promise<WeatherResponse> {
    try {
      console.log(
        `Fetching current weather data for coordinates: ${lat}, ${lng}`
      );

      // Get current weather data
      const currentResponse = await axios.get(
        `${OPENWEATHER_BASE_URL}/weather`,
        {
          params: {
            lat,
            lon: lng,
            units: "metric", // Use metric units (Celsius)
            lang: "vi", // Get data in Vietnamese
            appid: OPENWEATHER_API_KEY,
          },
        }
      );

      console.log(
        "Current weather API response status:",
        currentResponse.status
      );

      const currentData = currentResponse.data;
      const formattedCurrent: WeatherData = {
        temp: currentData.main.temp,
        feelsLike: currentData.main.feels_like,
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        windSpeed: currentData.wind.speed,
        windDeg: currentData.wind.deg,
        cloudiness: currentData.clouds.all,
        weatherMain: currentData.weather[0].main,
        weatherDesc: currentData.weather[0].description,
        iconCode: currentData.weather[0].icon,
        observedAt: new Date(currentData.dt * 1000).toISOString(),
        visibility: currentData.visibility,
        rain1h: currentData.rain ? currentData.rain["1h"] : undefined,
        snow1h: currentData.snow ? currentData.snow["1h"] : undefined,
      };

      // Get forecast data
      console.log(`Fetching forecast data for coordinates: ${lat}, ${lng}`);
      const forecastResponse = await axios.get(
        `${OPENWEATHER_BASE_URL}/forecast`,
        {
          params: {
            lat,
            lon: lng,
            units: "metric",
            lang: "vi",
            appid: OPENWEATHER_API_KEY,
          },
        }
      );

      console.log("Forecast API response status:", forecastResponse.status);

      // Process hourly forecast data - The 5-day forecast API returns data in 3-hour intervals
      const forecastList = forecastResponse.data.list;

      // Map hourly data - take first 8 items (24 hours, 3-hour intervals)
      const formattedHourly: ForecastItem[] = forecastList
        .slice(0, 8)
        .map((item: any) => ({
          forecastFor: new Date(item.dt * 1000).toISOString(),
          temp: item.main.temp,
          weatherMain: item.weather[0].main,
          weatherDesc: item.weather[0].description,
          iconCode: item.weather[0].icon,
          pop: item.pop || 0, // probability of precipitation
        }));

      // Create daily forecast by grouping by day
      const formattedDaily: ForecastItem[] = [];
      const dailyMap = new Map<string, any[]>();

      // Group forecast entries by day
      forecastList.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toISOString().split("T")[0];

        if (!dailyMap.has(dayKey)) {
          dailyMap.set(dayKey, []);
        }

        dailyMap.get(dayKey)?.push(item);
      });

      // Create a daily forecast entry for each day (max 5 days)
      let dayCount = 0;
      dailyMap.forEach((dayItems, dayKey) => {
        if (dayCount >= 5) return; // Limit to 5 days

        // Use mid-day forecast as representative for the day, or average if needed
        const midDayItem =
          dayItems.find((item: any) => {
            const hour = new Date(item.dt * 1000).getHours();
            return hour >= 11 && hour <= 14;
          }) || dayItems[Math.floor(dayItems.length / 2)];

        formattedDaily.push({
          forecastFor: new Date(midDayItem.dt * 1000).toISOString(),
          temp: midDayItem.main.temp,
          weatherMain: midDayItem.weather[0].main,
          weatherDesc: midDayItem.weather[0].description,
          iconCode: midDayItem.weather[0].icon,
          pop: midDayItem.pop || 0,
        });

        dayCount++;
      });

      // Sort daily forecasts by date
      formattedDaily.sort(
        (a, b) =>
          new Date(a.forecastFor).getTime() - new Date(b.forecastFor).getTime()
      );

      return {
        current: formattedCurrent,
        hourly: formattedHourly,
        daily: formattedDaily,
      };
    } catch (error: any) {
      console.error("OpenWeatherMap API error:", error);
      console.error(
        "Error details:",
        error.response?.data || "No response data"
      );
      console.error("Status code:", error.response?.status || "No status code");

      Alert.alert(
        "Lỗi dữ liệu thời tiết",
        "Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau."
      );
      throw error;
    }
  }
}

export default new WeatherService();

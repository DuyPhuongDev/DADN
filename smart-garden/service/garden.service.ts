import apiClient from "./apiClient";
import { GARDEN_ENDPOINTS, DEVICE_ENPOINTS, TASK_ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  Garden,
  SensorInfo,
  GardenRequest,
  Task,
  SensorReading,
} from "@/types";

// OpenStreetMap Nominatim endpoint for geocoding
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";

const THUMBNAILS = [
  "https://images.unsplash.com/photo-1719755143528-764d5de86d91",
  "https://images.unsplash.com/photo-1619224699054-88ee8dc20ac2",
  "https://images.unsplash.com/photo-1566932864796-7fdc701a10b8",
  "https://images.unsplash.com/photo-1712624723700-675654270847",
  "https://images.unsplash.com/photo-1715113854365-dc74dfeaf27e",
  "https://images.unsplash.com/photo-1590409110085-e4d7e3128a92",
  "https://images.unsplash.com/photo-1622117578084-528f64244bb1",
];

// api for garden and device
class GardenService {
  // Get all gardens
  async getgardens(): Promise<Garden[]> {
    try {
      const response = await apiClient.get<ApiResponse<Garden[]>>(
        GARDEN_ENDPOINTS.LIST
      );
      const gardens = response.data.data;
      return gardens;
    } catch (error) {
      throw error;
    }
  }

  // create new garden
  async createGarden(garden: GardenRequest): Promise<Garden> {
    // Assign a random thumbnail from the THUMBNAILS array
    const randomIndex = Math.floor(Math.random() * THUMBNAILS.length);
    const randomThumbnail = THUMBNAILS[randomIndex];
    garden.thumbnail = randomThumbnail;
    try {
      const response = await apiClient.post<ApiResponse<Garden>>(
        GARDEN_ENDPOINTS.CREATE,
        garden
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // get garden by id
  async getGardenById(id: string | number): Promise<Garden> {
    try {
      const response = await apiClient.get<ApiResponse<Garden>>(
        GARDEN_ENDPOINTS.GET_BY_ID(Number(id))
      );
      const garden = response.data.data;

      // If coordinates are not available, use OpenStreetMap to fetch them
      if (!garden.lat || !garden.lng) {
        const location = `${garden.location}, ${garden.ward}, ${garden.district}, ${garden.city}, Vietnam`;
        const coordinates = await this.getCoordinatesFromOpenStreetMap(
          garden.location
        );
        if (coordinates) {
          garden.lat = coordinates.lat;
          garden.lng = coordinates.lng;
        } else {
          // Fallback to default coordinates if OpenStreetMap fails
          garden.lat = 10.762622; // HCMUT coordinates
          garden.lng = 106.660172; // HCMUT coordinates
        }
      }

      return garden;
    } catch (error) {
      throw error;
    }
  }

  // Get coordinates from OpenStreetMap using Nominatim
  async getCoordinatesFromOpenStreetMap(
    location: string
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(
        location
      )}&format=json&limit=1`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "SmartFarmApp/1.0", // OSM requires a User-Agent header
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from OpenStreetMap");
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching coordinates from OpenStreetMap:", error);
      return null;
    }
  }

  // get all sensors
  async getSensors(): Promise<SensorInfo[]> {
    try {
      const response = await apiClient.get<ApiResponse<SensorInfo[]>>(
        DEVICE_ENPOINTS.SENSORS
      );
      const sensors = response.data.data;
      return sensors;
    } catch (error) {
      throw error;
    }
  }

  // get watering schedule for a garden
  // async getWateringScheduleByGardenId(
  //   gardenId: string | number
  // ): Promise<any[]> {
  //   try {
  //     const response = await apiClient.get<ApiResponse<any[]>>(
  //       GARDEN_ENDPOINTS.WATERING_SCHEDULE(Number(gardenId))
  //     );
  //     return response.data.data;
  //   } catch (error) {
  //     console.error("Failed to fetch watering schedule", error);
  //     // Return empty array to avoid UI crashes
  //     return [];
  //   }
  // }

  // get activities for a garden
  async getActivitiesByGardenId(gardenId: number): Promise<Task[]> {
    try {
      const response = await apiClient.get<ApiResponse<Task[]>>(
        TASK_ENDPOINTS.COMPLETED_TASK(gardenId)
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch garden activities", error);
      // Return empty array to avoid UI crashes
      return [];
    }
  }

  // get all pumps
  async getPumps(gardenId: number): Promise<SensorInfo[]> {
    try {
      const response = await apiClient.get<ApiResponse<SensorInfo[]>>(
        DEVICE_ENPOINTS.PUMPS(gardenId)
      );
      const pumps = response.data.data;
      return pumps;
    } catch (error) {
      throw error;
    }
  }

  // get data for a specific sensor
  async getSensorData(sensorId: number): Promise<SensorReading[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(
        DEVICE_ENPOINTS.SENSOR_DATA(sensorId)
      );
      const sensorData = response.data.data;
      return sensorData;
    } catch (error) {
      throw error;
    }
  }
}

export default new GardenService();

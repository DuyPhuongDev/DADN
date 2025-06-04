import apiClient from "./apiClient";
import { NOTIFICATION_ENDPOINTS } from "./endpoints";

class NotificationService {
  /**
   * Add device token
   * @param deviceToken Device token
   * @returns Response data
   */
  async addDeviceToken(deviceToken: string): Promise<void> {
    try {
      const response = await apiClient.post(
        NOTIFICATION_ENDPOINTS.ADD_DEVICE_TOKEN,
        { deviceToken }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new NotificationService();

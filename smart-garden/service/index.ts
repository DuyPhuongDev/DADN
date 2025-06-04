import apiClient from "./apiClient";
import authService from "./auth.service";
import endpoints from "./endpoints";
import weatherService from "./weather.service";

/**
 * Service module exports
 *
 * This file exports all API services as a single module.
 * Add additional services here as they are created.
 */

// Pump API services
export const updatePumpStatus = async (
  pumpId: number,
  status: string
): Promise<any> => {
  try {
    console.log(`API: Updating pump ${pumpId} status to ${status}`);
    // Replace with actual API call when backend is ready
    // Example: return apiClient.put(`/pumps/${pumpId}/status`, { status });

    // For now, simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: `Status updated to ${status}` };
  } catch (error) {
    console.error("Error updating pump status:", error);
    throw error;
  }
};

export { apiClient, authService, endpoints, weatherService };

// Export default object with all services for easier imports
export default {
  api: apiClient,
  auth: authService,
  endpoints,
  weather: weatherService,
  updatePumpStatus,
};

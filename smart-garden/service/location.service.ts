import axios from "axios";

const API_BASE_URL = "https://provinces.open-api.vn/api";

/**
 * Interface for Province (Tỉnh/Thành phố) data
 */
export interface Province {
  code: string;
  codename: string;
  division_type: string;
  name: string;
  phone_code: number;
}

/**
 * Interface for District (Quận/Huyện) data
 */
export interface District {
  code: string;
  codename: string;
  division_type: string;
  name: string;
  province_code: number;
}

/**
 * Interface for Ward (Phường/Xã) data
 */
export interface Ward {
  code: string;
  codename: string;
  division_type: string;
  name: string;
  district_code: number;
}

/**
 * Location Service for handling Vietnam administrative division data
 */
class LocationService {
  /**
   * Get all provinces/cities in Vietnam
   */
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/p/`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch provinces:", error);
      return [];
    }
  }

  /**
   * Get all districts in a specific province
   * @param provinceCode The code of the province
   */
  async getDistricts(provinceCode: string): Promise<District[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/p/${provinceCode}?depth=2`
      );
      return response.data.districts || [];
    } catch (error) {
      console.error(
        `Failed to fetch districts for province ${provinceCode}:`,
        error
      );
      return [];
    }
  }

  /**
   * Get all wards in a specific district
   * @param districtCode The code of the district
   */
  async getWards(districtCode: string): Promise<Ward[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/d/${districtCode}?depth=2`
      );
      return response.data.wards || [];
    } catch (error) {
      console.error(
        `Failed to fetch wards for district ${districtCode}:`,
        error
      );
      return [];
    }
  }
}

export default new LocationService();

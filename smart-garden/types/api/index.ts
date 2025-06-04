import { GardenType, ActivityType, TaskStatus } from "@/constants/database";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  roleId: number;
  roleName?: string;
  gardens: { id: number; groupName: string }[];
  sensors: number;
  completedTask: number;
}

export interface SensorInfo {
  id: number;
  gardenId: number;
  gardenName: string;
  type: string;
  icon: string;
  unit?: string;
  feedName: string;
  groupName: string;
  name?: string;
  status?: PumpStatus;
}

export type SensorStatus = "normal" | "warning" | "critical";

export interface SensorData {
  sensorId: number;
  value: number;
  status: SensorStatus;
  timestamp: string;
}

// pump status enum
export enum PumpStatus {
  MAINTENANCE = "MAINTENANCE",
  AUTOMATIC = "AUTOMATIC",
  MANUAL = "MANUAL",
  ERROR = "ERROR",
}

export enum PumpValue {
  ON = "ON",
  OFF = "OFF",
}
export interface PumpData {
  sensorId: number;
  value: PumpValue;
  lastActivated: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string; // ISO datetime string
  path: string;
}
export interface GardenRequest {
  name: string;
  cropName: string;
  cropStage: string;
  description: string;
  thumbnail?: string;
  location: string;
  ward: string;
  district: string;
  city: string;
  groupName: string;
  gardenType: GardenType;
}

export interface SimpleSensorInfo {
  id: number;
  type: string;
  feedName: string;
}

export interface Garden {
  id: number;
  name: string;
  cropName: string;
  cropStage: string;
  thumbnail: string;
  location: string;
  city: string;
  district: string;
  ward: string;
  groupName: string;
  // map id:type
  // list sensors: SensorInfo[];
  sensors: SimpleSensorInfo[];
  lastActivity: string;
  gardenType: GardenType;
  createAt: string;
  updateAt: string;
  lat?: number; // Latitude coordinate for weather lookup
  lng?: number; // Longitude coordinate for weather lookup
}

export interface Task {
  id: number;
  name: string;
  description: string;
  status: TaskStatus;
  type: ActivityType;
  gardenId: number;
  gardenName: string;
  dueDate: string;
  updateAt: string;
}

export interface TaskRequest {
  name: string;
  description: string;
  status: TaskStatus;
  type: ActivityType;
  gardenId: number;
  dueDate: Date;
}

export interface SensorReading {
  value: number;
  timestamp: string;
}

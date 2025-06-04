// This file contains enums and constants that match the database schema

// Garden type enum
export enum GardenType {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  BALCONY = "BALCONY",
  ROOFTOP = "ROOFTOP",
  WINDOW_SILL = "WINDOW_SILL",
}

export enum CropStage {
  Seed = "Seed", // Hạt giống
  Germination = "Germination", // Nảy mầm
  Vegetative = "Vegetative", // Sinh trưởng
  Budding = "Budding", // Ra nụ
  Flowering = "Flowering", // Ra hoa
  Fruiting = "Fruiting", // Ra quả
  Maturity = "Maturity", // Trưởng thành
  Harvest = "Harvest", // Thu hoạch
}

// Garden status enum
export enum GardenStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  ARCHIVED = "ARCHIVED",
}

// Activity type enum
export enum ActivityType {
  WATERING = "WATERING",
  FERTILIZING = "FERTILIZING",
  PRUNING = "PRUNING",
  HARVESTING = "HARVESTING",
  PLANTING = "PLANTING",
  PEST_CONTROL = "PEST_CONTROL",
  SOIL_PREPARATION = "SOIL_PREPARATION",
  WEEDING = "WEEDING",
  OTHER = "OTHER",
}

// Task status enum
export enum TaskStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
}

// Sensor type enum
export enum SensorType {
  TEMPERATURE = "TEMPERATURE",
  HUMIDITY = "HUMIDITY",
  MOISTURE = "MOISTURE",
  LIGHT = "LIGHT",
  PUMP = "PUMP",
}

// Alert type enum
export enum AlertType {
  MOISTURE = "MOISTURE",
  TEMPERATURE = "TEMPERATURE",
  PEST = "PEST",
  WATERING = "WATERING",
  LIGHT = "LIGHT",
  HUMIDITY = "HUMIDITY",
  NUTRIENT = "NUTRIENT",
  WEATHER = "WEATHER",
  SENSOR_ERROR = "SENSOR_ERROR",
  SYSTEM = "SYSTEM",
  PLANT_CONDITION = "PLANT_CONDITION",
  ACTIVITY = "ACTIVITY",
  MAINTENANCE = "MAINTENANCE",
  SECURITY = "SECURITY",
  OTHER = "OTHER",
}

// Alert status enum
export enum AlertStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
  IGNORED = "IGNORED",
  IN_PROGRESS = "IN_PROGRESS",
  ESCALATED = "ESCALATED",
}

// Notification method enum
export enum NotificationMethod {
  PUSH = "PUSH",
  EMAIL = "EMAIL",
  SMS = "SMS",
  IN_APP = "IN_APP",
}

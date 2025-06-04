import {
  CropStage,
  SensorType,
  TaskStatus,
  ActivityType,
} from "@/constants/database";
export const getStageLabel = (stage: CropStage): string => {
  switch (stage) {
    case CropStage.Seed:
      return "Hạt giống";
    case CropStage.Germination:
      return "Nảy mầm";
    case CropStage.Vegetative:
      return "Sinh trưởng";
    case CropStage.Budding:
      return "Ra nụ";
    case CropStage.Flowering:
      return "Ra hoa";
    case CropStage.Fruiting:
      return "Ra quả";
    case CropStage.Maturity:
      return "Trưởng thành";
    case CropStage.Harvest:
      return "Thu hoạch";
    default:
      return "Không xác định";
  }
};

export const getTaskIcon = (type: string) => {
  switch (type) {
    case "WATERING":
      return "water-outline";
    case "FERTILIZING":
      return "leaf-outline";
    case "PRUNING":
      return "cut-outline";
    case "HARVESTING":
      return "basket-outline";
    case "PEST_CONTROL":
      return "bug-outline";
    case "PLANTING":
      return "trending-up-outline";
    case "WEEDING":
      return "remove-circle-outline";
    default:
      return "clipboard-outline";
  }
};

export const formatTaskDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow =
    new Date(now.setDate(now.getDate() + 1)).toDateString() ===
    date.toDateString();
  now.setDate(now.getDate() - 1);

  if (isToday) return `Today`;
  if (isTomorrow) return `Tomorrow`;
  return `${date.toLocaleDateString()}`;
};

export const getTypeLabel = (type: SensorType): string => {
  switch (type) {
    case SensorType.TEMPERATURE:
      return "Nhiệt độ";
    case SensorType.HUMIDITY:
      return "Độ ẩm";
    case SensorType.LIGHT:
      return "Ánh sáng";
    case SensorType.MOISTURE:
      return "Độ ẩm đất";
    case SensorType.PUMP:
      return "Máy bơm nước";
    default:
      return "Không xác định";
  }
};

export const translateTaskStatus = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.PENDING:
      return "Chờ xử lý";
    case TaskStatus.COMPLETED:
      return "Đã hoàn thành";
    case TaskStatus.SKIPPED:
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

export const getActivityTypeText = (type: ActivityType): string => {
  switch (type) {
    case ActivityType.WATERING:
      return "Tưới nước";
    case ActivityType.FERTILIZING:
      return "Bón phân";
    case ActivityType.PRUNING:
      return "Cắt tỉa";
    case ActivityType.HARVESTING:
      return "Thu hoạch";
    case ActivityType.PLANTING:
      return "Trồng cây";
    case ActivityType.PEST_CONTROL:
      return "Kiểm soát sâu bệnh";
    case ActivityType.SOIL_PREPARATION:
      return "Chuẩn bị đất";
    case ActivityType.WEEDING:
      return "Nhổ cỏ";
    default:
      return "Khác";
  }
};

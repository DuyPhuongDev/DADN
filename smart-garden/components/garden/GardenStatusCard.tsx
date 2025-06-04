import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { CropStage, GardenType } from "@/constants/database";
import type { Garden } from "@/types/api";
import { getStageLabel } from "@/utils/helper";

interface GardenStatusCardProps {
  garden: Garden;
  onViewPlantDetails?: () => void;
}

export default function GardenStatusCard({
  garden,
  onViewPlantDetails,
}: GardenStatusCardProps) {
  const theme = useAppTheme();

  const getGardenTypeIcon = (type: GardenType) => {
    switch (type) {
      case GardenType.INDOOR:
        return "home";
      case GardenType.OUTDOOR:
        return "tree";
      case GardenType.BALCONY:
        return "building";
      case GardenType.ROOFTOP:
        return "umbrella-beach";
      case GardenType.WINDOW_SILL:
        return "window-maximize";
      default:
        return "seedling";
    }
  };

  const getGardenTypeText = (type: GardenType): string => {
    switch (type) {
      case GardenType.INDOOR:
        return "Trong nhà";
      case GardenType.OUTDOOR:
        return "Ngoài trời";
      case GardenType.BALCONY:
        return "Ban công";
      case GardenType.ROOFTOP:
        return "Sân thượng";
      case GardenType.WINDOW_SILL:
        return "Bệ cửa sổ";
      default:
        return String(type);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Map API garden properties to the ones expected by the component
  const gardenTypeValue = garden.gardenType || GardenType.OUTDOOR;
  const hasPlantInfo = !!garden.cropName;

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Trạng thái vườn
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name={getGardenTypeIcon(gardenTypeValue)}
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Loại vườn
            </Text>
          </View>
          <Text style={[styles.value, { color: theme.text }]}>
            {getGardenTypeText(gardenTypeValue)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <FontAwesome5
              name="map-marker-alt"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Vị trí
            </Text>
          </View>
          <Text style={[styles.value, { color: theme.text }]}>
            {[garden.district, garden.city].filter(Boolean).join(", ") ||
              "Chưa xác định"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.labelContainer}>
            <FontAwesome5 name="calendar-alt" size={16} color={theme.primary} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Ngày tạo
            </Text>
          </View>
          <Text style={[styles.value, { color: theme.text }]}>
            {formatDate(garden.createAt)}
          </Text>
        </View>
      </View>

      {hasPlantInfo ? (
        <View style={[styles.plantContainer, { borderColor: theme.border }]}>
          <View style={styles.plantHeader}>
            <Text style={[styles.plantTitle, { color: theme.text }]}>
              Thông tin cây trồng
            </Text>
          </View>
          <View style={styles.plantInfoContainer}>
            <View style={styles.plantImageContainer}>
              <Image
                source={{
                  uri:
                    garden.thumbnail ||
                    `https://picsum.photos/seed/${garden.cropName}/100`,
                }}
                style={styles.plantImage}
              />
            </View>

            <View style={styles.plantDetails}>
              <View style={styles.plantRow}>
                <Text
                  style={[styles.plantLabel, { color: theme.textSecondary }]}
                >
                  Loại:
                </Text>
                <Text style={[styles.plantValue, { color: theme.text }]}>
                  {garden.cropName}
                </Text>
              </View>
              {garden.cropStage && (
                <View style={styles.plantRow}>
                  <Text
                    style={[styles.plantLabel, { color: theme.textSecondary }]}
                  >
                    Giai đoạn:
                  </Text>
                  <Text style={[styles.plantValue, { color: theme.text }]}>
                    {getStageLabel(garden.cropStage as CropStage)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noPlantContainer}>
          <Text style={[styles.noPlantText, { color: theme.textSecondary }]}>
            Chưa có thông tin cây trồng cho vườn này.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    marginLeft: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  plantContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
  },
  plantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  plantTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailsButtonText: {
    fontSize: 12,
    marginRight: 4,
  },
  plantInfoContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  plantImageContainer: {
    marginRight: 12,
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  plantDetails: {
    flex: 1,
    justifyContent: "center",
  },
  plantRow: {
    flexDirection: "row",
    marginVertical: 3,
  },
  plantLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  plantValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
  },
  progressTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressPercent: {
    fontSize: 12,
  },
  progressDays: {
    fontSize: 12,
  },
  noPlantContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  noPlantText: {
    marginTop: 8,
    textAlign: "center",
  },
});

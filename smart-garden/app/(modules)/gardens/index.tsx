import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router, Stack } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Garden } from "@/types/api";
import gardenService from "@/service/garden.service";
import { CropStage, GardenType } from "@/constants/database";
import { getStageLabel } from "@/utils/helper";

export default function GardensScreen() {
  const theme = useAppTheme();
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const fetchGardens = useCallback(async () => {
    setLoading(true);
    const gardens = await gardenService.getgardens();
    setGardens(gardens);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGardens();
  }, [fetchGardens]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGardens();
    setRefreshing(false);
  }, [fetchGardens]);

  // --- Helper Functions (Use new interface/enums) ---
  const getStageColor = (stage: CropStage): string => {
    switch (stage) {
      case CropStage.Seed:
        return theme.textTertiary; // xám nhạt, chưa phát triển
      case CropStage.Germination:
        return theme.primaryLight; // xanh lá sáng, bắt đầu nảy mầm
      case CropStage.Vegetative:
        return theme.primary; // xanh lá chính, đang phát triển
      case CropStage.Budding:
        return theme.secondary; // xanh dương, ra nụ
      case CropStage.Flowering:
        return theme.accent; // cam, ra hoa nổi bật
      case CropStage.Fruiting:
        return theme.plantHealthy; // xanh lá khỏe, ra quả
      case CropStage.Maturity:
        return theme.success; // xanh lá thành công, trưởng thành
      case CropStage.Harvest:
        return theme.warning; // vàng, sẵn sàng thu hoạch
      default:
        return theme.error; // đỏ, trạng thái không xác định
    }
  };

  const getGardenTypeIcon = (type: GardenType) => {
    switch (type) {
      case GardenType.INDOOR:
        return "home-outline";
      case GardenType.OUTDOOR:
        return "leaf-outline";
      case GardenType.BALCONY:
        return "grid-outline";
      case GardenType.ROOFTOP:
        return "business-outline";
      case GardenType.WINDOW_SILL:
        return "browsers-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getStageText = (stage: CropStage): string => {
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
        return "Cửa sổ";
      default:
        return type;
    }
  };

  // --- Render Logic (Use fields from GardenListItem) ---

  const renderGardenItem = ({ item }: { item: Garden }) => {
    // console.log(item);
    return (
      <TouchableOpacity
        style={styles.gardenCard}
        onPress={() => router.push(`/(modules)/gardens/${item.id}`)}
      >
        <Image
          source={{
            uri:
              item?.thumbnail ||
              "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e",
          }}
          style={styles.gardenThumbnail}
          resizeMode="cover"
          defaultSource={require("@/assets/images/icon.png")}
        />
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStageColor(item.cropStage as CropStage) },
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {getStageText(item.cropStage as CropStage)}
          </Text>
        </View>
        <View style={styles.gardenContent}>
          <Text style={styles.gardenTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.gardenMetaRow}>
            <View style={styles.gardenMetaItem}>
              <Ionicons
                name={getGardenTypeIcon(item.gardenType) as any}
                size={14}
                color={theme.textSecondary}
              />
              <Text style={styles.gardenMetaText}>
                {getGardenTypeText(item.gardenType)}
              </Text>
            </View>
            <View style={styles.gardenMetaItem}>
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.textSecondary}
              />
              <Text style={styles.gardenMetaText}>
                {item.location || "N/A"}
              </Text>
            </View>
          </View>
          {(item.cropName || item.cropStage) && (
            <Text style={styles.gardenPlantInfo} numberOfLines={1}>
              {[item.cropName, getStageLabel(item.cropStage as CropStage)]
                .filter(Boolean)
                .join(" • ")}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Quản lý Vườn" }} />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <FlatList
          data={gardens}
          renderItem={renderGardenItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.gardenList}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5
                name="seedling"
                size={48}
                color={theme.textTertiary}
              />
              <Text style={styles.emptyText}>
                Chưa có khu vườn nào được tạo.
              </Text>
              <TouchableOpacity
                style={[
                  styles.createButtonEmpty,
                  { flexDirection: "row", alignItems: "center" },
                ]}
                onPress={() => router.push("/(modules)/gardens/create")}
              >
                <Ionicons name="add" size={20} color={theme.card} />
                <Text style={styles.createButtonText}>
                  Tạo khu vườn đầu tiên
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(modules)/gardens/create")}
      >
        <Ionicons name="add" size={30} color={theme.card} />
      </TouchableOpacity>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.backgroundSecondary,
    },
    gardenList: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 80,
    },
    gardenCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16,
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      position: "relative",
    },
    gardenThumbnail: {
      width: "100%",
      height: 150,
      backgroundColor: theme.border,
    },
    statusBadge: {
      position: "absolute",
      top: 10,
      left: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      opacity: 0.9,
      zIndex: 1,
    },
    alertBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.error,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 5,
      zIndex: 1,
    },
    alertBadgeText: {
      color: theme.card,
      fontSize: 12,
      fontFamily: "Inter-Bold",
    },
    statusBadgeText: {
      color: theme.card,
      fontSize: 11,
      fontFamily: "Inter-SemiBold",
      textTransform: "uppercase",
    },
    gardenContent: {
      padding: 14,
    },
    gardenTitle: {
      fontSize: 17,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 8,
    },
    gardenMetaRow: {
      flexDirection: "row",
      marginBottom: 6,
      flexWrap: "wrap",
      gap: 16,
    },
    gardenMetaItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    gardenMetaText: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginLeft: 5,
    },
    gardenPlantInfo: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
      marginTop: 6,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      marginTop: 40,
      minHeight: 300,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 16,
      marginBottom: 24,
    },
    createButtonEmpty: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      elevation: 2,
    },
    createButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
      marginLeft: 8,
    },
    fab: {
      position: "absolute",
      bottom: 30,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
    },
  });

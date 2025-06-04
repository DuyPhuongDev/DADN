import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SectionList,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Feather,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import * as ImagePicker from "expo-image-picker";

// Import custom components
import WeatherDisplay from "@/components/garden/WeatherDisplay";
import SensorDetailView from "@/components/garden/SensorDetailView";
import type { SimpleSensorInfo } from "@/types/api";
import GardenStatusCard from "@/components/garden/GardenStatusCard";
import ActivityList from "@/components/garden/ActivityList";

// Import enums and potentially types from the central database constants/types file
import {
  ActivityType,
  TaskStatus,
  SensorType,
  GardenStatus,
} from "@/constants/database";
import weatherService from "@/service/weather.service";
import gardenService from "@/service/garden.service";
import type { Garden, Task } from "@/types/api";

// --- Define Local Interfaces based on Usage ---

enum DetailSectionType {
  HEADER_INFO = "HEADER_INFO",
  STATUS = "STATUS",
  WEATHER = "WEATHER",
  ALERTS = "ALERTS",
  SCHEDULE = "SCHEDULE",
  SENSORS = "SENSORS",
  ACTIVITY = "ACTIVITY",
  ACTIONS = "ACTIONS",
}

interface DetailSection {
  type: DetailSectionType;
  key: string;
  data: any[];
}

export default function GardenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for garden data (using Prisma types where possible)
  const [garden, setGarden] = useState<Garden | null>(null);
  const [currentWeather, setCurrentWeather] = useState<any | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [dailyForecast, setDailyForecast] = useState<any[]>([]);
  const [sensors, setSensors] = useState<SimpleSensorInfo[]>([]);
  const [activities, setActivities] = useState<Task[]>([]);

  // Load garden data using API
  const loadGardenData = useCallback(async (gardenId: string) => {
    if (!gardenId) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      const gardenData = await gardenService.getGardenById(gardenId);
      // const sensorData = await gardenService.getSensorsByGardenId(gardenId);
      const activityData = await gardenService.getActivitiesByGardenId(
        Number(gardenId)
      );
      setGarden(gardenData);
      const sensors = gardenData.sensors.filter(
        (s) => s.type !== SensorType.PUMP
      );
      setSensors(sensors);
      setActivities(activityData);

      // Fetch real weather data from OpenWeatherMap using the coordinates from garden data
      try {
        const weatherResponse = await weatherService.getWeatherByCoordinates(
          gardenData.lat ? gardenData.lat : 10.762622,
          gardenData.lng ? gardenData.lng : 106.660172
        );

        setCurrentWeather(weatherResponse.current);
        setHourlyForecast(weatherResponse.hourly);
        setDailyForecast(weatherResponse.daily);

        console.log("Weather data loaded successfully");
      } catch (weatherError) {
        console.error("Failed to load weather data:", weatherError);
      }
    } catch (error) {
      console.error("Failed to load garden data:", error);
      setGarden(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id && typeof id === "string") {
      loadGardenData(id);
    }
  }, [id, loadGardenData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (id && typeof id === "string") {
      loadGardenData(id).finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  }, [id, loadGardenData]);

  const sections: DetailSection[] = useMemo(() => {
    if (!garden) return [];

    let dataSections: DetailSection[] = [
      { type: DetailSectionType.STATUS, key: "status", data: [garden] },
      {
        type: DetailSectionType.WEATHER,
        key: "weather",
        data: [{ currentWeather, hourlyForecast, dailyForecast }],
      },
    ];

    dataSections.push({
      type: DetailSectionType.SENSORS,
      key: "sensors",
      data: [sensors],
    });

    if (activities.length > 0) {
      dataSections.push({
        type: DetailSectionType.ACTIVITY,
        key: "activity",
        data: [activities.slice(0, 5)],
      });
    } else {
      dataSections.push({
        type: DetailSectionType.ACTIVITY,
        key: "activity-empty",
        data: [[]],
      });
    }

    dataSections.push({
      type: DetailSectionType.ACTIONS,
      key: "actions",
      data: [{ gardenId: id }],
    });

    return dataSections;
  }, [
    garden,
    currentWeather,
    hourlyForecast,
    dailyForecast,
    sensors,
    activities,
    id,
  ]);

  const renderSectionItem = ({
    section,
    item,
  }: {
    section: DetailSection;
    item: any;
  }) => {
    switch (section.type) {
      case DetailSectionType.STATUS:
        return (
          <View style={styles.sectionContentPadding}>
            <GardenStatusCard
              garden={item}
              onViewPlantDetails={() => {
                console.log("Navigate to plant details for:", item.plantName);
              }}
            />
          </View>
        );
      case DetailSectionType.WEATHER:
        return (
          <View style={styles.sectionContentPadding}>
            {item.currentWeather ? (
              <WeatherDisplay
                currentWeather={item.currentWeather}
                hourlyForecast={item.hourlyForecast}
                dailyForecast={item.dailyForecast}
              />
            ) : (
              <Text style={styles.noDataText}>Loading weather...</Text>
            )}
          </View>
        );
      case DetailSectionType.SENSORS:
        return (
          <View style={styles.sectionContentPadding}>
            <SensorDetailView
              sensors={item}
              onSelectSensor={(sensor) => {
                // Just log the selection without navigation
                console.log("Sensor selected:", sensor.id);
              }}
            />
          </View>
        );
      case DetailSectionType.ACTIVITY:
        const activitiesToRender = item;
        if (!activitiesToRender || activitiesToRender.length === 0) {
          return (
            <Text style={[styles.noDataText, styles.sectionContentPadding]}>
              Chưa có hoạt động nào gần đây.
            </Text>
          );
        }
        return (
          <View style={styles.sectionContentPadding}>
            <ActivityList activities={activitiesToRender} />
          </View>
        );
      default:
        return null;
    }
  };

  const renderSectionHeader = ({ section }: { section: DetailSection }) => {
    let title = "";
    let showButton = false;
    let buttonText = "Xem tất cả";
    let buttonIcon: any = null;
    let buttonOnPress = () => {};
    switch (section.type) {
      case DetailSectionType.WEATHER:
        title = "Dự báo thời tiết";
        break;
      case DetailSectionType.ACTIVITY:
        title = "Hoạt động Gần đây";
        showButton = true;
        buttonText = "Xem tất cả";
        buttonIcon = (
          <MaterialIcons name="history" size={18} color={theme.primary} />
        );
        buttonOnPress = () => router.push(`/(modules)/tasks`); // Navigate to activities
        break;
      default:
        return null;
    }

    return (
      <View
        style={[styles.sectionContainerHeader, styles.sectionContentPadding]}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        {showButton && (
          <TouchableOpacity
            onPress={buttonOnPress}
            style={styles.sectionHeaderButton}
          >
            {buttonIcon}
            <Text style={styles.sectionHeaderButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading && !garden) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết vườn...</Text>
      </View>
    );
  }

  if (!garden) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Feather name="alert-triangle" size={40} color={theme.error} />
        <Text style={styles.errorText}>Không thể tải dữ liệu vườn.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonOnError}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: garden.name, headerShown: false }} />
      <View style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push(`/(modules)/gardens`)}
          >
            <Feather name="arrow-left" size={24} color={theme.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text
              style={[styles.headerTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {garden?.name}
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              {garden?.district
                ? `${garden.district}, ${garden.city}`
                : garden?.city}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              Alert.alert(
                "Chỉnh sửa vườn",
                "Vui lòng liên hệ với quản trị viên để chỉnh sửa thông tin vườn."
              )
            } // Placeholder for edit action
          >
            <Feather name="edit-2" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => {
            // Ensure a unique string key even if item.id is missing/invalid
            const keySuffix =
              typeof item?.id === "string" || typeof item?.id === "number"
                ? item.id.toString()
                : `idx-${index}`;
            return keySuffix;
          }}
          renderItem={renderSectionItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={[
            styles.listContentContainer,
            { paddingTop: Platform.OS === "ios" ? 90 : 80 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          SectionSeparatorComponent={() => (
            <View style={styles.sectionSeparator} />
          )}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      </View>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundSecondary,
    },
    listContentContainer: {
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    errorText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.error,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
      marginHorizontal: 20,
    },
    backButtonOnError: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    backButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: Platform.OS === "ios" ? 50 : 40,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    fixedHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: Platform.OS === "ios" ? 50 : 40,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    headerButton: {
      padding: 5,
    },
    headerTitleContainer: {
      flex: 1,
      marginHorizontal: 12,
      alignItems: "center",
    },
    headerTitle: { fontSize: 18, fontFamily: "Inter-Bold", color: theme.text },
    headerSubtitle: {
      fontSize: 13,
      marginTop: 2,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    sectionContainerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 12,
      paddingTop: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      marginBottom: 10,
    },
    sectionContentPadding: {
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
      color: theme.text,
      flexShrink: 1,
    },
    headerAlertCountBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
      paddingHorizontal: 5,
    },
    headerAlertCountText: {
      color: theme.card,
      fontSize: 12,
      fontFamily: "Inter-Bold",
    },
    sectionHeaderButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: theme.cardAlt,
    },
    sectionHeaderButtonText: {
      fontSize: 13,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      marginLeft: 4,
    },
    scheduleItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      marginHorizontal: 16,
    },
    scheduleInfo: {
      flex: 1,
      marginLeft: 12,
    },
    scheduleTime: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 2,
    },
    scheduleAmount: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    scheduleStatusContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: theme.backgroundAlt,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 5,
    },
    scheduleStatusText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
    },
    listSectionContainer: {},
    bottomActionContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 16,
      paddingBottom: 10,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      backgroundColor: theme.background,
      marginTop: 10,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme.primaryLight,
    },
    actionButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
    },
    itemSeparator: {
      height: 8,
    },
    sectionSeparator: {
      height: 10,
      backgroundColor: theme.backgroundAlt,
    },
    noDataText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      paddingVertical: 20,
    },
  });

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGlobal } from "@/contexts/GlobalContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PumpData, SensorInfo, PumpStatus, PumpValue } from "@/types";
import { updatePumpStatus } from "@/service";
import gardenService from "@/service/garden.service";

export default function PumpActionScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { mqttMessages, publish } = useGlobal();
  const { id: gardenId } = useLocalSearchParams<{ id: string }>(); // Get gardenId from route '[id]'
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [pumps, setPumps] = useState<SensorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pumpValuesMap, setPumpValuesMap] = useState<Record<number, PumpData>>(
    {}
  );

  // Load pump data
  const loadPumps = useCallback(async () => {
    if (!gardenId) return;
    setIsLoading(true);
    try {
      const pumps = await gardenService.getPumps(parseInt(gardenId));
      setPumps(pumps);
    } catch (error) {
      console.error("Failed to load pumps:", error);
    } finally {
      setIsLoading(false);
    }
  }, [gardenId]);

  useEffect(() => {
    loadPumps();
  }, [loadPumps]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPumps();
    setRefreshing(false);
  }, [loadPumps]);

  // Update pump values from MQTT when messages change
  useEffect(() => {
    // Process MQTT messages to update pump values
    const updatedPumpValues = { ...pumpValuesMap };
    let hasUpdates = false;

    pumps.forEach((pump) => {
      const feedKey = `${pump.groupName}.${pump.feedName}`;
      const mqttValue = mqttMessages[feedKey];

      if (mqttValue) {
        // Only update if value has changed
        if (
          !updatedPumpValues[pump.id] ||
          updatedPumpValues[pump.id].value !== mqttValue
        ) {
          hasUpdates = true;
          updatedPumpValues[pump.id] = {
            sensorId: pump.id,
            value: mqttValue as PumpValue,
            lastActivated: new Date().toISOString(), // Only update timestamp when value changes
          };
        }
      }
    });

    if (hasUpdates) {
      setPumpValuesMap(updatedPumpValues);
    }
  }, [mqttMessages, pumps]);

  // Handle pump status toggle - only MQTT, no API calls
  const handleTogglePump = useCallback(
    (pump: SensorInfo, newStatus: boolean) => {
      // Update pump status through MQTT
      const value = newStatus ? PumpValue.ON : PumpValue.OFF;
      publish(pump.groupName, pump.feedName, value);
      console.log(`Toggled pump ${pump.id} to ${value}`);

      // UI will update automatically when MQTT message is received back
    },
    [publish]
  );

  const handleStatusChange = useCallback(
    async (pump: SensorInfo, newStatus: PumpStatus) => {
      if (pump.status === newStatus) {
        // Don't make unnecessary API calls if status hasn't changed
        return;
      }

      try {
        // Call API to update pump status
        const response = await updatePumpStatus(pump.id, newStatus);
        if (response.success) {
          // Only update status in local state, not affecting value or lastActivated
          setPumps((currentPumps) =>
            currentPumps.map((p) =>
              p.id === pump.id ? { ...p, status: newStatus } : p
            )
          );
          console.log(`Changed pump ${pump.id} mode to ${newStatus}`);
        }
      } catch (error) {
        console.error("Failed to change pump status:", error);
      }
    },
    [publish]
  );

  const getPumpStatusColor = (status: PumpStatus) => {
    switch (status) {
      case PumpStatus.MANUAL:
        return theme.primary;
      case PumpStatus.AUTOMATIC:
        return theme.success;
      case PumpStatus.MAINTENANCE:
        return theme.warning;
      case PumpStatus.ERROR:
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  // Render a single pump card
  const renderPumpCard = ({ item }: { item: SensorInfo }) => {
    // Get real-time pump value data, either from our state map or create default
    const pumpValueData = pumpValuesMap[item.id] || {
      sensorId: item.id,
      value: PumpValue.OFF, // Default to OFF
      lastActivated: new Date().toISOString(), // Default timestamp
    };

    const isOn = pumpValueData.value === PumpValue.ON;
    const isManualMode = item.status === PumpStatus.MANUAL;

    return (
      <View style={[styles.pumpCard, { backgroundColor: theme.card }]}>
        <View style={styles.pumpHeader}>
          <MaterialCommunityIcons
            name="water-pump"
            size={24}
            color={isOn ? theme.success : theme.textSecondary}
          />
          <Text style={[styles.pumpName, { color: theme.text }]}>
            {item.name}
          </Text>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getPumpStatusColor(
                  item.status || PumpStatus.MANUAL
                ),
              },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {item.status || PumpStatus.MANUAL}
            </Text>
          </View>
        </View>

        <View style={styles.pumpDetails}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isOn ? theme.success : theme.error },
              ]}
            />
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {pumpValueData.value === PumpValue.ON
                ? "Đang hoạt động"
                : "Đã tắt"}
            </Text>
          </View>

          <Text
            style={[styles.lastActivatedText, { color: theme.textTertiary }]}
          >
            Kích hoạt lần cuối:{" "}
            {new Date(pumpValueData.lastActivated).toLocaleString("vi-VN")}
          </Text>
        </View>

        {/* Manual mode toggle - only enabled in MANUAL mode */}
        <View style={styles.controlContainer}>
          <Text
            style={[
              styles.controlLabel,
              {
                color: isManualMode ? theme.textSecondary : theme.textTertiary,
              },
            ]}
          >
            {pumpValueData.value === PumpValue.ON
              ? "Tắt máy bơm"
              : "Bật máy bơm"}
          </Text>
          <Switch
            value={pumpValueData.value === PumpValue.ON}
            onValueChange={(value) => {
              if (isManualMode) {
                handleTogglePump(item, value);
              } else {
                // Show disabled feedback - could add a toast here
                console.log("Pump can only be toggled in MANUAL mode");
              }
            }}
            disabled={!isManualMode}
            trackColor={{
              false: isManualMode ? theme.borderLight : theme.tabBackground,
              true: isManualMode
                ? `${theme.success}80`
                : theme.disabledBackground,
            }}
            thumbColor={
              isManualMode
                ? pumpValueData.value === PumpValue.ON
                  ? theme.success
                  : theme.border
                : theme.disabledForeground
            }
          />
        </View>

        {/* Status mode selector */}
        <View
          style={[
            styles.statusSelectorContainer,
            { borderTopColor: theme.borderLight },
          ]}
        >
          <Text
            style={[styles.statusSelectorLabel, { color: theme.textSecondary }]}
          >
            Chế độ hoạt động
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusButtonsScrollContent}
          >
            <View style={styles.statusButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  item.status === PumpStatus.MANUAL &&
                    styles.activeStatusButton,
                  {
                    borderColor:
                      item.status === PumpStatus.MANUAL
                        ? theme.primary
                        : theme.borderLight,
                  },
                ]}
                onPress={() => handleStatusChange(item, PumpStatus.MANUAL)}
              >
                <MaterialCommunityIcons
                  name="hand-back-right"
                  size={16}
                  color={
                    item.status === PumpStatus.MANUAL
                      ? theme.primary
                      : theme.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.statusButtonText,
                    {
                      color:
                        item.status === PumpStatus.MANUAL
                          ? theme.primary
                          : theme.textSecondary,
                    },
                  ]}
                >
                  THỦ CÔNG
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  item.status === PumpStatus.AUTOMATIC &&
                    styles.activeStatusButton,
                  {
                    borderColor:
                      item.status === PumpStatus.AUTOMATIC
                        ? theme.primary
                        : theme.borderLight,
                  },
                ]}
                onPress={() => handleStatusChange(item, PumpStatus.AUTOMATIC)}
              >
                <MaterialCommunityIcons
                  name="robot"
                  size={16}
                  color={
                    item.status === PumpStatus.AUTOMATIC
                      ? theme.primary
                      : theme.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.statusButtonText,
                    {
                      color:
                        item.status === PumpStatus.AUTOMATIC
                          ? theme.primary
                          : theme.textSecondary,
                    },
                  ]}
                >
                  TỰ ĐỘNG
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  item.status === PumpStatus.MAINTENANCE &&
                    styles.activeStatusButton,
                  {
                    borderColor:
                      item.status === PumpStatus.MAINTENANCE
                        ? theme.warning
                        : theme.borderLight,
                  },
                ]}
                onPress={() => handleStatusChange(item, PumpStatus.MAINTENANCE)}
              >
                <MaterialCommunityIcons
                  name="tools"
                  size={16}
                  color={
                    item.status === PumpStatus.MAINTENANCE
                      ? theme.warning
                      : theme.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.statusButtonText,
                    {
                      color:
                        item.status === PumpStatus.MAINTENANCE
                          ? theme.warning
                          : theme.textSecondary,
                    },
                  ]}
                >
                  BẢO TRÌ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  item.status === PumpStatus.ERROR && styles.activeStatusButton,
                  {
                    borderColor:
                      item.status === PumpStatus.ERROR
                        ? theme.error
                        : theme.borderLight,
                  },
                ]}
                onPress={() => handleStatusChange(item, PumpStatus.ERROR)}
              >
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={16}
                  color={
                    item.status === PumpStatus.ERROR
                      ? theme.error
                      : theme.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.statusButtonText,
                    {
                      color:
                        item.status === PumpStatus.ERROR
                          ? theme.error
                          : theme.textSecondary,
                    },
                  ]}
                >
                  LỖI
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="water-pump-off"
        size={60}
        color={theme.textTertiary}
      />
      <Text style={styles.emptyText}>
        Không có máy bơm nào được thiết lập cho vườn này.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: `Máy bơm - Vườn ${gardenId}`,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push("/(modules)/home")}
              style={styles.headerButton}
            >
              <MaterialCommunityIcons
                name="home"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách máy bơm...</Text>
        </View>
      ) : (
        <FlatList
          data={pumps}
          renderItem={renderPumpCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </SafeAreaView>
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
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.textSecondary,
    },
    listContentContainer: {
      padding: 16,
      paddingBottom: 80,
    },
    pumpCard: {
      marginBottom: 16,
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    pumpHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    pumpName: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      marginLeft: 8,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusBadgeText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      color: "#fff",
    },
    pumpDetails: {
      marginBottom: 16,
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    statusIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    lastActivatedText: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
    },
    controlContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    controlLabel: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    statusSelectorContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
    },
    statusSelectorLabel: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    statusButtonsScrollContent: {
      flexDirection: "row",
    },
    statusButtonsContainer: {
      flexDirection: "row",
      marginTop: 8,
    },
    statusButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderRadius: 8,
      marginRight: 8,
    },
    activeStatusButton: {
      backgroundColor: "#f0f0f0",
    },
    statusButtonText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      marginLeft: 4,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 50,
      paddingHorizontal: 30,
    },
    emptyText: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      color: theme.textSecondary,
      marginTop: 16,
      textAlign: "center",
    },
    headerButton: {
      marginLeft: 16,
    },
  });

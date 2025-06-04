import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { LineChart } from "react-native-chart-kit";
import { SimpleSensorInfo, SensorReading } from "@/types/api";
import { SensorType } from "@/constants/database";
import gardenService from "@/service/garden.service";
interface SensorDetailViewProps {
  sensors: SimpleSensorInfo[];
  onSelectSensor?: (sensor: SimpleSensorInfo) => void;
}

// Function to convert hex color to RGB (simplified, assumes hex is valid)
const hexToRgb = (hex: string) => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }; // Fallback to black
};

// Mock API function to fetch sensor readings
const fetchSensorReadings = async (
  sensorId: number
): Promise<SensorReading[]> => {
  // Simulate an API call
  const data = await gardenService.getSensorData(sensorId);
  console.log("Sensor readings:", data);
  return data;
};

export default function SensorDetailView({
  sensors,
  onSelectSensor,
}: SensorDetailViewProps) {
  const theme = useAppTheme();
  const [selectedSensor, setSelectedSensor] = useState<SimpleSensorInfo | null>(
    sensors.length > 0 ? sensors[0] : null
  );
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const screenWidth = Dimensions.get("window").width - 32; // Account for padding

  // Fetch sensor readings when a sensor is selected
  useEffect(() => {
    const loadSensorReadings = async () => {
      if (selectedSensor) {
        setIsLoading(true);
        try {
          const readings = await fetchSensorReadings(selectedSensor.id);
          // Update the sensor readings state
          setSensorReadings(readings);

          // Update the lastReading with the most recent value
          if (readings.length > 0) {
            const sortedReadings = [...readings].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );
            const lastValue = sortedReadings[0].value;
          }
        } catch (error) {
          console.error("Error fetching sensor readings:", error);
          // Handle error state if needed
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSensorReadings();
  }, [selectedSensor]);

  const handleSelectSensor = (sensor: SimpleSensorInfo) => {
    setSelectedSensor(sensor);

    // Call the callback if provided, but don't navigate
    if (onSelectSensor) {
      onSelectSensor(sensor);
    }
  };

  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "temperature-high";
      case SensorType.HUMIDITY:
        return "cloud-rain";
      case SensorType.MOISTURE:
        return "water";
      case SensorType.LIGHT:
        return "sun";
      default:
        return "question";
    }
  };

  const roundToTwoDecimals = (value: number) => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  };

  const getSensorUnit = (type: SensorType) => {
    switch (type) {
      case "TEMPERATURE":
        return "°C";
      case "HUMIDITY":
      case "MOISTURE":
        return "%";
      case "LIGHT":
        return "%";
      default:
        return "";
    }
  };

  const getSensorName = (type: SensorType) => {
    switch (type) {
      case "TEMPERATURE":
        return "Nhiệt độ";
      case "HUMIDITY":
        return "Độ ẩm";
      case "MOISTURE":
        return "Độ ẩm đất";
      case "LIGHT":
        return "Ánh sáng";
      default:
        return "Không rõ";
    }
  };

  const getSensorStatus = (type: SensorType, value: number) => {
    // These thresholds would ideally come from a configuration or be plant-specific
    switch (type) {
      case "TEMPERATURE":
        if (value < 10 || value > 35) return "critical";
        if (value < 15 || value > 30) return "warning";
        return "normal";
      case "HUMIDITY":
        if (value < 30 || value > 90) return "critical";
        if (value < 40 || value > 80) return "warning";
        return "normal";
      case "MOISTURE":
        if (value < 20) return "critical";
        if (value < 40) return "warning";
        return "normal";
      case "LIGHT":
        if (value < 30) return "critical";
        if (value < 50) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return theme.success;
      case "warning":
        return theme.warning;
      case "critical":
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  // Helper function to display Vietnamese status text
  const getStatusText = (status: string): string => {
    switch (status) {
      case "normal":
        return "Bình thường";
      case "warning":
        return "Cảnh báo";
      case "critical":
        return "Nguy cấp";
      default:
        return "Không rõ";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    // Use Vietnamese locale
    return date.toLocaleString("vi-VN", {
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format data for the chart
  const formatChartData = (
    readings: SensorReading[],
    sensorType: SensorType
  ) => {
    // Sort readings by timestamp
    const sortedReadings = [...readings].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Take last 24 readings (or all if less than 24)
    const displayReadings = sortedReadings.slice(-24);

    return {
      labels: displayReadings.map((reading) => {
        const date = new Date(reading.timestamp);
        // Format label as HH:mm
        return `${date.getHours()}:${date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;
      }),
      datasets: [
        {
          data: displayReadings.map((reading) => reading.value),
          color: () => theme.primary,
          strokeWidth: 2,
        },
      ],
      legend: [getSensorName(sensorType)],
    };
  };

  if (!selectedSensor) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
          Không có dữ liệu cảm biến
        </Text>
      </View>
    );
  }

  const chartData = formatChartData(
    sensorReadings,
    selectedSensor.type as SensorType
  );

  // Filter labels further for display
  const chartLabelsFiltered = chartData.labels.filter(
    (_, index) => index % Math.ceil(chartData.labels.length / 4) === 0
  ); // Show max ~4-5 labels

  // Get the latest reading for status calculation
  const latestReading =
    sensorReadings.length > 0
      ? sensorReadings.reduce((latest, reading) =>
          new Date(reading.timestamp) > new Date(latest.timestamp)
            ? reading
            : latest
        ).value
      : 0;
  // : selectedSensor.lastReading ?? 0;

  const sensorStatus = getSensorStatus(
    selectedSensor.type as SensorType,
    latestReading
  );
  const statusColor = getStatusColor(sensorStatus);
  const statusText = getStatusText(sensorStatus);

  // Get RGB values for chart configuration
  const primaryRgb = hexToRgb(theme.primary);

  // render component empty
  if (sensors.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
          Không có cảm biến nào
        </Text>
      </View>
    );
  }
  // render component with sensors
  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Số liệu cảm biến
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sensorTabs}
      >
        {sensors.map((sensor) => (
          <TouchableOpacity
            key={sensor.id}
            style={[
              styles.sensorTab,
              selectedSensor?.id === sensor.id
                ? {
                    backgroundColor: theme.primaryLight,
                    borderColor: theme.primary,
                  }
                : { borderColor: theme.border },
            ]}
            onPress={() => handleSelectSensor(sensor)}
          >
            <FontAwesome5
              name={getSensorIcon(sensor.type as SensorType)}
              size={18}
              color={
                selectedSensor?.id === sensor.id
                  ? theme.primary
                  : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.sensorTabText,
                selectedSensor?.id === sensor.id
                  ? { color: theme.primary, fontFamily: "Inter-SemiBold" }
                  : { color: theme.textSecondary },
              ]}
              numberOfLines={1}
            >
              {getSensorName(sensor.type as SensorType)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.selectedSensorContainer}>
        <View style={styles.sensorHeader}>
          <View style={styles.sensorTypeContainer}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <FontAwesome5
                name={getSensorIcon(selectedSensor.type as SensorType)}
                size={24}
                color={theme.primary}
              />
            </View>
            <Text style={[styles.sensorType, { color: theme.text }]}>
              {getSensorName(selectedSensor.type as SensorType)}
            </Text>
          </View>

          <View style={styles.currentValueContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : latestReading !== undefined ? (
              <>
                <Text
                  style={[
                    styles.currentValueLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Số liệu hiện tại:
                </Text>
                <Text style={[styles.currentValue, { color: statusColor }]}>
                  {roundToTwoDecimals(latestReading)}
                  <Text style={styles.unit}>
                    {getSensorUnit(selectedSensor.type as SensorType)}
                  </Text>
                </Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: statusColor }]}
                >
                  <Text style={styles.statusText}>{statusText}</Text>
                </View>
              </>
            ) : (
              <Text style={{ color: theme.textSecondary }}>
                Chưa có dữ liệu
              </Text>
            )}
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: theme.textSecondary }]}>
            Lịch sử 24 giờ
          </Text>
          {isLoading ? (
            <View style={styles.noChartDataContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text
                style={[styles.loadingText, { color: theme.textSecondary }]}
              >
                Đang tải dữ liệu...
              </Text>
            </View>
          ) : sensorReadings.length > 0 ? (
            <LineChart
              data={{ ...chartData, labels: chartLabelsFiltered }}
              width={screenWidth - 40}
              height={200}
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 1,
                color: (opacity = 1) =>
                  `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${opacity})`,
                labelColor: (opacity = 1) => theme.textSecondary,
                style: {
                  borderRadius: 8,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "1",
                  stroke: theme.primaryDark,
                },
                propsForBackgroundLines: {
                  strokeDasharray: "",
                  stroke: theme.borderLight,
                },
              }}
              bezier
              style={styles.chartStyle}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
              segments={4}
              verticalLabelRotation={30}
            />
          ) : (
            <View style={styles.noChartDataContainer}>
              <Text
                style={[styles.noChartDataText, { color: theme.textSecondary }]}
              >
                Không đủ dữ liệu để vẽ biểu đồ.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.latestReadingsContainer}>
          <Text style={[styles.latestReadingsTitle, { color: theme.text }]}>
            Dữ liệu gần đây
          </Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : (
            <ScrollView style={styles.readingsTable}>
              {sensorReadings.length > 0 ? (
                sensorReadings
                  .slice()
                  .sort((a, b) => {
                    return (
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                    );
                  })
                  .slice(0, 10)
                  .map((reading, index) => (
                    <View
                      key={index}
                      style={[
                        styles.readingRow,
                        {
                          backgroundColor:
                            index % 2 === 0
                              ? theme.backgroundSecondary
                              : theme.card,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.readingTimestamp,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {formatDateTime(reading.timestamp)}
                      </Text>
                      <Text
                        style={[styles.readingValue, { color: theme.text }]}
                      >
                        {roundToTwoDecimals(reading.value)}
                        {getSensorUnit(selectedSensor.type as SensorType)}
                      </Text>
                      <View
                        style={[
                          styles.readingStatus,
                          {
                            backgroundColor: getStatusColor(
                              getSensorStatus(
                                selectedSensor.type as SensorType,
                                reading.value
                              )
                            ),
                          },
                        ]}
                      />
                    </View>
                  ))
              ) : (
                <Text
                  style={[
                    styles.noReadingsText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Chưa có dữ liệu
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
  },
  sensorTabs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  sensorTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  sensorTabText: {
    fontSize: 12,
    marginLeft: 6,
  },
  selectedSensorContainer: {
    marginTop: 8,
  },
  sensorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sensorTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sensorType: {
    fontSize: 16,
    fontWeight: "bold",
  },
  currentValueContainer: {
    alignItems: "flex-end",
  },
  currentValueLabel: {
    fontSize: 12,
  },
  currentValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  unit: {
    fontSize: 14,
    fontWeight: "normal",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  chartContainer: {
    marginVertical: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noChartDataContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  noChartDataText: {
    fontSize: 14,
  },
  latestReadingsContainer: {
    marginTop: 16,
  },
  latestReadingsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  readingsTable: {
    maxHeight: 300,
  },
  readingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  readingTimestamp: {
    flex: 2,
    fontSize: 12,
  },
  readingValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  readingStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  noReadingsText: {
    textAlign: "center",
    marginVertical: 12,
    fontSize: 14,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 8,
  },
  loadingContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Task } from "@/types/api";
import {
  getTaskIcon,
  formatTaskDate,
  getActivityTypeText,
} from "@/utils/helper";
import { ActivityType } from "@/constants/database";
interface ActivityListProps {
  activities: Task[];
  onPressActivity?: (activity: Task) => void;
}

export default function ActivityList({
  activities,
  onPressActivity,
}: ActivityListProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  // Helper function to get the appropriate color for each activity type
  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case ActivityType.WATERING:
        return theme.waterLevel;
      case ActivityType.FERTILIZING:
        return theme.soilQuality || theme.success;
      case ActivityType.PRUNING:
        return theme.secondary;
      case ActivityType.HARVESTING:
        return theme.accent;
      case ActivityType.PLANTING:
        return theme.gardenOutdoor || theme.primary;
      case ActivityType.WEEDING:
        return theme.warning;
      default:
        return theme.primary;
    }
  };

  const renderActivityItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => onPressActivity && onPressActivity(item)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${getActivityColor(item.type)}20` },
        ]}
      >
        <Ionicons
          name={getTaskIcon(item.type) as any}
          size={24}
          color={getActivityColor(item.type)}
        />
      </View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityType}>
          {getActivityTypeText(item.type)}
        </Text>
        <Text style={styles.activityTime}>{formatTaskDate(item.dueDate)}</Text>
        <Text style={styles.activityDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!activities || activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có hoạt động gần đây.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      renderItem={renderActivityItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false} // Disable scrolling within the FlatList
    />
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    listContainer: {
      paddingTop: 8,
    },
    emptyContainer: {
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontFamily: "Inter-Regular",
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    activityDetails: {
      flex: 1,
    },
    activityType: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 2,
    },
    activityTime: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
      marginBottom: 4,
    },
    activityDescription: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
  });

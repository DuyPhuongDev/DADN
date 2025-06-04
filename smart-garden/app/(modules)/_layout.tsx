import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
  Entypo,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/ThemeContext";

export default function ModuleLayout() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textTertiary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: "Inter-Medium",
            marginBottom: Platform.OS === "ios" ? 0 : 4,
          },
          tabBarStyle: {
            height: 50 + (Platform.OS === "ios" ? insets.bottom : 0),
            paddingBottom: Platform.OS === "ios" ? insets.bottom + 4 : 6,
            paddingTop: 4,
            backgroundColor: theme.tabBackground,
            borderTopColor: theme.borderLight,
            elevation: 8,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          headerStyle: {
            backgroundColor: theme.background,
            elevation: 2,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            borderBottomColor: theme.borderLight,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            fontFamily: "Inter-Bold",
            color: theme.text,
            fontSize: 18,
          },
          headerTintColor: theme.primary, // For back buttons and other header elements
          headerShown: true,
        }}
      >
        {/* 1. Home Tab - Dashboard for quick access */}
        <Tabs.Screen
          name="home/index"
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            headerTitle: "Nông trại thông minh",
          }}
        />

        {/* 2. Gardens Tab - All garden management */}
        <Tabs.Screen
          name="gardens/index"
          options={{
            title: "Quản lý vườn",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="flower" size={size} color={color} />
            ),
            headerTitle: "Vườn của tôi",
          }}
        />

        {/* Dynamic garden route - not a tab */}
        <Tabs.Screen
          name="gardens/[id]"
          options={{
            href: null,
            title: "Chi tiết vườn",
            headerTitle: "Chi tiết vườn",
          }}
        />

        <Tabs.Screen
          name="gardens/pumps/[id]"
          options={{
            href: null,
            title: "Máy bơm - Vườn",
            headerTitle: "Máy bơm",
          }}
        />
        {/* Add configurations to hide newly created garden screens */}
        <Tabs.Screen
          name="gardens/create"
          options={{
            href: null,
            headerTitle: "Tạo vườn mới",
          }}
        />
        {/* 4. Tasks Tab - Schedule and monitor tasks */}
        <Tabs.Screen
          name="tasks/index"
          options={{
            title: "Công việc",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="task-alt" size={size} color={color} />
            ),
            headerTitle: "Công việc vườn",
          }}
        />
        <Tabs.Screen
          name="tasks/new"
          options={{
            href: null,
            headerTitle: "Thêm công việc mới",
          }}
        />

        {/* 5. Profile Tab - User profile and settings */}
        <Tabs.Screen
          name="profile/index"
          options={{
            title: "Cá nhân",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="user" size={size - 2} color={color} />
            ),
            headerTitle: "Hồ sơ của tôi",
          }}
        />
      </Tabs>
    </>
  );
}

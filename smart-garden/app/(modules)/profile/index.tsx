import React, { useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  Pressable,
  Alert,
} from "react-native";
import { useGlobal } from "@/contexts/GlobalContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { removeItem } from "@/utils/asyncStorage";
import { ONBOARDING_COMPLETED_KEY } from "@/constants/strings";

const CustomSwitch = ({
  value,
  onValueChange,
  disabled,
  tint,
  theme,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled: boolean;
  tint: string;
  theme: any;
}) => (
  <Pressable
    onPress={() => {
      if (!disabled) {
        onValueChange(!value);
      }
    }}
    style={{ padding: 5 }}
    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
  >
    <Switch
      trackColor={{ false: "#767577", true: tint }}
      thumbColor={value ? theme.primary : "#f4f3f4"}
      ios_backgroundColor="#3e3e3e"
      onValueChange={onValueChange}
      value={value}
      disabled={disabled}
    />
  </Pressable>
);

export default function ProfileScreen() {
  const { user, signOut } = useGlobal();
  const appTheme = useAppTheme();
  const {
    setTheme,
    isDarkMode,
    theme: themeMode,
    effectiveColorScheme,
  } = useTheme();

  const darkModeInteractingRef = useRef(false);
  const systemThemeInteractingRef = useRef(false);
  const lastSwitchTimeRef = useRef(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      darkModeInteractingRef.current = false;
      systemThemeInteractingRef.current = false;
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [isDarkMode, themeMode]);

  const handleThemeChange = useCallback(
    (value: boolean) => {
      if (darkModeInteractingRef.current) return;
      darkModeInteractingRef.current = true;
      const now = Date.now();
      if (now - lastSwitchTimeRef.current < 500) return;
      lastSwitchTimeRef.current = now;

      if (typeof setTheme !== "function" || typeof isDarkMode === "undefined")
        return;

      if ((value && !isDarkMode) || (!value && isDarkMode)) {
        setTheme(value ? "dark" : "light");
      }
    },
    [isDarkMode, setTheme]
  );

  const handleSystemThemeToggle = useCallback(
    (useSystemTheme: boolean) => {
      if (systemThemeInteractingRef.current) return;
      systemThemeInteractingRef.current = true;
      const now = Date.now();
      if (now - lastSwitchTimeRef.current < 500) return;
      lastSwitchTimeRef.current = now;

      if (useSystemTheme && themeMode !== "system") {
        setTheme("system");
      } else if (!useSystemTheme && themeMode === "system") {
        setTheme(effectiveColorScheme);
      }
    },
    [themeMode, effectiveColorScheme, setTheme]
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };
  console.log("picture", user?.profilePicture);

  const resetOnboarding = async () => {
    try {
      Alert.alert(
        "Khôi phục cài đặt gốc",
        "Bạn có chắc chắn muốn khôi phục cài đặt gốc không? Điều này sẽ xóa tất cả dữ liệu của bạn.",
        [
          { text: "Huỷ bỏ", style: "cancel" },
          {
            text: "OK",
            onPress: async () => {
              await removeItem(ONBOARDING_COMPLETED_KEY);
              handleSignOut();
            },
            style: "destructive",
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to reset onboarding status");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: appTheme.backgroundSecondary },
      ]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[styles.profileHeader, { backgroundColor: appTheme.primary }]}
        >
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://i.pravatar.cc/150?img=17",
              }}
              style={styles.profileImage}
            />
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: appTheme.backgroundSecondary },
              ]}
            >
              <Text style={[styles.levelText, { color: appTheme.primary }]}>
                {"🌱"} {user?.gardens?.length || 1}
              </Text>
            </View>
          </View>

          <Text style={styles.profileName}>
            {user ? `${user.firstName} ${user.lastName}` : "Garden Enthusiast"}
          </Text>
          <Text style={styles.profileRole}>GARDENER</Text>
        </View>

        <View
          style={[styles.detailsContainer, { backgroundColor: appTheme.card }]}
        >
          <Text style={[styles.sectionTitle, { color: appTheme.text }]}>
            Thông tin cá nhân
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={appTheme.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text
                style={[styles.infoLabel, { color: appTheme.textSecondary }]}
              >
                Email
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.email || "gardener@example.com"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="call-outline"
                size={20}
                color={appTheme.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text
                style={[styles.infoLabel, { color: appTheme.textSecondary }]}
              >
                Phone
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.phoneNumber || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={appTheme.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text
                style={[styles.infoLabel, { color: appTheme.textSecondary }]}
              >
                Date of Birth
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString()
                  : "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="location-outline"
                size={20}
                color={appTheme.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text
                style={[styles.infoLabel, { color: appTheme.textSecondary }]}
              >
                Address
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.address || "Not provided"}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[styles.statsContainer, { backgroundColor: appTheme.card }]}
        >
          <Text style={[styles.sectionTitle, { color: appTheme.text }]}>
            Thống kê
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: appTheme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="flower"
                  size={24}
                  color={appTheme.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: appTheme.text }]}>
                {user?.gardens?.length ?? 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: appTheme.textSecondary }]}
              >
                Gardens
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: appTheme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="access-point"
                  size={24}
                  color={appTheme.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: appTheme.text }]}>
                {user?.sensors ?? 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: appTheme.textSecondary }]}
              >
                Sensors
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: appTheme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={24}
                  color={appTheme.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: appTheme.text }]}>
                {user?.completedTask ?? 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: appTheme.textSecondary }]}
              >
                Tasks Completed
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[styles.settingsSection, { backgroundColor: appTheme.card }]}
        >
          <Text style={[styles.sectionTitle, { color: appTheme.text }]}>
            Settings & More
          </Text>

          <View style={[styles.menuItem]}>
            <Feather
              name="moon"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Dark Mode
            </Text>
            <CustomSwitch
              value={isDarkMode}
              onValueChange={handleThemeChange}
              disabled={themeMode === "system"}
              tint={`${appTheme.primary}80`}
              theme={appTheme}
            />
          </View>
          <View style={[styles.menuItem]}>
            <Feather
              name="smartphone"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Use System Settings
            </Text>
            <CustomSwitch
              value={themeMode === "system"}
              onValueChange={handleSystemThemeToggle}
              disabled={false}
              tint={`${appTheme.primary}80`}
              theme={appTheme}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert("Hỗ trợ", "Liên hệ với chúng tôi để được hỗ trợ")
            }
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Help & Support
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={appTheme.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(
                "Thông tin",
                "Ứng dụng này được phát triển bởi dphuongdev"
              )
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              About
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={appTheme.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.dangerZone, { backgroundColor: appTheme.card }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.error }]}>
            Danger Zone
          </Text>
          <TouchableOpacity style={styles.menuItem} onPress={resetOnboarding}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color={appTheme.error}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.error }]}>
              Đặt lại cài đặt gốc
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={appTheme.error}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.error }]}>
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  levelBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  levelText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: "#FFFFFFB3",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  experienceContainer: {
    width: "80%",
    alignItems: "center",
  },
  experienceBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#FFFFFF40",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  experienceFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  experienceText: {
    fontSize: 12,
    color: "#FFFFFFB3",
  },
  detailsContainer: {
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoIcon: {
    width: 30,
    alignItems: "center",
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  editDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 8,
  },
  editDetailsText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  settingsSection: {
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dangerZone: {
    marginHorizontal: 15,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  menuIcon: {
    width: 30,
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
  },
});

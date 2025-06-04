import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useGlobal } from "@/contexts/GlobalContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import notificationService from "@/service/notification.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Key to track if device token has been registered
const DEVICE_TOKEN_REGISTERED = "@device_token_registered";

export default function AuthScreen() {
  const theme = useAppTheme();
  const { isDarkMode } = useTheme();
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const styles = useMemo(() => createStyles(theme), [theme]);

  const { signIn } = useGlobal();

  // Function to register device token for push notifications
  const registerDeviceToken = async () => {
    try {
      // Check if device token has already been registered
      const isRegistered = await AsyncStorage.getItem(DEVICE_TOKEN_REGISTERED);
      if (isRegistered === "true") {
        console.log("Device token already registered");
        return;
      }

      // Get push token from Expo
      const deviceToken = await registerForPushNotificationsAsync();
      if (deviceToken) {
        // Send token to backend
        await notificationService.addDeviceToken(deviceToken);
        // Mark as registered
        await AsyncStorage.setItem(DEVICE_TOKEN_REGISTERED, "true");
        console.log("Device token registered successfully:", deviceToken);
      }
    } catch (error) {
      console.error("Failed to register device token:", error);
      // Don't show error to user - this is a background process
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMessage("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await signIn({ email, password });
      // Register device token after successful login
      await registerDeviceToken();
      // The navigation will be handled in the root layout
    } catch (error) {
      console.error("Sign in failed:", error);
      setErrorMessage(
        "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/hcmut.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Smart Farm</Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
          </View>

          <View style={styles.formContainer}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* email Input */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.inputPlaceholder}
                value={email}
                onChangeText={setemail}
                autoCapitalize="none"
                keyboardType="default"
                textContentType="emailAddress"
              />
            </View>

            {/* Password Input */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={theme.inputPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Don't have an account? Contact your administrator at{" "}
              <Text
                style={styles.linkText}
                onPress={() => {
                  console.log("Link to mailto:phuong.tranduy@hcmut.edu.vn");
                }}
              >
                phuong.tranduy@hcmut.edu.vn
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundSecondary,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    logoContainer: {
      alignItems: "center",
      marginTop: 40,
      marginBottom: 40,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 8,
      fontFamily: "Inter-Bold",
      color: theme.text,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    formContainer: {
      width: "100%",
    },
    errorText: {
      color: "#D32F2F",
      marginBottom: 20,
      fontSize: 14,
      fontFamily: "Inter-Regular",
      textAlign: "center",
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      fontFamily: "Inter-Medium",
      color: theme.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 10,
      height: 55,
      marginBottom: 20,
      backgroundColor: theme.inputBackground,
      borderColor: theme.border,
    },
    inputIcon: {
      marginLeft: 16,
    },
    input: {
      flex: 1,
      paddingHorizontal: 8,
      fontSize: 16,
      fontFamily: "Inter-Regular",
      height: "100%",
      color: theme.text,
    },
    showPasswordButton: {
      padding: 16,
    },
    forgotPasswordButton: {
      alignSelf: "flex-end",
      marginBottom: 24,
    },
    forgotPasswordText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
    },
    signInButton: {
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
    },
    signInButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      fontFamily: "Inter-Bold",
      color: "#FFFFFF",
    },
    footerContainer: {
      marginTop: 40,
      alignItems: "center",
    },
    footerText: {
      fontSize: 14,
      textAlign: "center",
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    linkText: {
      color: theme.primary,
      textDecorationLine: "underline",
    },
  });

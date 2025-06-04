import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { getItem, setItem, removeItem } from "@/utils/asyncStorage";
import { connect, MqttClient } from "@taoqf/react-native-mqtt";
import env from "@/config/environment";
const { adafruitUsername, adafruitKey, mqttBroker } = env;
import {
  User,
  SensorInfo,
  AuthCredentials,
  MQTTConnectionState,
  USER,
  AUTH_KEY,
} from "@/types";
import { authService } from "@/service";

// ===== Context Creation =====
export type GlobalContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  mqttClientRef: React.MutableRefObject<MqttClient | null>;
  mqttConnectionStateRef: React.MutableRefObject<MQTTConnectionState | null>;
  publish: (groupName: string, feedName: string, message: string) => void;
  subscribe: (groupName: string, feedName: string) => void;
  unsubscribe: (groupName: string, feedName: string) => void;
  mqttMessages: Record<string, string>;
  // devices: SensorInfo[];
  // fetchDevices: () => Promise<void>;
  subscribeToGarden: (gardenId: number) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // MQTT state
  const mqttClientRef = useRef<MqttClient | null>(null);
  const mqttConnectionStateRef = useRef<MQTTConnectionState>("disconnected");
  const [mqttMessages, setMqttMessages] = useState<Record<string, string>>({});
  // const [devices, setDevices] = useState<SensorInfo[]>([]);
  const subscribedTopics = useRef<Set<string>>(new Set());
  // Keep track of ping interval
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to all feeds in a garden
  const subscribeToGarden = (gardenId: number) => {
    if (
      !user ||
      !mqttClientRef.current ||
      mqttConnectionStateRef.current !== "connected"
    ) {
      console.warn("Cannot subscribe to garden: Invalid state");
      return;
    }

    const garden = user.gardens.find((g) => g.id === gardenId);
    if (!garden) {
      console.warn(`Garden with ID ${gardenId} not found`);
      return;
    }

    const groupTopic = `${adafruitUsername}/groups/${garden.groupName}`;
    if (!subscribedTopics.current.has(groupTopic)) {
      mqttClientRef.current.subscribe(groupTopic, { qos: 0 });
      subscribedTopics.current.add(groupTopic);
      console.log(`Subscribed to group ${groupTopic}`);
    }
  };

  // Connect to MQTT
  const connectToMQTT = (
    username: string,
    password: string,
    gardens?: User["gardens"]
  ) => {
    if (
      mqttConnectionStateRef.current === "connecting" ||
      mqttConnectionStateRef.current === "connected"
    )
      return;
    mqttConnectionStateRef.current = "connecting";

    const clientId = `garden_app_${Math.random()
      .toString(16)
      .substring(2, 10)}`;

    const options = {
      clientId,
      username,
      password,
      keepalive: 60, // 60 seconds keepalive
      reconnectPeriod: 3000, // Increased reconnect period from 1000ms to 3000ms
      connectTimeout: 30 * 1000,
      clean: true, // Use clean sessions
    };

    // Create client and connect
    const client = connect(mqttBroker, options);

    // Create a ping interval to keep the connection alive
    const pingInterval = setInterval(() => {
      if (
        mqttClientRef.current &&
        mqttConnectionStateRef.current === "connected"
      ) {
        console.log("Sending MQTT ping to keep connection alive");
        // Publish a small message to keep connection active
        try {
          mqttClientRef.current.publish(
            `${username}/ping`,
            JSON.stringify({ timestamp: Date.now() })
          );
        } catch (err) {
          console.error("Failed to send ping:", err);
        }
      }
    }, 45000); // Ping every 45 seconds (less than the 60s keepalive)

    client.on("connect", () => {
      console.log("✅ Connected to MQTT broker");
      mqttConnectionStateRef.current = "connected";

      // Subscribe to gardens if available
      if (gardens) {
        gardens.forEach((garden) => {
          subscribeToGarden(garden.id);
        });
      }
    });

    client.on("reconnect", () => {
      console.log("🔄 Attempting to reconnect to MQTT broker...");
      mqttConnectionStateRef.current = "connecting";
    });

    client.on("message", (topic: string, message: any) => {
      const messageStr = message.toString();
      console.log(`Received on ${topic}: ${messageStr}`);

      const topicParts = topic.split("/");
      if (topicParts.length === 3 && topicParts[1] === "groups") {
        const groupName = topicParts[2];

        try {
          const payload = JSON.parse(messageStr);
          if (payload.feeds) {
            const feedNames = Object.keys(payload.feeds);
            if (feedNames.length > 0) {
              const feedName = feedNames[0]; // lấy feed đầu tiên
              const value = payload.feeds[feedName];

              const feedTopic = `${groupName}.${feedName}`;
              setMqttMessages((prev) => ({
                ...prev,
                [feedTopic]: value,
              }));
            }
          }
        } catch (error) {
          console.error("Failed to parse MQTT message:", error);
        }
      }
    });

    client.on("error", (err: any) => {
      console.error("MQTT error:", err);
      mqttConnectionStateRef.current = "error";
    });

    client.on("offline", () => {
      console.log("⚡ MQTT offline");
      mqttConnectionStateRef.current = "disconnected";
    });

    client.on("close", () => {
      console.log("⚡ MQTT connection closed");
      mqttConnectionStateRef.current = "disconnected";
      clearInterval(pingInterval); // Clear ping interval on close
    });

    // Store the client reference
    mqttClientRef.current = client;

    // Store the pingInterval reference for cleanup during disconnect
    pingIntervalRef.current = pingInterval;

    // Return function to clean up the interval if component unmounts
    return pingIntervalRef.current;
  };

  const disconnectFromMQTT = () => {
    // Clear ping interval if it exists
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (mqttClientRef.current) {
      try {
        // Properly end the MQTT connection
        mqttClientRef.current.end(false, () => {
          console.log("MQTT disconnected successfully");
        });
      } catch (error) {
        console.error("Error during MQTT disconnect:", error);
      } finally {
        mqttClientRef.current = null;
        mqttConnectionStateRef.current = "disconnected";
        setMqttMessages({});
        subscribedTopics.current.clear();
      }
    }
  };

  // Publish message function
  const publish = (groupName: string, feedName: string, message: string) => {
    if (
      mqttClientRef.current &&
      mqttConnectionStateRef.current === "connected"
    ) {
      const topic = `${adafruitUsername}/groups/${groupName}`;
      message = message = JSON.stringify({ feeds: { [feedName]: message } });
      mqttClientRef.current.publish(topic, message);
      console.log(`Published to ${topic}: ${message}`);
    } else {
      console.warn("Cannot publish: MQTT client not connected");
    }
  };

  // Subscribe to topic
  const subscribe = (groupName: string, feedName: string) => {
    if (
      mqttClientRef.current &&
      mqttConnectionStateRef.current === "connected"
    ) {
      const topic = `${adafruitUsername}/groups/${groupName}.${feedName}`;
      if (!subscribedTopics.current.has(topic)) {
        mqttClientRef.current.subscribe(topic, { qos: 0 });
        subscribedTopics.current.add(topic);
        console.log(`Subscribed to ${topic}`);
      }
    } else {
      console.warn("Cannot subscribe: MQTT client not connected");
    }
  };

  // Unsubscribe from topic
  const unsubscribe = (groupName: string, feedName: string) => {
    if (
      mqttClientRef.current &&
      mqttConnectionStateRef.current === "connected"
    ) {
      const topic = `${adafruitUsername}/groups/${groupName}.${feedName}`;
      mqttClientRef.current.unsubscribe(topic);
      subscribedTopics.current.delete(topic);
      console.log(`Unsubscribed from ${topic}`);
    } else {
      console.warn("Cannot unsubscribe: MQTT client not connected");
    }
  };

  // Effect to load user and connect MQTT on startup
  useEffect(() => {
    async function initialize() {
      try {
        const userData = await getItem<User>(USER);
        if (userData) {
          setUser(userData);
          // await fetchDevices();
          connectToMQTT(adafruitUsername, adafruitKey, userData.gardens);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();

    return () => {
      disconnectFromMQTT();
    };
  }, []);

  useEffect(() => {
    if (user) {
      disconnectFromMQTT(); // Ngắt MQTT hiện tại (nếu có)
      connectToMQTT(adafruitUsername, adafruitKey, user.gardens);
    }
  }, [user]);

  // User Authentication Functions
  const signIn = async (credentials: AuthCredentials): Promise<void> => {
    await authService.login(credentials.email, credentials.password);
    const userData = await getItem<User>(USER);
    if (userData) {
      setUser(userData);
      // await fetchDevices();
      //connectToMQTT(adafruitUsername, adafruitKey, userData.gardens);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      disconnectFromMQTT();
      await authService.logout();
      setUser(null);
      // setDevices([]);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  // Context Value
  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    mqttClientRef,
    mqttConnectionStateRef,
    publish,
    subscribe,
    unsubscribe,
    mqttMessages,
    // devices,
    // fetchDevices,
    subscribeToGarden,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

export function useGlobal(): GlobalContextType {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
}

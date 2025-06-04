import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { GardenType, CropStage } from "@/constants/database";
import gardenService from "@/service/garden.service";
import locationService, {
  Province,
  District,
  Ward,
} from "@/service/location.service";
import type { GardenRequest } from "@/types";

export default function CreateGardenScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [gardenName, setGardenName] = useState("");
  const [description, setDescription] = useState("");
  const [street, setStreet] = useState("");
  const [cropName, setCropName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [gardenType, setGardenType] = useState<GardenType | null>(null);
  const [cropStage, setCropStage] = useState<CropStage | null>(null);

  // Location state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Modal states
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch provinces
  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const data = await locationService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách tỉnh/thành phố");
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Fetch districts when a province is selected
  const fetchDistricts = async (provinceCode: string) => {
    setLoadingDistricts(true);
    try {
      const data = await locationService.getDistricts(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách quận/huyện");
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch wards when a district is selected
  const fetchWards = async (districtCode: string) => {
    setLoadingWards(true);
    try {
      const data = await locationService.getWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error("Error fetching wards:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách phường/xã");
    } finally {
      setLoadingWards(false);
    }
  };

  // Handle province selection
  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setShowProvinceModal(false);
    fetchDistricts(province.code);
  };

  // Handle district selection
  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district);
    setSelectedWard(null);
    setShowDistrictModal(false);
    fetchWards(district.code);
  };

  // Handle ward selection
  const handleWardSelect = (ward: Ward) => {
    setSelectedWard(ward);
    setShowWardModal(false);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!gardenName || !cropName || !gardenType) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập tên vườn, loại cây trồng và chọn loại vườn."
      );
      return;
    }

    const newGarden: GardenRequest = {
      name: gardenName,
      description,
      location: street,
      ward: selectedWard?.name || "",
      district: selectedDistrict?.name || "",
      city: selectedProvince?.name || "",
      cropName,
      groupName,
      gardenType: gardenType,
      cropStage: cropStage || CropStage.Seed, // Default to Seed if not provided
    };

    console.log("New Garden Data:", newGarden);
    try {
      await gardenService.createGarden(newGarden);
      // reset form fields
      setGardenName("");
      setDescription("");
      setStreet("");
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setCropName("");
      setGroupName("");
      setGardenType(null);
      setCropStage(null);
      // Show success alert
      Alert.alert("Thành công", "Đã tạo vườn mới.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error creating garden:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo vườn mới.");
    }
  };

  // Helper function to render modal selection
  const renderSelectionModal = <T extends Province | District | Ward>(
    visible: boolean,
    title: string,
    data: T[],
    onSelect: (item: T) => void,
    onClose: () => void,
    isLoading: boolean,
    getDisplayText: (item: T) => string
  ) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text
                style={[styles.loadingText, { color: theme.textSecondary }]}
              >
                Đang tải dữ liệu...
              </Text>
            </View>
          ) : data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Không có dữ liệu
              </Text>
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => item.code.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => onSelect(item)}
                >
                  <Text style={[styles.modalItemText, { color: theme.text }]}>
                    {getDisplayText(item)}
                  </Text>
                </TouchableOpacity>
              )}
              initialNumToRender={20}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Tạo Vườn Mới" }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Thông tin vườn</Text>

        {/* Garden Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên vườn *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Vườn rau sân thượng"
            value={gardenName}
            onChangeText={setGardenName}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả ngắn về khu vườn của bạn"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Location Section Header */}
        <Text style={styles.sectionTitle}>Thông tin địa điểm</Text>

        {/* Street Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Số 123 Đường Lê Lợi"
            value={street}
            onChangeText={setStreet}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Province Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tỉnh/Thành phố</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowProvinceModal(true)}
          >
            <Text
              style={[
                styles.selectorButtonText,
                !selectedProvince && styles.placeholderText,
              ]}
            >
              {selectedProvince?.name || "Chọn tỉnh/thành phố"}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* District Selector - Only enabled if province is selected */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quận/Huyện</Text>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              !selectedProvince && styles.disabledSelector,
            ]}
            onPress={() => selectedProvince && setShowDistrictModal(true)}
            disabled={!selectedProvince}
          >
            <Text
              style={[
                styles.selectorButtonText,
                (!selectedDistrict || !selectedProvince) &&
                  styles.placeholderText,
              ]}
            >
              {selectedDistrict?.name || "Chọn quận/huyện"}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={24}
              color={selectedProvince ? theme.textSecondary : theme.borderLight}
            />
          </TouchableOpacity>
        </View>

        {/* Ward Selector - Only enabled if district is selected */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phường/Xã</Text>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              !selectedDistrict && styles.disabledSelector,
            ]}
            onPress={() => selectedDistrict && setShowWardModal(true)}
            disabled={!selectedDistrict}
          >
            <Text
              style={[
                styles.selectorButtonText,
                (!selectedWard || !selectedDistrict) && styles.placeholderText,
              ]}
            >
              {selectedWard?.name || "Chọn phường/xã"}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={24}
              color={selectedDistrict ? theme.textSecondary : theme.borderLight}
            />
          </TouchableOpacity>
        </View>

        {/* Group Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên Group Adafruit</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: garden1"
            value={groupName}
            onChangeText={setGroupName}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Plant Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loại cây trồng chính *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Cà chua, Húng quế"
            value={cropName}
            onChangeText={setCropName}
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        {/* Crop Stage Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Giai đoạn phát triển</Text>
          <View style={styles.typeSelectorContainer}>
            {Object.values(CropStage).map((stage) => (
              <TouchableOpacity
                key={stage}
                style={[
                  styles.typeButton,
                  cropStage === stage && styles.typeButtonSelected,
                ]}
                onPress={() => setCropStage(stage)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    cropStage === stage && styles.typeButtonTextSelected,
                  ]}
                >
                  {/* Convert enum to readable Vietnamese text */}
                  {stage === CropStage.Seed && "Hạt giống"}
                  {stage === CropStage.Germination && "Nảy mầm"}
                  {stage === CropStage.Vegetative && "Sinh trưởng"}
                  {stage === CropStage.Budding && "Ra nụ"}
                  {stage === CropStage.Flowering && "Ra hoa"}
                  {stage === CropStage.Fruiting && "Ra quả"}
                  {stage === CropStage.Maturity && "Trưởng thành"}
                  {stage === CropStage.Harvest && "Thu hoạch"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Garden Type Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loại hình vườn *</Text>
          <View style={styles.typeSelectorContainer}>
            {Object.values(GardenType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  gardenType === type && styles.typeButtonSelected,
                ]}
                onPress={() => setGardenType(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    gardenType === type && styles.typeButtonTextSelected,
                  ]}
                >
                  {/* Convert enum to readable text */}
                  {type === GardenType.INDOOR && "Trong nhà"}
                  {type === GardenType.OUTDOOR && "Ngoài trời"}
                  {type === GardenType.BALCONY && "Ban công"}
                  {type === GardenType.ROOFTOP && "Sân thượng"}
                  {type === GardenType.WINDOW_SILL && "Bậu cửa sổ"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="leaf-outline" size={20} color={theme.card} />
          <Text style={styles.submitButtonText}>Tạo vườn</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Selection Modals */}
      {renderSelectionModal<Province>(
        showProvinceModal,
        "Chọn tỉnh/thành phố",
        provinces,
        handleProvinceSelect,
        () => setShowProvinceModal(false),
        loadingProvinces,
        (province) => province.name
      )}

      {renderSelectionModal<District>(
        showDistrictModal,
        "Chọn quận/huyện",
        districts,
        handleDistrictSelect,
        () => setShowDistrictModal(false),
        loadingDistricts,
        (district) => district.name
      )}

      {renderSelectionModal<Ward>(
        showWardModal,
        "Chọn phường/xã",
        wards,
        handleWardSelect,
        () => setShowWardModal(false),
        loadingWards,
        (ward) => ward.name
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
    scrollContent: {
      padding: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 16,
      marginTop: 8,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top", // Align text to top for multiline
    },
    typeSelectorContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    typeButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    typeButtonSelected: {
      backgroundColor: theme.primaryLight,
      borderColor: theme.primary,
    },
    typeButtonText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
    },
    typeButtonTextSelected: {
      color: theme.primary,
    },
    submitButton: {
      backgroundColor: theme.primary,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 24,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    submitButtonText: {
      color: theme.card, // White text on primary button
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
    },
    // Styles for location selectors
    selectorButton: {
      backgroundColor: theme.card,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    disabledSelector: {
      backgroundColor: theme.backgroundAlt,
      borderColor: theme.borderLight,
    },
    selectorButtonText: {
      fontSize: 16,
      color: theme.text,
    },
    placeholderText: {
      color: theme.textTertiary,
    },
    // Modal styles
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: "70%",
      paddingBottom: 16,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
    },
    modalItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    modalItemText: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
    },
    // Loading and empty state styles
    loadingContainer: {
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
    },
    emptyContainer: {
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 16,
    },
  });

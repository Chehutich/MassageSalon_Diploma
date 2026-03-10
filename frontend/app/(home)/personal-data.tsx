import { useGetMe, useUpdateProfile } from "@/src/api/generated/user/user";
import { AmbientBackground } from "@/src/components/AmbientBackground";
import { AvatarBadge } from "@/src/components/home/AvatarBadge";
import { ImagePickerModal } from "@/src/components/modals/ImagePickerModal";
import { useSheets } from "@/src/context/SheetContext";
import { Palette } from "@/src/theme/tokens";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Lock,
  Mail,
  Pencil,
  Phone,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PersonalDataScreen() {
  const router = useRouter();
  const { data: me } = useGetMe();
  const { openEditField } = useSheets();
  const [initials, setInitials] = useState("??");
  const [isPickerVisible, setPickerVisible] = useState(false);
  const { mutate: updateProfile } = useUpdateProfile();

  useEffect(() => {
    if (me?.firstName && me?.lastName) {
      setInitials(`${me.firstName[0]}${me.lastName[0]}`.toUpperCase());
    } else if (me?.firstName) {
      setInitials(me.firstName[0].toUpperCase());
    }
  }, [me]);

  const handleImagePicked = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      console.log("Image ready for upload:", uri);
      // Тут викликай updateProfile з FormData
    }
  };
  const pickImage = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Скасувати", "Зробити фото", "Обрати з галереї"],
          cancelButtonIndex: 0,
          title: "Змінити фото профілю",
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) takePhoto();
          else if (buttonIndex === 2) chooseFromLibrary();
        },
      );
    } else {
      Alert.alert("Змінити фото", "Оберіть джерело зображення", [
        { text: "Галерея", onPress: chooseFromLibrary },
        { text: "Камера", onPress: takePhoto },
        { text: "Скасувати", style: "cancel" },
      ]);
    }
  };

  const chooseFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Вибачте, нам потрібен доступ до ваших фото!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    handleImagePicked(result);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Вибачте, нам потрібен доступ до камери!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    handleImagePicked(result);
  };

  const dataFields = [
    {
      id: "firstName",
      label: "Ім'я",
      value: me?.firstName,
      icon: <User size={20} color={Palette.taupe} />,
    },
    {
      id: "lastName",
      label: "Прізвище",
      value: me?.lastName,
      icon: <User size={20} color={Palette.taupe} />,
    },
    {
      id: "phone",
      label: "Телефон",
      value: me?.phone,
      icon: <Phone size={20} color={Palette.taupe} />,
    },
    {
      id: "email",
      label: "Email",
      value: me?.email,
      icon: <Mail size={20} color={Palette.taupe} />,
    },
    {
      id: "password",
      label: "Пароль",
      value: "••••••••",
      icon: <Lock size={20} color={Palette.taupe} />,
    },
  ];

  const handleEdit = (fieldId: any) => {
    openEditField(fieldId);
  };

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.replace("/(home)/profile")}
            style={styles.backBtn}
          >
            <ChevronLeft color={Palette.espresso} />
          </Pressable>
          <Text style={styles.headerTitle}>Особисті дані</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                <AvatarBadge
                  initials={initials}
                  photoUrl={me?.photoUrl}
                  size={100}
                  bg={Palette.rose + "15"}
                />
              </View>

              <Pressable
                style={styles.editBadge}
                onPress={() => setPickerVisible(true)}
              >
                <Pencil size={16} color="#fff" strokeWidth={2.5} />
              </Pressable>
            </View>
            <Text style={styles.avatarNote}>Фото профілю</Text>
          </View>

          <View style={styles.card}>
            {dataFields.map((field, index) => (
              <View key={field.id}>
                <Pressable
                  style={styles.fieldRow}
                  onPress={() => handleEdit(field.id)}
                >
                  <View style={styles.fieldLeft}>
                    <View style={styles.iconBox}>{field.icon}</View>
                    <View>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      <Text style={styles.fieldValue}>{field.value}</Text>
                    </View>
                  </View>
                  <View style={styles.editBtn}>
                    <Text style={styles.editText}>Змінити</Text>
                  </View>
                </Pressable>
                {index < dataFields.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      <ImagePickerModal
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectCamera={takePhoto}
        onSelectLibrary={chooseFromLibrary}
        hasImage={!!me?.photoUrl}
        onRemove={() => {
          console.log("Remove photo");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.ivory },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
  },
  scroll: { padding: 20, paddingBottom: 40 },

  // Стилі для нового блоку аватара
  avatarSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarWrapper: {
    padding: 5,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: Palette.sand,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 5,
    backgroundColor: Palette.taupe,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Palette.ivory,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  avatarNote: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    marginTop: 12,
    opacity: 0.8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Palette.sand,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  fieldLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Palette.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.6,
  },
  fieldValue: {
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    marginTop: 2,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Palette.sand,
  },
  editText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
  },
  divider: { height: 1, backgroundColor: Palette.sand, marginHorizontal: 16 },
});

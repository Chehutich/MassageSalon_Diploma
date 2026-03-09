import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Edit3,
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { AmbientBackground } from "@/src/components/AmbientBackground";
import { useGetMe } from "@/src/api/generated/user/user";
import { useSheets } from "@/src/context/SheetContext";
import { EditUserFieldSheet } from "@/src/components/profile/EditUserFieldSheet";

export default function PersonalDataScreen() {
  const router = useRouter();
  const { data: me } = useGetMe();
  const { openEditField } = useSheets();

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
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color={Palette.espresso} />
          </Pressable>
          <Text style={styles.headerTitle}>Особисті дані</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
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
  scroll: { padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Palette.sand,
    overflow: "hidden",
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

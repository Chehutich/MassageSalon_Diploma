import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Palette } from "@/src/theme/tokens";
import { AmbientBackground } from "@/src/components/ui/layout/AmbientBackground";
import { useGetMe, useLogout } from "@/src/api/generated/user/user";
import { AvatarBadge } from "@/src/components/home/AvatarBadge";
import { ProfileHeader } from "@/src/components/profile/ProfileHeader";
import {
  User,
  LogOut,
  ChevronRight,
  Bell,
  ShieldCheck,
  MessageCircle,
  Info,
  Pencil,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";

import { LogoutConfirmModal } from "@/src/components/modals/LogoutConfirmModal";
import { setLoggingOut } from "@/src/api/client";
import { signalRService } from "@/src/services/SignalRService";

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useGetMe();
  const { mutateAsync: logoutOnServer } = useLogout();

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      setLoggingOut(true);

      await signalRService.stop();

      queryClient.cancelQueries();
      await logoutOnServer();
    } catch (error) {
      console.warn(
        "Помилка логаута на сервері (ігноруємо і чистимо локально):",
        error,
      );
    } finally {
      setLogoutModalVisible(false);

      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");

      router.replace("/(auth)/login");
      queryClient.clear();
    }
  };

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* ── Header ── */}
          <ProfileHeader
            firstName={me?.firstName}
            lastName={me?.lastName}
            email={me?.email}
            photoUrl={me?.photoUrl}
            onEditPress={() => router.push("/personal-data")}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Акаунт</Text>
            <View style={styles.menuContainer}>
              <MenuButton
                icon={<User size={20} color={Palette.taupe} />}
                label="Особисті дані"
                onPress={() => router.push("/personal-data")}
              />
              <MenuButton
                icon={<Bell size={20} color={Palette.taupe} />}
                label="Сповіщення"
              />
              <MenuButton
                icon={<ShieldCheck size={20} color={Palette.taupe} />}
                label="Конфіденційність"
                isLast
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Додаток</Text>
            <View style={styles.menuContainer}>
              <MenuButton
                icon={<MessageCircle size={20} color={Palette.taupe} />}
                label="Зв'язатися з нами"
              />
              <MenuButton
                icon={<Info size={20} color={Palette.taupe} />}
                label="Про додаток"
                isLast
              />
            </View>
          </View>

          <Pressable style={styles.logoutBtn} onPress={handleLogoutPress}>
            <LogOut size={20} color={Palette.rose} />
            <Text style={styles.logoutText}>Вийти з акаунту</Text>
          </Pressable>

          <Text style={styles.version}>Версія 1.0.0 (Serenity App)</Text>
        </ScrollView>
      </SafeAreaView>

      <LogoutConfirmModal
        visible={isLogoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
      />
    </View>
  );
}

function MenuButton({
  icon,
  label,
  onPress,
  isLast,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      style={[styles.menuItem, !isLast && styles.border]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color={Palette.sandDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.ivory },
  scroll: { paddingBottom: 10 },
  header: { alignItems: "center", marginTop: 24, marginBottom: 32 },
  avatarContainer: {
    position: "relative",
  },
  avatarWrapper: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 2,
    backgroundColor: Palette.taupe,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Palette.ivory,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 26,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
    marginTop: 16,
  },
  email: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.6,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
    opacity: 0.6,
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.sand,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.sand,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Palette.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 48,
    paddingVertical: 12,
  },
  logoutText: {
    color: Palette.rose,
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
  },
  version: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.4,
    marginTop: 24,
  },
});

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Palette } from "@/src/theme/tokens";
import { AvatarBadge } from "@/src/components/home/AvatarBadge";
import { Pencil } from "lucide-react-native";

type Props = {
  firstName?: string;
  lastName?: string;
  email?: string;
  photoUrl?: string | null;
  onEditPress?: () => void;
  size?: "small" | "large";
};

export function ProfileHeader({
  firstName,
  lastName,
  email,
  photoUrl,
  onEditPress,
  size = "large",
}: Props) {
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : firstName
        ? firstName[0].toUpperCase()
        : "??";

  const isLarge = size === "large";

  return (
    <View style={[styles.header, !isLarge && styles.headerSmall]}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <AvatarBadge
            initials={initials}
            photoUrl={photoUrl}
            size={isLarge ? 90 : 100}
            bg={Palette.rose + "15"}
          />
        </View>
        {onEditPress && (
          <Pressable style={styles.editBadge} onPress={onEditPress}>
            <Pencil size={isLarge ? 14 : 16} color="#fff" strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      <View style={isLarge ? styles.textCenter : styles.textLeft}>
        <Text style={[styles.name, !isLarge && styles.nameSmall]}>
          {firstName} {lastName}
        </Text>
        {email && <Text style={styles.email}>{email}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: 24, marginBottom: 32 },
  headerSmall: { marginTop: 10, marginBottom: 30 },
  avatarContainer: { position: "relative" },
  avatarWrapper: {
    padding: 4,
    borderRadius: 60,
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
    elevation: 3,
  },
  textCenter: { alignItems: "center" },
  textLeft: { alignItems: "center", marginTop: 12 },
  name: {
    fontSize: 26,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
    marginTop: 16,
  },
  nameSmall: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    marginTop: 12,
    opacity: 0.8,
  },
  email: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.6,
    marginTop: 4,
  },
});

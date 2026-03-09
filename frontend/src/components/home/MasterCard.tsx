import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useState } from "react";
import { MasterSheet } from "@/src/components/home/MasterSheet";
import { Palette } from "@/src/theme/tokens";
import type { MasterResponse } from "@/src/api/generated/apiV1.schemas";
import { MasterAvatar } from "@/src/components/MasterAvatar";

type Props = {
  master: MasterResponse;
  onPress?: (id: string) => void;
};

export function MasterCard({ master, onPress }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const color = stringToColor(master.id);
  console.log("photoUrl:", master.photoUrl);

  return (
    <>
      <Pressable style={styles.card} onPress={() => onPress?.(master.id)}>
        {/* Photo */}
        <MasterAvatar
          firstName={master.firstName}
          lastName={master.lastName}
          photoUrl={master.photoUrl}
          size={56}
          accent={color}
        />

        {/* Name */}
        <Text style={styles.name} numberOfLines={1}>
          {master.firstName}
        </Text>
        <Text style={styles.lastName} numberOfLines={1}>
          {master.lastName}
        </Text>

        {/* Specialty */}
        {master.serviceCategories?.length > 0 && (
          <Text style={styles.specialty} numberOfLines={1}>
            {master.serviceCategories[0].slug}
          </Text>
        )}
      </Pressable>
    </>
  );
}

function stringToColor(str: string): string {
  const colors = [
    Palette.rose,
    Palette.sage,
    "#B8A9C9",
    "#C4A882",
    Palette.taupe,
  ];
  const index = str.charCodeAt(0) % colors.length;
  return colors[index];
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Palette.sand,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 4,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  initials: {
    fontSize: 18,
    fontFamily: "CormorantGaramond_600SemiBold",
  },
  name: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    textAlign: "center",
  },
  lastName: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    textAlign: "center",
  },
  specialty: {
    fontSize: 10,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    textAlign: "center",
    opacity: 0.7,
    marginTop: 2,
  },
});

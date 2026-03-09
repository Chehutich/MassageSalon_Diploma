import { View, StyleSheet } from "react-native";
import { Palette } from "@/src/theme/tokens";
import { AppointmentCard } from "./AppointmentCard";
import type { MyAppointmentResponse } from "@/src/api/generated/apiV1.schemas";

type Props = {
  title: string;
  accent: string;
  items: MyAppointmentResponse[];
  onBookAgain?: (serviceId: string, masterId: string | null) => void;
  onCancelPress?: (item: MyAppointmentResponse) => void;
};

export function AppointmentSection({
  title,
  accent,
  items,
  onBookAgain,
  onCancelPress,
}: Props) {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={{ gap: 10 }}>
        {items.map((a) => (
          <AppointmentCard
            key={a.id}
            item={a}
            onBookAgain={onBookAgain}
            onCancelPress={onCancelPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 24, marginBottom: 28 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: {
    fontSize: 14,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
});

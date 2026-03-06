import { View, Text, StyleSheet } from "react-native";
import { Palette } from "@/src/theme/tokens";

type Props = { initials: string; size?: number; bg?: string };

export function AvatarBadge({ initials, size = 36, bg = Palette.sand }: Props) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.32 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Palette.sandDark,
  },
  text: {
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    letterSpacing: 0.3,
  },
});

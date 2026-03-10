import { View, Text, Image, StyleSheet } from "react-native";
import { User } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";

type Props = {
  firstName?: string;
  lastName?: string;
  photoUrl?: string | null;
  size?: number;
  accent?: string;
};

export function MasterAvatar({
  firstName,
  lastName,
  photoUrl,
  size = 48,
  accent = Palette.taupe,
}: Props) {
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : null;

  const borderRadius = size / 2;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: accent + "22",
        },
      ]}
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: size, height: size, borderRadius }}
          resizeMode="cover"
        />
      ) : initials ? (
        <Text
          style={[styles.initials, { color: accent, fontSize: size * 0.31 }]}
        >
          {initials}
        </Text>
      ) : (
        <User size={size * 0.45} strokeWidth={1.5} color={accent} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: { fontFamily: "DMSans_500Medium" },
});

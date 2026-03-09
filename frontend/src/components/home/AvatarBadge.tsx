import { View, Text, StyleSheet, Image } from "react-native";
import { Palette } from "@/src/theme/tokens";
import { useState } from "react";

type Props = {
  initials: string;
  photoUrl?: string | null;
  size?: number;
  bg?: string;
};

export function AvatarBadge({
  initials,
  photoUrl,
  size = 36,
  bg = Palette.sand,
}: Props) {
  const [hasError, setHasError] = useState(false);

  const showImage = !!photoUrl && !hasError;

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
      {!showImage ? (
        <Text style={[styles.text, { fontSize: size * 0.32 }]}>{initials}</Text>
      ) : (
        <Image
          source={{ uri: photoUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          onError={() => setHasError(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Palette.sandDark,
    overflow: "hidden",
  },
  text: {
    fontFamily: "DMSans_500Medium",
    color: Palette.taupe,
    letterSpacing: 0.3,
  },
});

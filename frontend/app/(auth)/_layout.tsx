import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { AmbientBackground } from "../../src/components/AmbientBackground";
import { Palette } from "../../src/theme/tokens";

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <AmbientBackground />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      ></Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.ivory,
  },
});

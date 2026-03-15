import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { AmbientBackground } from "@/src/components/ui/layout/AmbientBackground";
import { Palette } from "@/src/theme/tokens";

import { ToastProvider } from "@/src/context/ToastContext";

export default function AuthLayout() {
  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.ivory,
  },
});

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import { FontAwesome } from "@expo/vector-icons";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { LoadingScreen } from "../src/components/LoadingScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Palette } from "../src/theme/tokens";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
    mutations: { retry: 0 },
  },
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    ...FontAwesome.font,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      setReady(true);
    }
  }, [loaded, error]);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
              contentStyle: { backgroundColor: Palette.ivory },
              animation: "fade_from_bottom",
            }}
          >
            <Stack.Screen name="(auth)/forgot" />
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/register" />
            <Stack.Screen name="(home)/index" />
          </Stack>
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

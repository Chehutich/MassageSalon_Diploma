import { LoadingScreen } from "@/src/components/ui/feedback/LoadingScreen";
import { Palette } from "@/src/theme/tokens";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from "@expo-google-fonts/cormorant-garamond";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  useFonts,
} from "@expo-google-fonts/dm-sans";
import { FontAwesome } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthGuard } from "@/src/components/auth/AuthGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
    mutations: { retry: 0 },
  },
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <AuthGuard>
            <Stack
              screenOptions={{
                headerShown: false,
                gestureEnabled: false,
                contentStyle: { backgroundColor: Palette.ivory },
                animation: "fade_from_bottom",
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(home)" />
            </Stack>
          </AuthGuard>
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

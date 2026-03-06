// app/(home)/_layout.tsx
import { Tabs, Redirect } from "expo-router";
import { Home, Calendar, User } from "lucide-react-native";
import { ActivityIndicator, View, Platform } from "react-native";
import { Palette } from "@/src/theme/tokens";
import { useGetMe } from "@/src/api/generated/auth/auth";

export default function HomeLayout() {
  const { data: me, isLoading, isError } = useGetMe();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Palette.ivory,
        }}
      >
        <ActivityIndicator color={Palette.taupe} />
      </View>
    );
  }

  if (isError || !me) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(245,239,230,0.95)",
          borderTopColor: Palette.sand,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Palette.taupe,
        tabBarInactiveTintColor: Palette.taupe + "66",
        tabBarLabelStyle: {
          fontFamily: "DMSans_400Regular",
          fontSize: 10.5,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Головна",
          tabBarIcon: ({ color, focused }) => (
            <Home size={20} strokeWidth={focused ? 2 : 1.6} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Записи",
          tabBarIcon: ({ color, focused }) => (
            <Calendar size={20} strokeWidth={focused ? 2 : 1.6} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User size={20} strokeWidth={focused ? 2 : 1.6} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

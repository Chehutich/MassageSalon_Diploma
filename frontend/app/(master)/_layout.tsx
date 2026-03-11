import { useGetMe } from "@/src/api/generated/user/user";
import { SheetProvider } from "@/src/context/SheetContext";
import { ToastProvider } from "@/src/context/ToastContext";
import { Palette } from "@/src/theme/tokens";
import { Redirect, Tabs } from "expo-router";
import { Calendar, LayoutDashboard, User, Bell } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MasterLayout() {
  const { data: me, isLoading, isError } = useGetMe();
  const insets = useSafeAreaInsets();

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

  if (isError || !me || me.role !== "Master") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ToastProvider>
      <SheetProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "rgba(245,239,230,0.95)",
              borderTopColor: Palette.sand,
              borderTopWidth: 1,
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom,
              paddingTop: 8,
            },
            tabBarActiveTintColor: Palette.taupe,
            tabBarInactiveTintColor: Palette.taupe + "66",
            tabBarLabelStyle: {
              fontFamily: "DMSans_400Regular",
              fontSize: 10.5,
            },
          }}
        >
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Дашборд",
              tabBarIcon: ({ color, focused }) => (
                <LayoutDashboard
                  size={20}
                  strokeWidth={focused ? 2 : 1.6}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="schedule"
            options={{
              title: "Розклад",
              tabBarIcon: ({ color, focused }) => (
                <Calendar
                  size={20}
                  strokeWidth={focused ? 2 : 1.6}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Профіль",
              tabBarIcon: ({ color, focused }) => (
                <User size={20} strokeWidth={focused ? 2 : 1.6} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="personal-data"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </SheetProvider>
    </ToastProvider>
  );
}

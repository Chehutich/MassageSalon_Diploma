import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import { CheckCircle, AlertCircle } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastConfig = {
  visible: boolean;
  type: "success" | "error";
  title: string;
  message: string;
};

type Props = ToastConfig & {
  onHide: () => void;
};

export function TopToast({ visible, type, title, message, onHide }: Props) {
  const translateY = useRef(new Animated.Value(-150)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: insets.top > 0 ? insets.top + 10 : 40,
        useNativeDriver: true,
        speed: 12,
        bounciness: 6,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle : AlertCircle;
  const color = isSuccess ? Palette.sage : Palette.rose;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
        !visible && { opacity: 0 },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
          <Icon size={22} color={color} strokeWidth={1.8} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.ivory,
    padding: 16,
    borderRadius: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: Palette.sand,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
});

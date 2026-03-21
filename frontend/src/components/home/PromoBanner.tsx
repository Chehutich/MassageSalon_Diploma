import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";

export function PromoBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <Text style={styles.tag}>ВЕСНЯНА ПРОПОЗИЦІЯ</Text>

      <Text style={styles.title}>{"-20% на перший сеанс\nстоун-терапії"}</Text>

      <Pressable style={styles.btn}>
        <Text style={styles.btnText}>Забронювати</Text>
        <ChevronRight size={14} strokeWidth={2} color={Palette.espresso} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 20,
    backgroundColor: Palette.taupe,
    padding: 20,
    overflow: "hidden",
    shadowColor: Palette.taupe,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  circle1: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -20,
    right: -20,
  },
  circle2: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -30,
    right: 20,
  },
  tag: {
    fontSize: 10,
    fontFamily: "DMSans_500Medium",
    color: Palette.rose,
    opacity: 0.8,
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.ivory,
    lineHeight: 26,
    marginBottom: 16,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: Palette.rose,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnText: {
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
    color: Palette.espresso,
  },
});

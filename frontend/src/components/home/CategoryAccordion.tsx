import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
} from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { ServiceCard } from "./ServiceCard";
import { PLURAL, pluralize } from "@/src/utils/pluralize";

export function CategoryAccordion({
  cat,
  defaultOpen = false,
  likedIds,
  onToggleLike,
}: any) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = cat.icon;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v: boolean) => !v);
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: open ? cat.color + "44" : Palette.sand,
        },
      ]}
    >
      <Pressable
        onPress={toggle}
        style={[
          styles.header,
          {
            backgroundColor: open ? cat.color + "08" : "transparent",
          },
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: cat.color + "1A" }]}>
          <Icon size={20} strokeWidth={1.5} color={cat.color} />
        </View>
        <View style={styles.labelBox}>
          <Text style={styles.label}>{cat.label}</Text>
          <Text style={styles.sub}>
            {pluralize(cat.count, PLURAL.service)} доступно
          </Text>
        </View>
        <View
          style={[
            styles.chevronBox,
            {
              backgroundColor: open ? cat.color : Palette.sand,
            },
          ]}
        >
          {open ? (
            <ChevronUp size={14} strokeWidth={2} color="#fff" />
          ) : (
            <ChevronDown size={14} strokeWidth={2} color={Palette.taupe} />
          )}
        </View>
      </Pressable>

      {open && (
        <View style={styles.items}>
          {cat.items.map((item: any, i: number) => (
            <ServiceCard
              key={i}
              item={item}
              accent={cat.color}
              Icon={Icon}
              liked={likedIds?.has(item.id)}
              onToggleLike={() => onToggleLike?.(item.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  labelBox: { flex: 1 },
  label: {
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  sub: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    marginTop: 2,
    opacity: 0.75,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  items: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
});

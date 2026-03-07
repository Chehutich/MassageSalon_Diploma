import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { AmbientBackground } from "@/src/components/AmbientBackground";
import { ServiceCard } from "@/src/components/home/ServiceCard";
import { useGetServices } from "@/src/api/generated/services/services";
import { useGetCategories } from "@/src/api/generated/categories/categories";
import type {
  ServiceResponse,
  CategoryResponse,
} from "@/src/api/generated/apiV1.schemas";
import { categoryColor, categoryIcon } from "@/src/utils/categoryHelpers";
import { useLikes } from "@/src/context/LikesContext";
import { PLURAL, pluralize } from "@/src/utils/pluralize";

export default function FavoritesScreen() {
  const { likedIds, toggleLike } = useLikes();
  const { data: services, isLoading } = useGetServices();
  const { data: categories } = useGetCategories();

  const grouped = useMemo(() => {
    if (!categories || !services) return [];
    return categories.map((cat: CategoryResponse) => ({
      id: cat.id,
      label: cat.slug,
      color: categoryColor(cat.slug),
      icon: categoryIcon(cat.slug),
      items: services.filter(
        (s: ServiceResponse) => s.categorySlug === cat.slug,
      ),
    }));
  }, [categories, services]);

  const liked = useMemo(
    () => services?.filter((s: ServiceResponse) => likedIds.has(s.id)) ?? [],
    [services, likedIds],
  );

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Улюблені</Text>
          <Text style={styles.subtitle}>
            {pluralize(liked?.length ?? 0, PLURAL.service)} збережено
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {isLoading ? (
            <ActivityIndicator
              color={Palette.taupe}
              style={{ marginTop: 60 }}
            />
          ) : liked.length === 0 ? (
            <View style={styles.empty}>
              <Heart size={40} strokeWidth={1.2} color={Palette.taupe + "66"} />
              <Text style={styles.emptyText}>Ще немає збережених послуг</Text>
              <Text style={styles.emptyHint}>
                Натисніть ♡ на будь-якій послузі щоб зберегти
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {liked.map((item: ServiceResponse) => {
                const cat = grouped.find((c) =>
                  c.items.some((i: ServiceResponse) => i.id === item.id),
                );
                return (
                  <ServiceCard
                    key={item.id}
                    item={item}
                    accent={cat?.color ?? Palette.taupe}
                    Icon={cat?.icon}
                    liked={likedIds.has(item.id)}
                    onToggleLike={() => toggleLike(item.id)}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.ivory },
  header: { paddingHorizontal: 24, paddingTop: 16, marginBottom: 16 },
  title: {
    fontSize: 26,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    marginTop: 4,
    opacity: 0.75,
  },
  scroll: { paddingHorizontal: 24, paddingBottom: 32 },
  list: { gap: 12 },
  empty: { alignItems: "center", marginTop: 80, gap: 14 },
  emptyText: {
    fontSize: 16,
    fontFamily: "CormorantGaramond_400Regular",
    fontStyle: "italic",
    color: Palette.taupe,
    opacity: 0.6,
  },
  emptyHint: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.5,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

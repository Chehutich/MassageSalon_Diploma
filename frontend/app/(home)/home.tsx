import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Bell } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";
import { AmbientBackground } from "@/src/components/AmbientBackground";
import { AvatarBadge } from "@/src/components/home/AvatarBadge";
import { PromoBanner } from "@/src/components/home/PromoBanner";
import { CategoryAccordion } from "@/src/components/home/CategoryAccordion";
import { LeafLogo } from "@/src/components/LeafLogo";
import { useGetMe } from "@/src/api/generated/auth/auth";
import * as categoryHelpers from "@/src/utils/categoryHelpers";
import { useGetCategories } from "@/src/api/generated/categories/categories";
import { useGetServices } from "@/src/api/generated/services/services";
import type {
  CategoryResponse,
  ServiceResponse,
  MasterResponse,
} from "@/src/api/generated/apiV1.schemas";
import { MasterCard } from "@/src/components/home/MasterCard";
import { useGetMasters } from "@/src/api/generated/masters/masters";
import { PLURAL, pluralize } from "@/src/utils/pluralize";
import { useLikes } from "@/src/context/LikesContext";
import { useSheets } from "@/src/context/SheetContext";

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeChip, setActiveChip] = useState<string>("All");

  const { openBooking, openService, openMaster } = useSheets();
  const { likedIds, toggleLike } = useLikes();
  const { data: me } = useGetMe();
  const { data: categories, isLoading: catsLoading } = useGetCategories();
  const { data: services, isLoading: srvLoading } = useGetServices();
  const { data: masters } = useGetMasters({});

  const isLoading = catsLoading || srvLoading;

  const grouped = useMemo(() => {
    if (!categories || !services) return [];
    return categories
      .map((cat: CategoryResponse) => ({
        id: cat.id,
        label: categoryHelpers.categoryLabel(cat.slug),
        slug: cat.slug,
        color: categoryHelpers.categoryColor(cat.slug),
        icon: categoryHelpers.categoryIcon(cat.slug),
        items: services.filter(
          (s: ServiceResponse) => s.categorySlug === cat.slug,
        ),
        count: services.filter(
          (s: ServiceResponse) => s.categorySlug === cat.slug,
        ).length,
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, services]);

  const filtered = useMemo(() => {
    let result = grouped;

    if (activeChip !== "All") {
      result = result.filter((c) =>
        c.slug.toLowerCase().includes(activeChip.toLowerCase()),
      );
    }

    if (search.trim()) {
      result = result
        .map((c) => ({
          ...c,
          items: c.items.filter((i: ServiceResponse) =>
            i.title.toLowerCase().includes(search.toLowerCase()),
          ),
        }))
        .filter((c) => c.items.length > 0);
    }

    return result;
  }, [grouped, search, activeChip]);

  const chips = useMemo(() => {
    if (!categories) return ["All"];
    return ["All", ...categories.map((c: CategoryResponse) => c.slug)];
  }, [categories]);

  const initials = me
    ? `${me.firstName[0]}${me.lastName[0]}`.toUpperCase()
    : "??";

  const greeting = getGreeting();

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <LeafLogo size={34} />
              <View>
                <Text style={styles.brandTag}>SERENITY</Text>
                <Text style={styles.brandSub}>Масаж та велнес</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.bellBtn}>
                <Bell size={17} strokeWidth={1.6} color={Palette.taupe} />
                <View style={styles.bellDot} />
              </Pressable>
              <AvatarBadge
                initials={initials}
                size={38}
                bg={Palette.rose + "44"}
              />
            </View>
          </View>

          {/* ── Greeting ── */}
          <View style={styles.greeting}>
            <Text style={styles.greetTitle}>
              {greeting + ",\n"}
              <Text style={styles.greetName}>{me ? me.firstName : "—"} ✦</Text>
            </Text>
          </View>

          {/* ── Search ── */}
          <View style={[styles.searchBox, focused && styles.searchBoxFocused]}>
            <Search
              size={17}
              strokeWidth={1.7}
              color={focused ? Palette.sage : Palette.taupe}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Пошук послуг, процедур…"
              placeholderTextColor={Palette.taupe + "88"}
              style={styles.searchInput}
            />
          </View>

          {/* ── Promo ── */}
          {!search && (
            <View style={styles.section}>
              <PromoBanner />
            </View>
          )}

          {/* ── Chips ── */}
          {!search && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              keyboardShouldPersistTaps="handled"
            >
              {chips.map((chip) => (
                <Pressable
                  key={chip}
                  onPress={() => setActiveChip(chip)}
                  style={[
                    styles.chip,
                    activeChip === chip && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      activeChip === chip && styles.chipTextActive,
                    ]}
                  >
                    {chip === "All"
                      ? "Всі"
                      : categoryHelpers.categoryLabel(chip)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* ── Section label ── */}
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionTitle}>
              {search ? `Результати для "${search}"` : "Наші послуги"}
            </Text>
            {!search && (
              <Text style={styles.sectionCount}>
                {pluralize(grouped.length, PLURAL.category)}
              </Text>
            )}
          </View>

          {/* ── Content ── */}
          <View style={styles.accordions}>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={Palette.taupe}
                style={{ marginTop: 40 }}
              />
            ) : filtered.length === 0 ? (
              <Text style={styles.empty}>Послуги не знайдено</Text>
            ) : (
              filtered.map((cat, i) => (
                <CategoryAccordion
                  key={cat.id}
                  cat={cat}
                  defaultOpen={i === 0}
                  likedIds={likedIds}
                  onToggleLike={toggleLike}
                  onBook={openBooking}
                  onServicePress={openService}
                />
              ))
            )}
          </View>

          {!search && masters && masters.length > 0 && (
            <View style={{ marginTop: 22 }}>
              <View style={[styles.sectionLabel, { paddingHorizontal: 24 }]}>
                <Text style={styles.sectionTitle}>Наші майстри</Text>
                <Pressable>
                  <Text style={styles.sectionCount}>Всі →</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  gap: 12,
                  marginTop: 12,
                }}
              >
                {masters.map((master: MasterResponse) => (
                  <MasterCard
                    key={master.id}
                    master={master}
                    onPress={openMaster}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Доброго ранку";
  if (h < 17) return "Доброго дня";
  return "Доброго вечора";
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.ivory },
  scroll: { paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 20,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandTag: {
    fontSize: 10,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 1.6,
    color: Palette.taupe,
    opacity: 0.65,
  },
  brandSub: {
    fontSize: 12.5,
    fontFamily: "CormorantGaramond_400Regular",
    color: Palette.taupe,
    letterSpacing: 0.5,
  },
  headerActions: { flexDirection: "row", gap: 10, alignItems: "center" },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.sand,
    borderWidth: 1,
    borderColor: Palette.sandDark,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Palette.rose,
    borderWidth: 1.5,
    borderColor: Palette.ivory,
  },
  greeting: { paddingHorizontal: 24, marginBottom: 20 },
  greetTitle: {
    fontSize: 26,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.taupe,
    lineHeight: 32,
  },
  greetName: {
    fontFamily: "CormorantGaramond_400Regular",
    fontStyle: "italic",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 24,
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.sand,
    paddingHorizontal: 16,
    marginBottom: 22,
  },
  searchBoxFocused: { borderColor: Palette.sage },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
  },
  section: { paddingHorizontal: 24, marginBottom: 22 },
  chips: { paddingLeft: 24, paddingRight: 24, gap: 8, marginBottom: 22 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: Palette.sand,
    borderWidth: 1,
    borderColor: Palette.sandDark,
  },
  chipActive: { backgroundColor: Palette.taupe, borderColor: Palette.taupe },
  chipText: {
    fontSize: 12.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
  },
  chipTextActive: {
    fontFamily: "DMSans_500Medium",
    color: Palette.ivory,
  },
  sectionLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    opacity: 0.7,
  },
  accordions: { paddingHorizontal: 24, gap: 12 },
  empty: {
    textAlign: "center",
    paddingVertical: 40,
    fontFamily: "CormorantGaramond_400Regular",
    fontStyle: "italic",
    fontSize: 18,
    color: Palette.taupe,
    opacity: 0.6,
  },
});

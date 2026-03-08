import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Palette } from "@/src/theme/tokens";
import { useGetMasterDetails } from "@/src/api/generated/masters/masters";
import { MasterAvatar } from "@/src/components/MasterAvatar";
import { ServiceCard } from "@/src/components/home/ServiceCard";
import * as categoryHelpers from "@/src/utils/categoryHelpers";
import { useLikes } from "@/src/context/LikesContext";
import type { ServiceResponse } from "@/src/api/generated/apiV1.schemas";
import {
  BottomSheet,
  useBottomSheetScroll,
} from "@/src/components/BottomSheet";

type Props = {
  masterId: string | null;
  onClose: () => void;
  onBook: (serviceId: string) => void;
};

function MasterSheetContent({ masterId, onClose, onBook }: Props) {
  const { scrollEnabled, isAtTopRef } = useBottomSheetScroll();
  const { likedIds, toggleLike } = useLikes();
  const { data: master, isLoading } = useGetMasterDetails(masterId ?? "", {
    query: { enabled: !!masterId },
  });

  if (isLoading || !master) {
    return (
      <ActivityIndicator color={Palette.taupe} style={{ marginVertical: 60 }} />
    );
  }

  return (
    <ScrollView
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="always"
      scrollEventThrottle={16}
      onScroll={(e) => {
        isAtTopRef.current = e.nativeEvent.contentOffset.y <= 0;
      }}
    >
      <View style={styles.topRow}>
        <MasterAvatar
          firstName={master.firstName}
          lastName={master.lastName}
          photoUrl={master.photoUrl}
          size={72}
          accent={Palette.taupe}
        />
        <View style={styles.nameBox}>
          <Text style={styles.name}>
            {master.firstName} {master.lastName}
          </Text>
          {master.services.length > 0 && (
            <Text style={styles.specialty}>
              {categoryHelpers.categoryLabel(master.services[0].categorySlug)}
            </Text>
          )}
        </View>
      </View>

      {master.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Про майстра</Text>
          <Text style={styles.bio}>{master.bio}</Text>
        </View>
      )}

      <View style={styles.divider} />

      {master.services.map((s: ServiceResponse) => (
        <ServiceCard
          key={s.id}
          item={s}
          accent={categoryHelpers.categoryColor(s.categorySlug)}
          Icon={categoryHelpers.categoryIcon(s.categorySlug)}
          liked={likedIds?.has(s.id)}
          onToggleLike={() => toggleLike(s.id)}
          onBook={() => {
            onBook(s.id);
            onClose();
          }}
        />
      ))}
    </ScrollView>
  );
}

export function MasterSheet(props: Props) {
  return (
    <BottomSheet
      visible={!!props.masterId}
      onClose={props.onClose}
      maxHeight="92%"
    >
      <MasterSheetContent {...props} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(74,59,50,0.45)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Palette.ivory,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 99,
    backgroundColor: Palette.sandDark,
  },
  content: { paddingHorizontal: 24, paddingBottom: 8, gap: 18 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  nameBox: { flex: 1 },
  name: {
    fontSize: 22,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
    lineHeight: 28,
  },
  specialty: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    marginTop: 4,
    opacity: 0.75,
  },
  divider: { height: 1, backgroundColor: Palette.sand },
  section: { gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 1,
    color: Palette.taupe,
    opacity: 0.55,
    textTransform: "uppercase",
  },
  bio: {
    fontSize: 14.5,
    fontFamily: "DMSans_400Regular",
    color: Palette.espresso,
    lineHeight: 24,
    opacity: 0.88,
  },
});

import {
  useRef,
  useEffect,
  useState,
  ReactNode,
  createContext,
  useContext,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  DimensionValue,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Palette } from "@/src/theme/tokens";
import { X } from "lucide-react-native";

type BottomSheetScrollContextType = {
  scrollEnabled: boolean;
  isAtTopRef: React.MutableRefObject<boolean>;
};

const BottomSheetScrollContext = createContext<BottomSheetScrollContextType>({
  scrollEnabled: true,
  isAtTopRef: { current: true },
});

export function useBottomSheetScroll() {
  return useContext(BottomSheetScrollContext);
}

type Props = {
  visible: boolean;
  onClose: () => void;
  maxHeight?: DimensionValue;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  headerLeft?: ReactNode;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function BottomSheet({
  visible,
  onClose,
  maxHeight = "88%",
  title,
  subtitle,
  children,
  headerLeft,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const isAtTopRef = useRef(true);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [realHeight, setRealHeight] = useState(SCREEN_HEIGHT);

  const slideIn = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 30,
        stiffness: 250,
        mass: 0.8,
        restDisplacementThreshold: 1,
        restSpeedThreshold: 5,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const slideOut = (cb?: () => void) => {
    setScrollEnabled(false);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: realHeight + 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setScrollEnabled(true);
      cb?.();
    });
  };

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      opacity.setValue(0);
      slideIn();
    }
  }, [visible]);

  const handleClose = () => slideOut(onClose);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        onLayout={(e) => setRealHeight(e.nativeEvent.layout.height)}
        style={[
          styles.sheet,
          {
            maxHeight,
            paddingBottom: insets.bottom,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerMain}>
            {headerLeft && (
              <View style={styles.headerLeftSlot}>{headerLeft}</View>
            )}

            <View style={styles.headerTextContainer}>
              {typeof title === "string" ? (
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {title}
                </Text>
              ) : (
                title
              )}

              {typeof subtitle === "string" ? (
                <Text style={styles.headerSub} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : (
                subtitle
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            style={styles.closeBtn}
            activeOpacity={0.6}
            delayPressIn={0}
          >
            <X size={20} strokeWidth={2} color={Palette.taupe} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollContext.Provider
          value={{ scrollEnabled, isAtTopRef }}
        >
          {children}
        </BottomSheetScrollContext.Provider>
      </Animated.View>
    </Modal>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  headerMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLeftSlot: {},
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: Palette.espresso,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.taupe,
    marginTop: 2,
    opacity: 0.8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.sand,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

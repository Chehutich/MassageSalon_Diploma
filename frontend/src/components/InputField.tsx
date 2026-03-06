import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Palette } from "../theme/tokens";

export const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  rightElement,
  errorText,
  isInvalid,
  ...props
}: any) => {
  const [isFocused, setIsFocused] = useState(false);

  const anim = useRef(
    new Animated.Value(value && value.length > 0 ? 0 : 1),
  ).current;

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const animate = (toActive: boolean) => {
    Animated.timing(anim, {
      toValue: toActive ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (isInvalid) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 8,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -8,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 8,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isInvalid]);

  useEffect(() => {
    if (!isFocused) {
      animate(value != null && value.length > 0);
    }
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    animate(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    animate(value != null && value.length > 0);
  };

  const isActive = isFocused || (value != null && value.length > 0);

  const labelTop = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 20],
  });

  const labelFontSize = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [11, 15],
  });

  const labelColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [Palette.sage, Palette.taupe],
  });

  const labelLeft = icon
    ? anim.interpolate({
        inputRange: [0, 1],
        outputRange: [48, 48],
      })
    : 16;

  return (
    <View style={styles.outerContainer}>
      <Animated.View
        style={{ transform: [{ translateX: shakeAnim }], width: "100%" }}
      >
        <View style={styles.container}>
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelTop,
                fontSize: labelFontSize,
                color: labelColor,
                left: labelLeft,
              },
            ]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>

          {icon && <View style={styles.iconContainerLeft}>{icon}</View>}

          <TextInput
            style={[
              styles.input,
              isFocused && styles.inputFocused,
              isInvalid && styles.inputError,
              icon && { paddingLeft: 48 },
              rightElement && { paddingRight: 48 },
            ]}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isActive ? (placeholder ?? "") : ""}
            placeholderTextColor={Palette.taupe + "60"}
            {...props}
          />

          {rightElement && (
            <View style={styles.iconContainerRight}>{rightElement}</View>
          )}

          {isFocused && !isInvalid && <View style={styles.focusBar} />}
        </View>
      </Animated.View>

      {/* Error */}
      {isInvalid && errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
  },
  container: {
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    fontFamily: "DMSans_500Medium",
    zIndex: 10,
  },
  input: {
    height: 60,
    backgroundColor: Palette.sand,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    color: Palette.espresso,
    fontSize: 16,
    fontFamily: "DMSans_400Regular",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: Palette.sage,
    shadowColor: Palette.sage,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: Palette.rose,
  },
  iconContainerLeft: {
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerRight: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  focusBar: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: Palette.sage,
    borderRadius: 2,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 16,
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Palette.rose,
  },
});

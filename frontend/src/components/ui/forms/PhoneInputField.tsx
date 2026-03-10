import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { InputField } from "./InputField";
import { Palette } from "../theme/tokens";

export const PhoneInputField = (props: any) => {
  return (
    <InputField
      {...props}
      keyboardType="phone-pad"
      icon={
        <TouchableOpacity style={styles.countryPicker} activeOpacity={0.7}>
          <Text style={styles.flag}>🇺🇦</Text>
          <Text style={styles.countryCode}>+380</Text>
          <ChevronDown size={14} color={Palette.taupe} />
          <View style={styles.divider} />
        </TouchableOpacity>
      }
      style={[props.style, { paddingLeft: 110 }]}
    />
  );
};

const styles = StyleSheet.create({
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 16,
    height: "100%",
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 15,
    fontFamily: "DMSans_500Medium",
    color: Palette.espresso,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Palette.sandDark,
    marginLeft: 8,
  },
});

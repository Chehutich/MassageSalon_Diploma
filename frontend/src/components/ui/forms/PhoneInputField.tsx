import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { InputField } from "./InputField";
import { Palette } from "@/src/theme/tokens";
import { CountryInfo, COUNTRIES, CountryPickerSheet } from "./CountryPickerSheet";

interface PhoneInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  errorText?: string | null;
  isInvalid?: boolean;
}

export const PhoneInputField = ({
  label,
  value,
  onChangeText,
  errorText,
  isInvalid,
}: PhoneInputFieldProps) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [country, setCountry] = useState<CountryInfo>(COUNTRIES[0]); // Default to UA

  // Find if value starts with any known country code
  useEffect(() => {
    if (value && typeof value === "string") {
      const matched = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (matched && matched.code !== country.code) {
        setCountry(matched);
      }
    }
  }, [value]);

  const localNumber = value ? value.replace(country.dialCode, "") : "";

  const handleChangeText = (text: string) => {
    const stripped = text.replace(/\D/g, "");
    onChangeText(country.dialCode + stripped);
  };

  return (
    <View>
      <InputField
        label={label}
        value={localNumber}
        onChangeText={handleChangeText}
        placeholder="(XXX) XXX-XX-XX"
        keyboardType="phone-pad"
        errorText={errorText}
        isInvalid={isInvalid}
        iconPaddingLeft={125}
        icon={
          <TouchableOpacity
            style={styles.countryPicker}
            activeOpacity={0.7}
            onPress={() => setPickerVisible(true)}
          >
            <Text style={styles.flag}>{country.flag}</Text>
            <Text style={styles.countryCode}>{country.dialCode}</Text>
            <ChevronDown size={14} color={Palette.taupe} />
            <View style={styles.divider} />
          </TouchableOpacity>
        }
      />

      <CountryPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        selectedCode={country.dialCode}
        onSelect={(newCountry) => {
          setCountry(newCountry);
          onChangeText(newCountry.dialCode + localNumber);
        }}
      />
    </View>
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

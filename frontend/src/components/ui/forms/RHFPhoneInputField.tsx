import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { InputField } from "./InputField";
import {
    CountryPickerSheet,
    COUNTRIES,
    CountryInfo,
} from "./CountryPickerSheet";
import { ChevronDown } from "lucide-react-native";
import { Palette } from "@/src/theme/tokens";

interface RHFPhoneInputFieldProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T, any>;
    label: string;
}

export function RHFPhoneInputField<T extends FieldValues>({
    name,
    control,
    label,
}: RHFPhoneInputFieldProps<T>) {
    const [pickerVisible, setPickerVisible] = useState(false);
    const [country, setCountry] = useState<CountryInfo>(COUNTRIES[0]); // Default to UA

    return (
        <Controller
            name={name}
            control={control}
            render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
            }) => {
                // Find if value starts with any known country code (mostly on mount/edit)
                useEffect(() => {
                    if (value && typeof value === "string") {
                        const matched = COUNTRIES.find((c) => value.startsWith(c.dialCode));
                        if (matched && matched.code !== country.code) {
                            setCountry(matched);
                        }
                    } else if (!value) {

                    }
                }, [value]);

                const localNumber = value ? value.replace(country.dialCode, "") : "";

                const handleChangeText = (text: string) => {
                    const stripped = text.replace(/\D/g, "");
                    onChange(country.dialCode + stripped);
                };

                return (
                    <View>
                        <InputField
                            label={label}
                            value={localNumber}
                            onChangeText={handleChangeText}
                            onBlur={onBlur}
                            placeholder="(XXX) XXX-XX-XX"
                            keyboardType="phone-pad"
                            errorText={error?.message}
                            isInvalid={!!error}
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
                                onChange(newCountry.dialCode + localNumber);
                            }}
                        />
                    </View>
                );
            }}
        />
    );
}

const styles = StyleSheet.create({
    countryPicker: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
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

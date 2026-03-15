import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { BottomSheet } from "../layout/BottomSheet";
import { Palette } from "@/src/theme/tokens";
import { Check } from "lucide-react-native";

export type CountryInfo = {
    name: string;
    dialCode: string;
    code: string;
    flag: string;
};

export const COUNTRIES: CountryInfo[] = [
    { name: "Україна", dialCode: "+380", code: "UA", flag: "🇺🇦" },
    { name: "Poland", dialCode: "+48", code: "PL", flag: "🇵🇱" },
    { name: "Germany", dialCode: "+49", code: "DE", flag: "🇩🇪" },
    { name: "United Kingdom", dialCode: "+44", code: "GB", flag: "🇬🇧" },
    { name: "USA & Canada", dialCode: "+1", code: "US", flag: "🇺🇸" },
    { name: "Czechia", dialCode: "+420", code: "CZ", flag: "🇨🇿" },
    { name: "Spain", dialCode: "+34", code: "ES", flag: "🇪🇸" },
    { name: "Italy", dialCode: "+39", code: "IT", flag: "🇮🇹" },
    { name: "France", dialCode: "+33", code: "FR", flag: "🇫🇷" },
    { name: "Romania", dialCode: "+40", code: "RO", flag: "🇷🇴" },
    { name: "Slovakia", dialCode: "+421", code: "SK", flag: "🇸🇰" },
];

type Props = {
    visible: boolean;
    onClose: () => void;
    selectedCode: string;
    onSelect: (country: CountryInfo) => void;
};

export function CountryPickerSheet({
    visible,
    onClose,
    selectedCode,
    onSelect,
}: Props) {
    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title="Оберіть країну"
            maxHeight="60%"
        >
            <FlatList
                data={COUNTRIES}
                keyExtractor={(item) => item.code}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const isSelected = item.dialCode === selectedCode;
                    return (
                        <TouchableOpacity
                            style={styles.item}
                            activeOpacity={0.7}
                            onPress={() => {
                                onSelect(item);
                                onClose();
                            }}
                        >
                            <Text style={styles.flag}>{item.flag}</Text>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.dialCode}>{item.dialCode}</Text>
                            {isSelected && <Check size={18} color={Palette.espresso} />}
                            {!isSelected && <View style={{ width: 18 }} />}
                        </TouchableOpacity>
                    );
                }}
            />
        </BottomSheet>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 },
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Palette.sand,
    },
    flag: { fontSize: 24, marginRight: 12 },
    name: {
        flex: 1,
        fontSize: 16,
        fontFamily: "DMSans_500Medium",
        color: Palette.espresso,
    },
    dialCode: {
        fontSize: 15,
        fontFamily: "DMSans_400Regular",
        color: Palette.taupe,
        marginRight: 12,
    },
});

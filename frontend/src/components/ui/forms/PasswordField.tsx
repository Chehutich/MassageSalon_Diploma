import React, { useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Eye, EyeOff, Lock } from "lucide-react-native";
import { InputField } from "./InputField";
import { Palette } from "@/src/theme/tokens";

export const PasswordField = (props: any) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const toggleVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <InputField
      {...props}
      icon={props.icon || <Lock size={18} color={Palette.taupe} />}
      secureTextEntry={!isPasswordVisible}
      placeholder={props.placeholder ?? "••••••••"}
      rightElement={
        <TouchableOpacity
          onPress={toggleVisibility}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.eyeButton}
        >
          {isPasswordVisible ? (
            <EyeOff size={20} color={Palette.taupe} />
          ) : (
            <Eye size={20} color={Palette.taupe} />
          )}
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  eyeButton: {
    justifyContent: "center",
    alignItems: "center",
  },
});

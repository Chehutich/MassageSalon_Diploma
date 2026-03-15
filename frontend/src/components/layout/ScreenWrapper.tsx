import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Palette } from '@/src/theme/tokens';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withScrollView?: boolean;
}

export function ScreenWrapper({
  children,
  style,
  contentContainerStyle,
  withScrollView = true,
}: ScreenWrapperProps) {
  const content = withScrollView ? (
    <KeyboardAwareScrollView
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollGrow, contentContainerStyle]}
      bounces={false}
    >
      {children}
    </KeyboardAwareScrollView>
  ) : (
    children
  );

  return (
    <SafeAreaView style={[styles.root, style]} edges={['top', 'bottom']}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.ivory,
  },
  scrollGrow: {
    flexGrow: 1,
  },
});

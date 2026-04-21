import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { colors, typography } from '../theme/colors';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && !disabled && !loading ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.textOnDark : colors.text} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 2,
    marginVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 0.12,
        shadowRadius: 0,
        shadowOffset: { width: 5, height: 5 },
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `5px 5px 0 ${colors.shadow}`,
      },
    }),
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.border,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  pressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
    ...Platform.select({
      ios: {
        shadowOffset: { width: 4, height: 4 },
      },
      web: {
        boxShadow: `4px 4px 0 ${colors.shadow}`,
      },
    }),
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  primaryLabel: {
    color: colors.textOnDark,
  },
  secondaryLabel: {
    color: colors.text,
  },
});

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, typography } from '../theme/colors';

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  multiline = false,
  masked = false,
}) {
  const maskedValue = masked ? '*'.repeat(String(value || '').length) : value;

  const handleChangeText = (nextValue) => {
    if (!masked) {
      onChangeText(nextValue);
      return;
    }

    const currentValue = String(value || '');
    const currentMask = '*'.repeat(currentValue.length);

    if (nextValue.length < currentMask.length) {
      onChangeText(currentValue.slice(0, nextValue.length));
      return;
    }

    if (nextValue.length === currentMask.length) {
      return;
    }

    const appendedText = nextValue.slice(currentMask.length);
    onChangeText(currentValue + appendedText);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={maskedValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        style={[styles.input, multiline ? styles.multiline : null, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    ...typography.body,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.text,
  },
  input: {
    ...typography.body,
    minHeight: 54,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#FBF7F0',
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    ...typography.body,
    marginTop: 6,
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
  },
});

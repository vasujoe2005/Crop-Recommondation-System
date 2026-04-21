import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme/colors';

export default function Card({ title, subtitle, children, style, accent = colors.accent }) {
  return (
    <View style={[styles.card, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          <View style={[styles.accentBar, { backgroundColor: accent }]} />
          <View style={styles.headerCopy}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 18,
    marginVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 0.1,
        shadowRadius: 0,
        shadowOffset: { width: 6, height: 6 },
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `6px 6px 0 ${colors.shadow}`,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  accentBar: {
    width: 14,
    alignSelf: 'stretch',
    marginRight: 12,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    ...typography.display,
    fontSize: 24,
    lineHeight: 30,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});

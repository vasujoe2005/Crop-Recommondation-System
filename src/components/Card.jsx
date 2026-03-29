import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function Card({ title, subtitle, children, style, accent = '#2F855A' }) {
  return (
    <View style={[styles.card, style]}>
      {(title || subtitle) && (
        <View style={[styles.header, { borderLeftColor: accent }]}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(216, 224, 210, 0.75)',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: `0 10px 18px ${colors.shadow}14`,
      },
    }),
  },
  header: {
    borderLeftWidth: 5,
    paddingLeft: 14,
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});

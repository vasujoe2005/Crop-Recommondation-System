import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function BrandHeader({ compact = false, style }) {
  return (
    <View style={[styles.wrapper, compact ? styles.compactWrapper : null, style]}>
      <Image source={require('../../assets/geocrop-growth-logo.png')} style={compact ? styles.compactLogo : styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
  },
  compactWrapper: {
    paddingVertical: 4,
  },
  logo: {
    width: 168,
    height: 168,
  },
  compactLogo: {
    width: 88,
    height: 88,
  },
});

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import { colors, typography } from '../theme/colors';
import { buildCropGuide } from '../utils/cropGuidance';

function StepList({ title, steps }) {
  return (
    <Card title={title} subtitle="">
      {steps.map((step, index) => (
        <View key={`${title}-${index}`} style={styles.stepRow}>
          <Text style={styles.stepNumber}>{index + 1}</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </Card>
  );
}

export default function CropGuideScreen({ route }) {
  const crop = route.params?.crop || null;
  const farm = route.params?.farm || null;
  const recommendation = route.params?.recommendation || null;
  const guide = buildCropGuide({ crop, farm, recommendation });

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>{guide.cropName}</Text>
        {/* <Text style={styles.pageSubtitle}>
          The farmer can either prepare the land from scratch or continue directly into the growing process. This page keeps the steps simple and practical.
        </Text> */}
      </View>

      <Card title="Selected farm" subtitle="This crop plan is tied to the current saved farm.">
        <Text style={styles.infoLine}>Farm: {guide.farmName}</Text>
        <Text style={styles.infoLine}>Crop: {guide.cropName}</Text>
      </Card>

      <StepList title="Land preparation" steps={guide.landPreparation} />
      <StepList title="Cultivation steps" steps={guide.cultivation} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 28,
    backgroundColor: colors.background,
  },
  pageIntro: {
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingBottom: 14,
    marginBottom: 10,
  },
  pageTitle: {
    ...typography.display,
    fontSize: 36,
    lineHeight: 42,
    color: colors.text,
    textTransform: 'capitalize',
  },
  pageSubtitle: {
    ...typography.body,
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  infoLine: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    ...typography.display,
    width: 28,
    fontSize: 22,
    lineHeight: 26,
    color: colors.accent,
  },
  stepText: {
    ...typography.body,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
});

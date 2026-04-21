import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import { colors, typography } from '../theme/colors';
import { discardCropForFarm, getDiscardedCropsForFarm } from '../utils/storage';

const fertilityAccent = {
  low: colors.danger,
  medium: colors.warning,
  high: colors.success,
};

function metricValue(value, suffix = '') {
  if (value === null || value === undefined) {
    return '--';
  }

  return `${value}${suffix}`;
}

function MetricBox({ label, value }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export default function RecommendationScreen({ navigation, route }) {
  const recommendation = route.params?.recommendation || route.params?.item || {};
  const farm = route.params?.farm || null;
  const soil = recommendation?.soil_data || {};
  const climate = recommendation?.climate_data || {};
  const vegetation = recommendation?.vegetation_data || {};
  const remoteSensing = recommendation?.remote_sensing_data || {};
  const units = recommendation?.measurement_units || {};
  const providers = useMemo(
    () => (recommendation?.providers_used || []).filter(
      (provider) => provider?.provider !== 'Hyperspectral Asset' && provider?.provider !== 'India District Crop Profiles',
    ),
    [recommendation],
  );
  const fertilityStatus = recommendation?.soil_fertility_status || 'Medium';
  const fertilityColor = fertilityAccent[fertilityStatus.toLowerCase()] || colors.primary;
  const [discardedCrops, setDiscardedCrops] = useState([]);
  const showHyperspectralMetrics = remoteSensing?.hyperspectral_mineral_index !== null
    && remoteSensing?.hyperspectral_mineral_index !== undefined
    && remoteSensing?.hyperspectral_clay_index !== null
    && remoteSensing?.hyperspectral_clay_index !== undefined;

  useEffect(() => {
    const loadDiscardedCrops = async () => {
      if (!farm?.id) {
        setDiscardedCrops([]);
        return;
      }
      const stored = await getDiscardedCropsForFarm(farm.id);
      setDiscardedCrops(stored);
    };

    loadDiscardedCrops();
  }, [farm?.id]);

  const topCrops = useMemo(() => {
    const source = recommendation?.top_crops || recommendation?.recommended_crops || [];
    if (!discardedCrops.length) {
      return source.slice(0, 7);
    }

    return source.filter((crop) => !discardedCrops.includes(crop.name || crop.crop)).slice(0, 7);
  }, [recommendation, discardedCrops]);

  const handleDiscard = async (crop) => {
    if (!farm?.id) {
      return;
    }
    const nextValue = await discardCropForFarm(farm.id, crop.name || crop.crop);
    setDiscardedCrops(nextValue);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Field report</Text>
        {/* <Text style={styles.pageSubtitle}>
          The system reviewed this farm and returned 7 suitable crop options. Choose one to continue with step-by-step field guidance.
        </Text> */}
      </View>

      <Card title="Current field conditions" subtitle="">
        <View style={styles.metricsRow}>
          <MetricBox label="Soil pH" value={metricValue(soil?.ph)} />
          <MetricBox label="Temperature" value={metricValue(climate?.temp, ' C')} />
          <MetricBox label="Rainfall" value={metricValue(climate?.rainfall, ' mm')} />
        </View>

        <View style={[styles.fertilityFlag, { borderColor: fertilityColor, backgroundColor: `${fertilityColor}22` }]}>
          <Text style={[styles.fertilityText, { color: fertilityColor }]}>Soil fertility status: {fertilityStatus}</Text>
        </View>

        {farm?.name ? <Text style={styles.metaText}>Farm: {farm.name}</Text> : null}
        {recommendation?.location ? <Text style={styles.metaText}>Location: {recommendation.location.latitude?.toFixed?.(5)}, {recommendation.location.longitude?.toFixed?.(5)}</Text> : null}
        {/* {recommendation?.message ? <Text style={styles.infoBanner}>{recommendation.message}</Text> : null} */}
      </Card>

      <Card title="Recommended crops" subtitle="">
        {topCrops.length > 0 ? (
          topCrops.map((crop, index) => (
            <View key={`${crop.name || crop.crop}-${index}`} style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <Text style={styles.cropName}>{crop.name || crop.crop}</Text>
                {/* <Text style={styles.cropScore}>Score: {crop.score ?? crop.rank_score ?? '--'}</Text> */}
              </View>
              {crop?.season ? <Text style={styles.cropMeta}>Season: {crop.season}</Text> : null}
              {crop?.soil_type ? <Text style={styles.cropMeta}>Soil type: {crop.soil_type}</Text> : null}
              {/* {crop?.regional_match ? <Text style={styles.cropTag}>Supported by the district crop profile</Text> : null}
              {(crop?.reasoning || []).map((reason, reasonIndex) => (
                <Text key={`${crop.crop}-${reasonIndex}`} style={styles.cropReason}>{reason}</Text>
              ))} */}
              <View style={styles.actionRow}>
                <Button title="Choose Crop" onPress={() => navigation.navigate('CropGuideScreen', { crop, farm, recommendation })} style={styles.actionButton} />
                {farm?.id ? <Button title="Discard Crop" onPress={() => handleDiscard(crop)} variant="secondary" style={styles.actionButton} /> : null}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No crop recommendations are left for this farm. Clear discarded crops in storage if you want to review all options again.</Text>
        )}
      </Card>

      <Card title="Soil and environment details" subtitle="">
        <Text style={styles.dataLine}>Texture: {soil?.texture || '--'}</Text>
        <Text style={styles.dataLine}>Nitrogen: {metricValue(soil?.nitrogen_kg_per_acre, ` ${units?.nitrogen || 'kg/acre'}`)}</Text>
        <Text style={styles.dataLine}>Phosphorus: {metricValue(soil?.phosphorus_kg_per_acre, ` ${units?.phosphorus || 'kg/acre'}`)}</Text>
        <Text style={styles.dataLine}>Potassium: {metricValue(soil?.potassium_kg_per_acre, ` ${units?.potassium || 'kg/acre'}`)}</Text>
        <Text style={styles.dataLine}>Organic carbon: {metricValue(soil?.organic_carbon, ` ${units?.organic_carbon || '%'}`)}</Text>
        <Text style={styles.dataLine}>CEC: {metricValue(soil?.cec, ` ${units?.cec || 'cmol(+)/kg'}`)}</Text>
        <Text style={styles.dataLine}>Humidity: {metricValue(climate?.humidity, '%')}</Text>
        <Text style={styles.dataLine}>Soil moisture: {metricValue(climate?.soil_moisture, ` ${units?.soil_moisture || 'm3/m3'}`)}</Text>
        <Text style={styles.dataLine}>Surface temperature: {metricValue(climate?.surface_temperature, ' C')}</Text>
        <Text style={styles.dataLine}>NDVI: {metricValue(vegetation?.ndvi)}</Text>
        {showHyperspectralMetrics ? <Text style={styles.dataLine}>Hyperspectral mineral index: {metricValue(remoteSensing?.hyperspectral_mineral_index)}</Text> : null}
        {showHyperspectralMetrics ? <Text style={styles.dataLine}>Hyperspectral clay index: {metricValue(remoteSensing?.hyperspectral_clay_index)}</Text> : null}
      </Card>
      <Card title="Weather note" subtitle="">
        <Text style={styles.supportText}>{climate?.forecast_summary || 'Weather forecast text is not available in this response.'}</Text>
      </Card>

      {/* <Card title="Provider status" subtitle="">
        {providers.length > 0 ? (
          providers.map((provider, index) => (
            <View key={`${provider.provider}-${index}`} style={styles.providerRow}>
              <Text style={styles.providerName}>{provider.provider}</Text>
              <Text style={styles.providerStatus}>{provider.status}</Text>
              {provider?.details ? <Text style={styles.providerDetails}>{provider.details}</Text> : null}
            </View>
          ))
        ) : (
          <Text style={styles.supportText}>No provider details were returned.</Text>
        )}
      </Card> */}

      {/* <Card title="Fertilizer suggestion" subtitle="Returned advice for nutrient support.">
        <Text style={styles.supportText}>{recommendation?.fertilizer_suggestion || '--'}</Text>
      </Card>

      <Card title="Irrigation suggestion" subtitle="Returned advice for field moisture management.">
        <Text style={styles.supportText}>{recommendation?.irrigation_suggestion || '--'}</Text>
      </Card> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 28, backgroundColor: colors.background },
  pageIntro: { borderBottomWidth: 2, borderBottomColor: colors.border, paddingBottom: 14, marginBottom: 10 },
  pageTitle: { ...typography.display, fontSize: 34, lineHeight: 40, color: colors.text },
  pageSubtitle: { ...typography.body, marginTop: 8, fontSize: 15, lineHeight: 22, color: colors.textMuted },
  metricsRow: { flexDirection: 'row', marginHorizontal: -4 },
  metricBox: { flex: 1, backgroundColor: '#FBF7F0', borderWidth: 2, borderColor: colors.border, padding: 12, marginHorizontal: 4 },
  metricLabel: { ...typography.body, fontSize: 12, color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  metricValue: { ...typography.display, fontSize: 22, lineHeight: 26, color: colors.text },
  fertilityFlag: { marginTop: 16, borderWidth: 2, paddingHorizontal: 12, paddingVertical: 10, alignSelf: 'flex-start' },
  fertilityText: { ...typography.body, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  metaText: { ...typography.body, marginTop: 12, color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  infoBanner: { ...typography.body, marginTop: 12, padding: 12, borderWidth: 2, borderColor: colors.accent, backgroundColor: colors.accentSoft, color: colors.text, lineHeight: 21, fontSize: 14 },
  cropCard: { borderTopWidth: 2, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 },
  cropHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cropName: { ...typography.display, flex: 1, fontSize: 24, lineHeight: 28, color: colors.text, textTransform: 'capitalize', paddingRight: 12 },
  cropScore: { ...typography.body, fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  cropMeta: { ...typography.body, marginTop: 5, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  cropReason: { ...typography.body, marginTop: 6, fontSize: 14, color: colors.text, lineHeight: 21 },
  cropTag: { ...typography.body, marginTop: 8, alignSelf: 'flex-start', borderWidth: 2, borderColor: colors.info, backgroundColor: '#D7E1EC', color: colors.info, fontSize: 12, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  actionRow: { flexDirection: 'row', marginTop: 8 },
  actionButton: { flex: 1, marginHorizontal: 4 },
  dataLine: { ...typography.body, fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: 8 },
  providerRow: { borderTopWidth: 2, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 },
  providerName: { ...typography.display, fontSize: 21, lineHeight: 25, color: colors.text },
  providerStatus: { ...typography.body, marginTop: 4, fontSize: 12, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.8 },
  providerDetails: { ...typography.body, marginTop: 6, fontSize: 14, color: colors.textMuted, lineHeight: 21 },
  supportText: { ...typography.body, fontSize: 15, lineHeight: 22, color: colors.text },
  emptyText: { ...typography.body, color: colors.textMuted, fontSize: 15, lineHeight: 22 },
});

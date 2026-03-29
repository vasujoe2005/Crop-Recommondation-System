import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';

const cropIcons = {
  rice: 'RI',
  maize: 'MZ',
  wheat: 'WH',
  cotton: 'CT',
  sugarcane: 'SC',
  millets: 'ML',
  groundnut: 'GN',
  soybean: 'SB',
  barley: 'BR',
  pulses: 'PL',
};

const fertilityAccent = {
  low: '#DC2626',
  medium: '#D97706',
  high: '#15803D',
};

function getCropIcon(name = '') {
  return cropIcons[name.toLowerCase()] || 'CP';
}

function metricValue(value, suffix = '') {
  if (value === null || value === undefined) {
    return '--';
  }
  return `${value}${suffix}`;
}

export default function RecommendationScreen({ route }) {
  const recommendation = route.params?.recommendation || route.params?.item || {};
  const topCrops = recommendation?.top_crops || recommendation?.recommended_crops || [];
  const soil = recommendation?.soil_data || {};
  const climate = recommendation?.climate_data || {};
  const vegetation = recommendation?.vegetation_data || {};
  const providers = recommendation?.providers_used || [];
  const fertilityStatus = recommendation?.soil_fertility_status || 'Medium';
  const fertilityColor = fertilityAccent[fertilityStatus.toLowerCase()] || '#2F855A';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card title="Field Conditions" subtitle="Live geospatial extraction for the selected farm">
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Soil pH</Text>
            <Text style={styles.metricValue}>{metricValue(soil?.ph)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Temperature</Text>
            <Text style={styles.metricValue}>{metricValue(climate?.temp, ' C')}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Rainfall</Text>
            <Text style={styles.metricValue}>{metricValue(climate?.rainfall, ' mm')}</Text>
          </View>
        </View>

        <View style={[styles.fertilityPill, { backgroundColor: `${fertilityColor}1A` }]}>
          <Text style={[styles.fertilityText, { color: fertilityColor }]}>
            Soil Fertility Status: {fertilityStatus}
          </Text>
        </View>

        {recommendation?.location ? (
          <Text style={styles.metaText}>
            Location: {recommendation.location.latitude?.toFixed?.(5)}, {recommendation.location.longitude?.toFixed?.(5)}
          </Text>
        ) : null}
        {recommendation?.message ? <Text style={styles.infoBanner}>{recommendation.message}</Text> : null}
      </Card>

      <Card title="Soil And Environment" subtitle="Extracted from online sources">
        <View style={styles.grid}>
          <Text style={styles.gridItem}>Texture: {soil?.texture || '--'}</Text>
          <Text style={styles.gridItem}>Nitrogen: {metricValue(soil?.nitrogen)}</Text>
          <Text style={styles.gridItem}>Phosphorus: {metricValue(soil?.phosphorus)}</Text>
          <Text style={styles.gridItem}>Potassium: {metricValue(soil?.potassium)}</Text>
          <Text style={styles.gridItem}>Organic Carbon: {metricValue(soil?.organic_carbon)}</Text>
          <Text style={styles.gridItem}>CEC: {metricValue(soil?.cec)}</Text>
          <Text style={styles.gridItem}>Clay: {metricValue(soil?.clay, '%')}</Text>
          <Text style={styles.gridItem}>Sand: {metricValue(soil?.sand, '%')}</Text>
          <Text style={styles.gridItem}>Silt: {metricValue(soil?.silt, '%')}</Text>
          <Text style={styles.gridItem}>Humidity: {metricValue(climate?.humidity, '%')}</Text>
          <Text style={styles.gridItem}>Soil Moisture: {metricValue(climate?.soil_moisture)}</Text>
          <Text style={styles.gridItem}>Surface Temp: {metricValue(climate?.surface_temperature, ' C')}</Text>
          <Text style={styles.gridItem}>NDVI: {metricValue(vegetation?.ndvi)}</Text>
        </View>
      </Card>

      <Card title="Crop Recommendations" subtitle="Best matches against the crop dataset">
        {topCrops.length > 0 ? (
          topCrops.slice(0, 10).map((crop, index) => (
            <View key={`${crop.name || crop.crop}-${index}`} style={styles.cropCard}>
              <Text style={styles.cropIcon}>{getCropIcon(crop.name || crop.crop)}</Text>
              <View style={styles.cropContent}>
                <Text style={styles.cropName}>{crop.name || crop.crop}</Text>
                <Text style={styles.cropScore}>Score: {crop.score ?? crop.rank_score ?? '--'}</Text>
                {crop?.season ? <Text style={styles.cropMeta}>Season: {crop.season}</Text> : null}
                {crop?.soil_type ? <Text style={styles.cropMeta}>Soil Type: {crop.soil_type}</Text> : null}
                {(crop?.reasoning || []).map((reason, reasonIndex) => (
                  <Text key={`${crop.crop}-${reasonIndex}`} style={styles.cropReason}>
                    {reason}
                  </Text>
                ))}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No crop recommendations found.</Text>
        )}
      </Card>

      <Card title="Weather Forecast" subtitle="Short field advisory">
        <Text style={styles.supportText}>
          {climate?.forecast_summary || 'Weather forecast is not available in this response.'}
        </Text>
      </Card>

      <Card title="Provider Status" subtitle="Which online sources were used">
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
      </Card>

      <Card title="Fertilizer Suggestion" subtitle="Field-ready recommendation">
        <Text style={styles.supportText}>{recommendation?.fertilizer_suggestion || '--'}</Text>
      </Card>

      <Card title="Irrigation Suggestion" subtitle="Moisture management advice">
        <Text style={styles.supportText}>{recommendation?.irrigation_suggestion || '--'}</Text>
      </Card>

      {vegetation?.note ? (
        <Card title="Vegetation Layer" subtitle="NDVI integration status">
          <Text style={styles.supportText}>{vegetation.note}</Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 28,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  fertilityPill: {
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  fertilityText: {
    fontWeight: '700',
  },
  metaText: {
    marginTop: 12,
    color: '#475569',
    fontSize: 14,
  },
  infoBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    lineHeight: 20,
  },
  grid: {
    gap: 8,
  },
  gridItem: {
    fontSize: 15,
    color: '#334155',
  },
  cropCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FFF8',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cropIcon: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
    backgroundColor: '#DCFCE7',
    width: 36,
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 18,
    marginRight: 14,
  },
  cropContent: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  cropScore: {
    marginTop: 4,
    fontSize: 14,
    color: '#475569',
  },
  cropMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
  cropReason: {
    marginTop: 4,
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  providerRow: {
    marginBottom: 14,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  providerStatus: {
    marginTop: 3,
    fontSize: 13,
    color: '#166534',
    textTransform: 'capitalize',
  },
  providerDetails: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  supportText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  emptyText: {
    color: '#64748B',
  },
});

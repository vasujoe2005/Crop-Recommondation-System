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

function deriveSuggestions(recommendation) {
  const fertility = recommendation?.soil_fertility_status?.toLowerCase();
  if (fertility === 'low') {
    return {
      fertilizer: 'Apply compost with balanced NPK before sowing.',
      irrigation: 'Use light and frequent irrigation to avoid nutrient stress.',
    };
  }
  if (fertility === 'high') {
    return {
      fertilizer: 'Reduce excess nitrogen and focus on micronutrient balance.',
      irrigation: 'Adopt moisture-based irrigation to avoid waterlogging.',
    };
  }
  return {
    fertilizer: 'Use a soil-test-based fertilizer mix during land preparation.',
    irrigation: 'Follow crop-stage irrigation with field drainage checks.',
  };
}

export default function RecommendationScreen({ route }) {
  const recommendation = route.params?.recommendation || route.params?.item || {};
  const topCrops = recommendation?.top_crops || recommendation?.recommended_crops || [];
  const weather = recommendation?.weather_forecast || recommendation?.weather || null;
  const suggestions = deriveSuggestions(recommendation);
  const fertilityStatus = recommendation?.soil_fertility_status || 'Medium';
  const fertilityColor = fertilityAccent[fertilityStatus.toLowerCase()] || '#2F855A';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card title="Field Conditions" subtitle="Static recommendation preview for the selected farm">
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Soil pH</Text>
            <Text style={styles.metricValue}>{recommendation?.soil_ph ?? '--'}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Temperature</Text>
            <Text style={styles.metricValue}>
              {recommendation?.temperature ?? '--'}
              {recommendation?.temperature ? ' C' : ''}
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Rainfall</Text>
            <Text style={styles.metricValue}>
              {recommendation?.rainfall ?? '--'}
              {recommendation?.rainfall ? ' mm' : ''}
            </Text>
          </View>
        </View>
        <View style={[styles.fertilityPill, { backgroundColor: `${fertilityColor}1A` }]}>
          <Text style={[styles.fertilityText, { color: fertilityColor }]}>
            Soil Fertility Status: {fertilityStatus}
          </Text>
        </View>
      </Card>

      <Card title="Crop Recommendations" subtitle="Static list of 10 crop matches">
        {topCrops.length > 0 ? (
          topCrops.slice(0, 10).map((crop, index) => (
            <View key={`${crop.name || crop.crop}-${index}`} style={styles.cropCard}>
              <Text style={styles.cropIcon}>{getCropIcon(crop.name || crop.crop)}</Text>
              <View style={styles.cropContent}>
                <Text style={styles.cropName}>{crop.name || crop.crop}</Text>
                <Text style={styles.cropScore}>Score: {crop.score ?? crop.rank_score ?? '--'}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No crop recommendations found.</Text>
        )}
      </Card>

      <Card title="Weather Forecast" subtitle="Static advisory">
        <Text style={styles.supportText}>
          {weather?.summary || weather?.forecast || 'Weather forecast is not available in this response.'}
        </Text>
      </Card>

      <Card title="Fertilizer Suggestion" subtitle="Field-ready recommendation">
        <Text style={styles.supportText}>
          {recommendation?.fertilizer_suggestion || suggestions.fertilizer}
        </Text>
      </Card>

      <Card title="Irrigation Suggestion" subtitle="Moisture management advice">
        <Text style={styles.supportText}>
          {recommendation?.irrigation_suggestion || suggestions.irrigation}
        </Text>
      </Card>
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
  cropCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  supportText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  emptyText: {
    color: '#64748B',
  },
});

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Button from '../components/Button';
import Card from '../components/Card';
import { deleteFarm, getFarmById, getRecommendation } from '../services/api';
import { colors, typography } from '../theme/colors';

function buildFarmPreviewHtml(farm) {
  const center = {
    latitude: farm?.centroid_lat || 20.5937,
    longitude: farm?.centroid_lon || 78.9629,
  };
  const boundaryPoints = Array.isArray(farm?.boundary_points) ? farm.boundary_points : [];
  const polygon = farm?.polygon || null;

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><style>html, body, #map { height: 100%; margin: 0; padding: 0; background: #d8ccb8; } .leaflet-container { font-family: Georgia, serif; } .leaflet-control-container { display: none; }</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>const center = ${JSON.stringify(center)}; const boundaryPoints = ${JSON.stringify(boundaryPoints)}; const polygon = ${JSON.stringify(polygon)}; const map = L.map('map', { zoomControl: false, dragging: false, touchZoom: false, doubleClickZoom: false, scrollWheelZoom: false, boxZoom: false, keyboard: false, tap: false }).setView([center.latitude, center.longitude], 16); L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(map); let layer = null; if (polygon && polygon.type === 'FeatureCollection' && Array.isArray(polygon.features) && polygon.features.length) { layer = L.geoJSON(polygon, { style: { color: '#d8ff73', weight: 3, fillColor: '#5fc966', fillOpacity: 0.22 } }).addTo(map); } else if (polygon && polygon.type === 'Polygon' && Array.isArray(polygon.coordinates)) { layer = L.geoJSON({ type: 'Feature', geometry: polygon }, { style: { color: '#d8ff73', weight: 3, fillColor: '#5fc966', fillOpacity: 0.22 } }).addTo(map); } else if (boundaryPoints.length >= 3) { layer = L.polygon(boundaryPoints.map((point) => [point.latitude, point.longitude]), { color: '#d8ff73', weight: 3, fillColor: '#5fc966', fillOpacity: 0.22 }).addTo(map); } L.circleMarker([center.latitude, center.longitude], { radius: 6, color: '#ffffff', weight: 2, fillColor: '#14361f', fillOpacity: 1 }).addTo(map); if (layer) { map.fitBounds(layer.getBounds(), { padding: [22, 22] }); }</script></body></html>`;
}

export default function FarmDetailsScreen({ navigation, route }) {
  const [farm, setFarm] = useState(route.params?.farm || null);
  const [loading, setLoading] = useState(!route.params?.farm);
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const farmId = route.params?.farmId || route.params?.farm?.id;
    if (!farmId || route.params?.farm) {
      return;
    }

    const loadFarm = async () => {
      try {
        setLoading(true);
        const data = await getFarmById(farmId);
        setFarm(data);
      } catch (loadError) {
        setError(loadError?.response?.data?.detail || 'We could not load this farm.');
      } finally {
        setLoading(false);
      }
    };

    loadFarm();
  }, [route.params]);

  const requestRecommendation = async () => {
    if (!farm) {
      return;
    }

    try {
      setIsRequesting(true);
      setError('');
      const recommendation = await getRecommendation({
        farm_id: farm.id,
        centroid_lat: farm.centroid_lat,
        centroid_lon: farm.centroid_lon,
        polygon: farm.polygon,
      });
      navigation.navigate('RecommendationScreen', { recommendation, farm });
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || 'We could not generate a crop recommendation for this farm.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeleteFarm = () => {
    if (!farm?.id) {
      return;
    }

    Alert.alert(
      'Delete farm',
      'This will remove the saved farm and its linked recommendations. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              setError('');
              await deleteFarm(farm.id);
              navigation.navigate('HistoryTab');
            } catch (deleteError) {
              setError(deleteError?.response?.data?.detail || 'We could not delete this farm.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!farm) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Farm not found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>{farm.name}</Text>
      </View>

      <Card title="Saved farm land" subtitle="">
        <View style={styles.previewWrapper}>
          {Platform.OS === 'web' ? (
            <iframe title="Farm preview" srcDoc={buildFarmPreviewHtml(farm)} style={styles.previewFrame} />
          ) : (
            <WebView
              originWhitelist={['*']}
              source={{ html: buildFarmPreviewHtml(farm) }}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              style={styles.previewFrame}
            />
          )}
        </View>
      </Card>

      <Card title="Farm summary" subtitle="">
        <Text style={styles.infoLine}>Location: {farm.location_label || 'Saved field location'}</Text>
        <Text style={styles.infoLine}>Area: {Number(farm.area_hectares || 0).toFixed(2)} hectares</Text>
        <Text style={styles.infoLine}>Selection mode: {farm.selection_mode}</Text>
        <Text style={styles.infoLine}>Centroid: {Number(farm.centroid_lat).toFixed(5)}, {Number(farm.centroid_lon).toFixed(5)}</Text>
      </Card>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Button title="Get Crop Recommendation" onPress={requestRecommendation} loading={isRequesting} />
      <Button title="Add New Farm" onPress={() => navigation.navigate('MapScreen')} variant="secondary" />
      <Button title="Delete Farm" onPress={handleDeleteFarm} loading={isDeleting} variant="secondary" />
      <Button title="Back To Saved Farms" onPress={() => navigation.navigate('HistoryTab')} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 28, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 24 },
  pageIntro: { borderBottomWidth: 2, borderBottomColor: colors.border, paddingBottom: 14, marginBottom: 10 },
  pageTitle: { ...typography.display, fontSize: 36, lineHeight: 42, color: colors.text },
  previewWrapper: {
    height: 240,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.panel,
  },
  previewFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    backgroundColor: colors.panel,
  },
  infoLine: { ...typography.body, fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: 8 },
  errorText: { ...typography.body, fontSize: 14, lineHeight: 20, color: colors.danger, marginBottom: 10 },
});

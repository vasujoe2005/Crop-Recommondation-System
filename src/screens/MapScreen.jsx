import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import Button from '../components/Button';
import Card from '../components/Card';
import { getRecommendation } from '../services/api';
import {
  binsToFeatureCollection,
  buildPolygonGeoJSON,
  calculateAreaInHectares,
  calculateCentroid,
} from '../utils/geoUtils';

const DEFAULT_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function createMapHtml({ center, mode, mapStyle }) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; background: #dbeafe; }
        .leaflet-container { font-family: sans-serif; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const mode = ${JSON.stringify(mode)};
        const mapStyle = ${JSON.stringify(mapStyle)};
        const center = ${JSON.stringify(center)};
        const map = L.map('map', { zoomControl: true }).setView([center.latitude, center.longitude], 16);

        const streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        });
        const satelliteLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, attribution: 'Tiles &copy; Esri' }
        );
        (mapStyle === 'satellite' ? satelliteLayer : streetLayer).addTo(map);

        L.circleMarker([center.latitude, center.longitude], {
          radius: 7,
          color: '#2563EB',
          fillColor: '#60A5FA',
          fillOpacity: 1
        }).addTo(map);

        let polygonPoints = [];
        let selectedBins = [];
        let polygonLayer = null;
        let centroidMarker = null;
        let pointMarkers = [];
        let binLayers = [];

        function sendState() {
          const flattened = mode === 'polygon'
            ? polygonPoints
            : selectedBins.flatMap((bin) => bin.coordinates);

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'selection',
            polygonPoints,
            selectedBins,
            flattened
          }));
        }

        function clearPointMarkers() {
          pointMarkers.forEach((marker) => map.removeLayer(marker));
          pointMarkers = [];
        }

        function renderPolygon() {
          if (polygonLayer) {
            map.removeLayer(polygonLayer);
            polygonLayer = null;
          }

          clearPointMarkers();

          polygonPoints.forEach((point, index) => {
            const marker = L.marker([point.latitude, point.longitude], { draggable: true })
              .addTo(map)
              .bindTooltip('Point ' + (index + 1));

            marker.on('dragend', (event) => {
              const position = event.target.getLatLng();
              polygonPoints[index] = {
                latitude: position.lat,
                longitude: position.lng
              };
              renderAll();
              sendState();
            });

            pointMarkers.push(marker);
          });

          if (polygonPoints.length >= 3) {
            polygonLayer = L.polygon(
              polygonPoints.map((point) => [point.latitude, point.longitude]),
              { color: '#15803D', fillColor: '#22C55E', fillOpacity: 0.22, weight: 3 }
            ).addTo(map);
          }
        }

        function clearBins() {
          binLayers.forEach(({ layer }) => map.removeLayer(layer));
          binLayers = [];
        }

        function createBins() {
          clearBins();
          const bounds = map.getBounds();
          const south = bounds.getSouth();
          const north = bounds.getNorth();
          const west = bounds.getWest();
          const east = bounds.getEast();
          const latStep = (north - south) / 3;
          const lonStep = (east - west) / 3;

          for (let row = 0; row < 3; row += 1) {
            for (let col = 0; col < 3; col += 1) {
              const minLat = south + row * latStep;
              const minLon = west + col * lonStep;
              const maxLat = minLat + latStep;
              const maxLon = minLon + lonStep;
              const bin = {
                id: row + '-' + col,
                coordinates: [
                  { latitude: minLat, longitude: minLon },
                  { latitude: minLat, longitude: maxLon },
                  { latitude: maxLat, longitude: maxLon },
                  { latitude: maxLat, longitude: minLon }
                ]
              };

              const isSelected = selectedBins.some((selectedBin) => selectedBin.id === bin.id);
              const layer = L.polygon(
                bin.coordinates.map((point) => [point.latitude, point.longitude]),
                {
                  color: isSelected ? '#1D4ED8' : '#94A3B8',
                  fillColor: isSelected ? '#2563EB' : '#94A3B8',
                  fillOpacity: isSelected ? 0.28 : 0.08,
                  weight: isSelected ? 2 : 1
                }
              ).addTo(map);

              layer.on('click', () => toggleBin(bin));
              binLayers.push({ bin, layer });
            }
          }
        }

        function toggleBin(bin) {
          const exists = selectedBins.some((selectedBin) => selectedBin.id === bin.id);
          selectedBins = exists
            ? selectedBins.filter((selectedBin) => selectedBin.id !== bin.id)
            : [...selectedBins, bin];
          createBins();
          renderCentroid(selectedBins.flatMap((item) => item.coordinates));
          sendState();
        }

        function renderCentroid(points) {
          if (centroidMarker) {
            map.removeLayer(centroidMarker);
            centroidMarker = null;
          }
          if (!points.length) {
            return;
          }

          const totals = points.reduce(
            (acc, point) => ({
              latitude: acc.latitude + point.latitude,
              longitude: acc.longitude + point.longitude
            }),
            { latitude: 0, longitude: 0 }
          );

          const centroid = {
            latitude: totals.latitude / points.length,
            longitude: totals.longitude / points.length
          };

          centroidMarker = L.circleMarker([centroid.latitude, centroid.longitude], {
            radius: 6,
            color: '#7C3AED',
            fillColor: '#A78BFA',
            fillOpacity: 1
          }).bindTooltip('Centroid').addTo(map);
        }

        function renderAll() {
          if (mode === 'polygon') {
            clearBins();
            renderPolygon();
            renderCentroid(polygonPoints);
          } else {
            clearPointMarkers();
            if (polygonLayer) {
              map.removeLayer(polygonLayer);
              polygonLayer = null;
            }
            createBins();
            renderCentroid(selectedBins.flatMap((bin) => bin.coordinates));
          }
        }

        map.on('click', (event) => {
          if (mode !== 'polygon') {
            return;
          }
          polygonPoints.push({
            latitude: event.latlng.lat,
            longitude: event.latlng.lng
          });
          renderAll();
          sendState();
        });

        map.on('moveend', () => {
          if (mode === 'bins') {
            selectedBins = [];
            renderAll();
            sendState();
          }
        });

        renderAll();
        sendState();
      </script>
    </body>
  </html>
  `;
}

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [mode, setMode] = useState('polygon');
  const [mapStyle, setMapStyle] = useState('satellite');
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [selectedBins, setSelectedBins] = useState([]);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setIsFetchingLocation(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation(currentLocation.coords);
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        });
      } catch (error) {
        Alert.alert('Location error', 'Unable to fetch current location.');
      } finally {
        setIsFetchingLocation(false);
      }
    };

    requestLocation();
  }, []);

  const activeCoordinates = useMemo(
    () => (mode === 'polygon' ? polygonPoints : selectedBins.flatMap((bin) => bin.coordinates)),
    [mode, polygonPoints, selectedBins],
  );
  const centroid = useMemo(() => calculateCentroid(activeCoordinates), [activeCoordinates]);
  const area = useMemo(() => calculateAreaInHectares(activeCoordinates), [activeCoordinates]);
  const html = useMemo(
    () => createMapHtml({ center: location || region, mode, mapStyle }),
    [location, region, mode, mapStyle, webViewKey],
  );

  const resetMap = () => setWebViewKey((prev) => prev + 1);

  const clearSelection = () => {
    setPolygonPoints([]);
    setSelectedBins([]);
    resetMap();
  };

  const confirmSelection = async () => {
    if (activeCoordinates.length < 3 || !centroid) {
      Alert.alert('Selection incomplete', 'Select at least 3 points or bins before continuing.');
      return;
    }

    const polygon =
      mode === 'polygon'
        ? buildPolygonGeoJSON(polygonPoints)
        : binsToFeatureCollection(selectedBins);

    try {
      setIsSubmitting(true);
      const response = await getRecommendation({
        centroid_lat: centroid.latitude,
        centroid_lon: centroid.longitude,
        polygon,
      });

      navigation.navigate('RecommendationScreen', {
        recommendation: response,
        polygon,
        centroid,
        area,
      });
    } catch (error) {
      Alert.alert('Recommendation failed', 'Unable to prepare the static recommendation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modeSwitch}>
        <Button
          title="Custom Polygon"
          onPress={() => {
            setMode('polygon');
            setPolygonPoints([]);
            setSelectedBins([]);
            resetMap();
          }}
          style={styles.modeButton}
          variant={mode === 'polygon' ? 'primary' : 'secondary'}
        />
        <Button
          title="Grid Bins"
          onPress={() => {
            setMode('bins');
            setPolygonPoints([]);
            setSelectedBins([]);
            resetMap();
          }}
          style={styles.modeButton}
          variant={mode === 'bins' ? 'primary' : 'secondary'}
        />
      </View>

      <View style={styles.modeSwitch}>
        <Button
          title="Satellite View"
          onPress={() => {
            setMapStyle('satellite');
            resetMap();
          }}
          style={styles.modeButton}
          variant={mapStyle === 'satellite' ? 'primary' : 'secondary'}
        />
        <Button
          title="Street View"
          onPress={() => {
            setMapStyle('street');
            resetMap();
          }}
          style={styles.modeButton}
          variant={mapStyle === 'street' ? 'primary' : 'secondary'}
        />
      </View>

      <View style={styles.mapWrapper}>
        {isFetchingLocation ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#2F855A" />
            <Text style={styles.loaderText}>Loading map and current location...</Text>
          </View>
        ) : (
          <>
            <WebView
              key={`${mode}-${mapStyle}-${webViewKey}`}
              originWhitelist={['*']}
              source={{ html }}
              javaScriptEnabled
              domStorageEnabled
              mixedContentMode="compatibility"
              style={styles.webView}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'selection') {
                    setPolygonPoints(data.polygonPoints || []);
                    setSelectedBins(data.selectedBins || []);
                  }
                } catch (error) {}
              }}
            />
            <View style={styles.mapHint}>
              <Text style={styles.mapHintText}>
                {mode === 'polygon'
                  ? 'Tap to add points. Press and drag markers to adjust the boundary.'
                  : 'Tap a grid box to select farm bins.'}
              </Text>
            </View>
          </>
        )}
      </View>

      <Card
        title="Farm Selection"
        subtitle={mode === 'polygon' ? 'Your selected boundary is saved with the recommendation' : 'Selected bins are saved with the recommendation'}
        style={styles.summaryCard}
      >
        <Text style={styles.summaryText}>
          Selected points: {polygonPoints.length} | Selected bins: {selectedBins.length}
        </Text>
        <Text style={styles.summaryText}>Approx. area: {area.toFixed(2)} hectares</Text>
        <Text style={styles.summaryText}>
          Centroid: {centroid ? `${centroid.latitude.toFixed(5)}, ${centroid.longitude.toFixed(5)}` : 'Pending'}
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button title="Clear Selection" onPress={clearSelection} variant="secondary" />
        <Button
          title="Confirm Farm Selection"
          onPress={confirmSelection}
          loading={isSubmitting}
          icon="OK"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F7F0',
  },
  modeSwitch: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  mapWrapper: {
    flex: 1,
    minHeight: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  webView: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#475569',
  },
  mapHint: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mapHintText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryCard: {
    marginTop: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 6,
  },
  actions: {
    marginTop: 4,
  },
});

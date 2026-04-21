import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import Button from '../components/Button';
import Card from '../components/Card';
import { createFarm, searchFarmLocation } from '../services/api';
import { colors, typography } from '../theme/colors';
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
function formatPlaceName(address = {}, fallbackCoordinates) {
  const parts = [
    address.name,
    address.street,
    address.district,
    address.subregion,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ].filter(Boolean);

  if (parts.length) {
    return [...new Set(parts)].slice(0, 3).join(', ');
  }

  if (!fallbackCoordinates) {
    return 'Selected place';
  }

  return `${fallbackCoordinates.latitude.toFixed(5)}, ${fallbackCoordinates.longitude.toFixed(5)}`;
}

function createMapHtml({ center, mode, mapStyle, placeLabel, labelCoordinates }) {
  const isWeb = Platform.OS === 'web';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><style>html, body, #map { height: 100%; margin: 0; padding: 0; background: #d8ccb8; } .leaflet-container { font-family: Georgia, serif; } .leaflet-marker-icon { touch-action: none; } .place-label { background: rgba(24, 21, 17, 0.94); border: 2px solid #f7f1e7; border-radius: 0; box-shadow: none; color: #ffffff; font-size: 12px; font-weight: 700; padding: 6px 10px; } .place-label::before { display: none; }</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>const isWeb = ${isWeb}; const mode = ${JSON.stringify(mode)}; const mapStyle = ${JSON.stringify(mapStyle)}; const center = ${JSON.stringify(center)}; const placeLabel = ${JSON.stringify(placeLabel || 'Selected place')}; const labelCoordinates = ${JSON.stringify(labelCoordinates || center)}; const map = L.map('map', { zoomControl: true }).setView([center.latitude, center.longitude], 16); const streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }); const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' }); const satelliteLabelsLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Labels &copy; Esri' }); if (mapStyle === 'satellite') { satelliteLayer.addTo(map); satelliteLabelsLayer.addTo(map); } else { streetLayer.addTo(map); } L.circleMarker([labelCoordinates.latitude, labelCoordinates.longitude], { radius: 7, color: '#1d1a17', fillColor: '#8c5a32', fillOpacity: 1 }).addTo(map).bindTooltip(placeLabel, { permanent: true, direction: 'top', offset: [0, -10], className: 'place-label' }); let polygonPoints = []; let selectedBins = []; let polygonLayer = null; let centroidMarker = null; let pointMarkers = []; let binLayers = []; function sendState() { const flattened = mode === 'polygon' ? polygonPoints : selectedBins.flatMap((bin) => bin.coordinates); const message = JSON.stringify({ type: 'selection', polygonPoints, selectedBins, flattened }); if (isWeb) { window.parent.postMessage(message, '*'); } else { window.ReactNativeWebView.postMessage(message); } } function clearPointMarkers() { pointMarkers.forEach((marker) => map.removeLayer(marker)); pointMarkers = []; } function renderPolygon() { if (polygonLayer) { map.removeLayer(polygonLayer); polygonLayer = null; } clearPointMarkers(); polygonPoints.forEach((point, index) => { const marker = L.marker([point.latitude, point.longitude], { draggable: true }).addTo(map).bindTooltip('Point ' + (index + 1)); marker.on('dragstart', () => { map.dragging.disable(); }); marker.on('dragend', (event) => { const position = event.target.getLatLng(); polygonPoints[index] = { latitude: position.lat, longitude: position.lng }; map.dragging.enable(); renderAll(); sendState(); }); pointMarkers.push(marker); }); if (polygonPoints.length >= 3) { polygonLayer = L.polygon(polygonPoints.map((point) => [point.latitude, point.longitude]), { color: '#304b38', fillColor: '#8bb096', fillOpacity: 0.24, weight: 3 }).addTo(map); } } function clearBins() { binLayers.forEach(({ layer }) => map.removeLayer(layer)); binLayers = []; } function createBins() { clearBins(); const bounds = map.getBounds(); const south = bounds.getSouth(); const north = bounds.getNorth(); const west = bounds.getWest(); const east = bounds.getEast(); const latStep = (north - south) / 3; const lonStep = (east - west) / 3; for (let row = 0; row < 3; row += 1) { for (let col = 0; col < 3; col += 1) { const minLat = south + row * latStep; const minLon = west + col * lonStep; const maxLat = minLat + latStep; const maxLon = minLon + lonStep; const bin = { id: row + '-' + col, coordinates: [{ latitude: minLat, longitude: minLon }, { latitude: minLat, longitude: maxLon }, { latitude: maxLat, longitude: maxLon }, { latitude: maxLat, longitude: minLon }] }; const isSelected = selectedBins.some((selectedBin) => selectedBin.id === bin.id); const layer = L.polygon(bin.coordinates.map((point) => [point.latitude, point.longitude]), { color: isSelected ? '#1c2e22' : '#7b6d5d', fillColor: isSelected ? '#8c5a32' : '#d7c4a9', fillOpacity: isSelected ? 0.3 : 0.1, weight: isSelected ? 2 : 1 }).addTo(map); layer.on('click', () => toggleBin(bin)); binLayers.push({ bin, layer }); } } } function toggleBin(bin) { const exists = selectedBins.some((selectedBin) => selectedBin.id === bin.id); selectedBins = exists ? selectedBins.filter((selectedBin) => selectedBin.id !== bin.id) : [...selectedBins, bin]; createBins(); renderCentroid(selectedBins.flatMap((item) => item.coordinates)); sendState(); } function renderCentroid(points) { if (centroidMarker) { map.removeLayer(centroidMarker); centroidMarker = null; } if (!points.length) { return; } const totals = points.reduce((acc, point) => ({ latitude: acc.latitude + point.latitude, longitude: acc.longitude + point.longitude }), { latitude: 0, longitude: 0 }); const centroid = { latitude: totals.latitude / points.length, longitude: totals.longitude / points.length }; centroidMarker = L.circleMarker([centroid.latitude, centroid.longitude], { radius: 6, color: '#1d1a17', fillColor: '#304b38', fillOpacity: 1 }).bindTooltip('Centroid').addTo(map); } function renderAll() { if (mode === 'polygon') { clearBins(); renderPolygon(); renderCentroid(polygonPoints); } else { clearPointMarkers(); if (polygonLayer) { map.removeLayer(polygonLayer); polygonLayer = null; } createBins(); renderCentroid(selectedBins.flatMap((bin) => bin.coordinates)); } } map.on('click', (event) => { if (mode !== 'polygon') { return; } polygonPoints.push({ latitude: event.latlng.lat, longitude: event.latlng.lng }); renderAll(); sendState(); }); map.on('moveend', () => { if (mode === 'bins') { selectedBins = []; renderAll(); sendState(); } }); renderAll(); sendState();</script></body></html>`;
}

export default function MapScreen({ navigation }) {
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [mode, setMode] = useState('polygon');
  const [mapStyle, setMapStyle] = useState('satellite');
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [selectedBins, setSelectedBins] = useState([]);
  const [isLocatingLive, setIsLocatingLive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const [placeName, setPlaceName] = useState('Search for a city, village, or address');
  const [searchQuery, setSearchQuery] = useState('');
  const [farmName, setFarmName] = useState('');
  const [isMapInteracting, setIsMapInteracting] = useState(false);

  const handleMapMessage = (data) => {
    try {
      const payload = JSON.parse(data);
      if (payload.type === 'selection') {
        setPolygonPoints(payload.polygonPoints || []);
        setSelectedBins(payload.selectedBins || []);
      }
    } catch {
      return null;
    }

    return null;
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return undefined;
    }

    const onMessageHandler = (event) => handleMapMessage(event.data);
    window.addEventListener('message', onMessageHandler);

    return () => window.removeEventListener('message', onMessageHandler);
  }, []);

  const activeCoordinates = useMemo(
    () => (mode === 'polygon' ? polygonPoints : selectedBins.flatMap((bin) => bin.coordinates)),
    [mode, polygonPoints, selectedBins],
  );
  const centroid = useMemo(() => calculateCentroid(activeCoordinates), [activeCoordinates]);
  const area = useMemo(() => calculateAreaInHectares(activeCoordinates), [activeCoordinates]);

  const html = useMemo(
    () => createMapHtml({ center: region, mode, mapStyle, placeLabel: placeName, labelCoordinates: region }),
    [region, mode, mapStyle, placeName, webViewKey],
  );

  const resetMap = () => setWebViewKey((prev) => prev + 1);

  const updateMapRegion = (coords, label, delta = 0.015) => {
    setRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    });
    setPlaceName(label || formatPlaceName({}, coords));
    resetMap();
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      Alert.alert('Search required', 'Enter a city, village, or address before searching.');
      return;
    }

    try {
      setIsSearching(true);
      let match = null;

      try {
        match = await searchFarmLocation(query);
      } catch {
        match = null;
      }

      if (!match) {
        try {
          const results = await Location.geocodeAsync(query);
          const localMatch = results?.[0];
          if (localMatch) {
            match = {
              latitude: localMatch.latitude,
              longitude: localMatch.longitude,
              label: query,
            };
          }
        } catch {
          match = null;
        }
      }

      if (!match) {
        Alert.alert('Place not found', 'We could not find a matching place for that search.');
        return;
      }

      updateMapRegion({ latitude: match.latitude, longitude: match.longitude }, match.label || query, 0.02);
    } catch {
      Alert.alert('Search failed', 'The app could not search for that address right now. Check internet and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const goToLiveLocation = async () => {
    try {
      setIsLocatingLive(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to use your live position.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      let label = 'Live location';
      try {
        const [address] = await Location.reverseGeocodeAsync(coords);
        label = formatPlaceName(address, coords);
      } catch {
        label = formatPlaceName({}, coords);
      }

      updateMapRegion(coords, label, 0.015);
    } catch {
      Alert.alert('Location error', 'The app could not fetch the current location.');
    } finally {
      setIsLocatingLive(false);
    }
  };

  const clearSelection = () => {
    setPolygonPoints([]);
    setSelectedBins([]);
    resetMap();
  };

  const confirmSelection = async () => {
    if (!farmName.trim()) {
      Alert.alert('Farm name required', 'Enter a name for this farm before saving it.');
      return;
    }

    if (activeCoordinates.length < 3 || !centroid) {
      Alert.alert('Selection incomplete', 'Please select at least 3 points or bins before continuing.');
      return;
    }

    const polygon = mode === 'polygon' ? buildPolygonGeoJSON(polygonPoints) : binsToFeatureCollection(selectedBins);

    try {
      setIsSubmitting(true);
      const farm = await createFarm({
        name: farmName.trim(),
        location_label: placeName,
        centroid_lat: centroid.latitude,
        centroid_lon: centroid.longitude,
        area_hectares: area,
        selection_mode: mode,
        polygon,
        boundary_points: activeCoordinates,
      });

      navigation.replace('FarmDetailsScreen', { farm });
    } catch (error) {
      Alert.alert('Save failed', error?.response?.data?.detail || 'We could not save this farm right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <iframe
          title="Leaflet Map"
          srcDoc={html}
          style={styles.webView}
          onMouseEnter={() => setIsMapInteracting(true)}
          onMouseLeave={() => setIsMapInteracting(false)}
        />
      );
    }

    return (
      <WebView
        key={`${mode}-${mapStyle}-${webViewKey}`}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="compatibility"
        style={styles.webView}
        nestedScrollEnabled
        onTouchStart={() => setIsMapInteracting(true)}
        onTouchEnd={() => setIsMapInteracting(false)}
        onTouchCancel={() => setIsMapInteracting(false)}
        onMessage={(event) => handleMapMessage(event.nativeEvent.data)}
      />
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!isMapInteracting}
    >
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Mark and save a farm.</Text>
        {/* <Text style={styles.pageSubtitle}>
          Search the place, move to your live location if needed, then drag the boundary points until the field shape looks right. Save it under the farmer profile with a clear name.
        </Text> */}
      </View>

      <Card title="Farm identity" subtitle="">
        <TextInput
          value={farmName}
          onChangeText={setFarmName}
          placeholder="Example: North Field"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </Card>

      <Card title="Find the place" subtitle="">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search city, village, or address"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <View style={styles.buttonRow}>
          <Button title="Search" onPress={handleSearch} loading={isSearching} style={styles.rowButton} />
          <Button
            title="Use Live Location"
            onPress={goToLiveLocation}
            loading={isLocatingLive}
            variant="secondary"
            style={styles.rowButton}
          />
        </View>
      </Card>

      <Card title="Choose the selection method" subtitle="">
        <View style={styles.buttonRow}>
          <Button title="Polygon" onPress={() => { setMode('polygon'); setPolygonPoints([]); setSelectedBins([]); resetMap(); }} style={styles.rowButton} variant={mode === 'polygon' ? 'primary' : 'secondary'} />
          <Button title="Grid Bins" onPress={() => { setMode('bins'); setPolygonPoints([]); setSelectedBins([]); resetMap(); }} style={styles.rowButton} variant={mode === 'bins' ? 'primary' : 'secondary'} />
        </View>
        <View style={styles.buttonRow}>
          <Button title="Satellite" onPress={() => { setMapStyle('satellite'); resetMap(); }} style={styles.rowButton} variant={mapStyle === 'satellite' ? 'primary' : 'secondary'} />
          <Button title="Street" onPress={() => { setMapStyle('street'); resetMap(); }} style={styles.rowButton} variant={mapStyle === 'street' ? 'primary' : 'secondary'} />
        </View>
      </Card>

      <View style={styles.mapWrapper} onTouchStart={() => setIsMapInteracting(true)} onTouchEnd={() => setIsMapInteracting(false)} onTouchCancel={() => setIsMapInteracting(false)}>
        {isLocatingLive || isSearching ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>{isSearching ? 'Looking up the place...' : 'Fetching your location...'}</Text>
          </View>
        ) : (
          <>
            {renderMap()}
            <View style={styles.mapHint}>
              <Text style={styles.mapHintLabel}>{placeName}</Text>
              <Text style={styles.mapHintText}>
                {mode === 'polygon' ? 'Tap to add pins and drag them to match the farm boundary.' : 'Tap one or more grid boxes to build the field area.'}
              </Text>
            </View>
          </>
        )}
      </View>

      <Card title="Selection summary" subtitle="">
        <Text style={styles.summaryText}>Selection mode: {mode === 'polygon' ? 'Polygon boundary' : 'Grid bins'}</Text>
        <Text style={styles.summaryText}>Selected points: {polygonPoints.length}</Text>
        <Text style={styles.summaryText}>Selected bins: {selectedBins.length}</Text>
        <Text style={styles.summaryText}>Estimated area: {area.toFixed(2)} hectares</Text>
        <Text style={styles.summaryText}>Centroid: {centroid ? `${centroid.latitude.toFixed(5)}, ${centroid.longitude.toFixed(5)}` : 'Not ready yet'}</Text>
      </Card>

      <View style={styles.buttonRow}>
        <Button title="Clear Selection" onPress={clearSelection} variant="secondary" style={styles.rowButton} />
        <Button title="Save Farm" onPress={confirmSelection} loading={isSubmitting} style={styles.rowButton} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: 16, paddingBottom: 28, backgroundColor: colors.background },
  pageIntro: { borderBottomWidth: 2, borderBottomColor: colors.border, paddingBottom: 14, marginBottom: 12 },
  pageTitle: { ...typography.display, fontSize: 34, lineHeight: 40, color: colors.text },
  pageSubtitle: { ...typography.body, marginTop: 10, fontSize: 15, lineHeight: 22, color: colors.textMuted },
  searchInput: { ...typography.body, minHeight: 54, borderWidth: 2, borderColor: colors.border, backgroundColor: '#FBF7F0', paddingHorizontal: 14, fontSize: 16, color: colors.text, marginBottom: 10 },
  buttonRow: { flexDirection: 'row' },
  rowButton: { flex: 1, marginHorizontal: 4 },
  mapWrapper: { height: 380, minHeight: 340, borderWidth: 2, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.panel, marginTop: 6 },
  webView: { flex: 1, backgroundColor: colors.panel, borderWidth: 0 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loaderText: { ...typography.body, marginTop: 10, color: colors.textMuted },
  mapHint: { position: 'absolute', left: 10, right: 10, top: 10, backgroundColor: 'rgba(24, 21, 17, 0.85)', borderWidth: 2, borderColor: colors.textOnDark, paddingHorizontal: 12, paddingVertical: 10 },
  mapHintLabel: { ...typography.body, color: colors.textOnDark, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  mapHintText: { ...typography.body, marginTop: 4, color: colors.textOnDark, fontSize: 13, lineHeight: 20 },
  summaryText: { ...typography.body, fontSize: 14, color: colors.text, marginBottom: 7, lineHeight: 20 },
});

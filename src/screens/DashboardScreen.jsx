import React, { useContext } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import AuthContext from '../context/AuthContext';
import { colors } from '../theme/colors';

function ActionStrip({ value, label }) {
  return (
    <View style={styles.stripItem}>
      <Text style={styles.stripValue}>{value}</Text>
      <Text style={styles.stripLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.overline}>GeoSpatial Crop AI</Text>
        <Text style={styles.title}>Welcome, {user?.name || 'Farmer'}</Text>
        <Text style={styles.subtitle}>
          Mark a field, send its latitude and longitude to the backend, retrieve live soil and climate data,
          and compare the land conditions against the crop dataset.
        </Text>

        <View style={styles.strip}>
          <ActionStrip value="Lat/Lon" label="Location input" />
          <ActionStrip value="Live" label="Soil + weather" />
          <ActionStrip value="Save" label="History ready" />
        </View>
      </View>

      <Card title="Quick Actions" subtitle="Designed for faster use in the field" accent={colors.accent}>
        <Button title="Select Farm Land" onPress={() => navigation.navigate('MapScreen')} />
        <Button
          title="View Recommendation History"
          onPress={() => navigation.navigate('HistoryTab')}
          variant="secondary"
        />
        <Button title="Get Crop Recommendation" onPress={() => navigation.navigate('MapScreen')} />
      </Card>

      <Card title="Workflow" subtitle="Matches your flow diagram">
        <Text style={styles.step}>1. Capture field location using a polygon or grid-based boundary.</Text>
        <Text style={styles.step}>2. Send the centroid to the backend for soil and environmental data extraction.</Text>
        <Text style={styles.step}>3. Score crops using pH, nutrient proxies, rainfall, humidity, temperature, and texture.</Text>
        <Text style={styles.step}>4. Show the top crop matches with fertility, fertilizer, and irrigation advice.</Text>
      </Card>

      <Card title="Live Data Sources" subtitle="Current integration status">
        <Text style={styles.noteText}>ISRIC SoilGrids is used for soil pH, organic carbon, CEC, texture, and nutrient proxy inputs.</Text>
        <Text style={styles.noteText}>Open-Meteo is used for rainfall, humidity, air temperature, soil moisture, and surface soil temperature.</Text>
        <Text style={styles.noteText}>Google Earth Engine and MODIS or Sentinel NDVI are prepared as an extension point and can be enabled once you share the required credentials.</Text>
      </Card>

      <Button title="Logout" onPress={signOut} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: 30,
    padding: 24,
    marginBottom: 12,
  },
  overline: {
    color: '#D2E6D6',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 8,
    fontSize: 31,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    color: '#DCE8DE',
    lineHeight: 22,
  },
  strip: {
    flexDirection: 'row',
    marginTop: 20,
  },
  stripItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  stripValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stripLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#D8E6DA',
  },
  step: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
    lineHeight: 21,
  },
  noteText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
});

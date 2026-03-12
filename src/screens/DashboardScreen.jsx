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
        <Text style={styles.overline}>Farm Workspace</Text>
        <Text style={styles.title}>Welcome, {user?.name || 'Farmer'}</Text>
        <Text style={styles.subtitle}>
          Review land selections, generate crop guidance, and keep each field record organized in one place.
        </Text>

        <View style={styles.strip}>
          <ActionStrip value="Map" label="Land selection" />
          {/* <ActionStrip value="10" label="Static crops" /> */}
          <ActionStrip value="Save" label="History ready" />
        </View>
      </View>

      <Card title="Quick Actions" subtitle="Designed for faster use in the field" accent={colors.accent}>
        <Button title="Select Farm Land" onPress={() => navigation.navigate('MapScreen')}  />
        <Button
          title="View Recommendation History"
          onPress={() => navigation.navigate('HistoryTab')}
          variant="secondary" 
        />
        <Button
          title="Get Crop Recommendation"
          onPress={() => navigation.navigate('MapScreen')}
        />
      </Card>

      <Card title="Workflow" subtitle="Simple and repeatable">
        <Text style={styles.step}>1. Mark your land using polygon points or grid bins.</Text>
        <Text style={styles.step}>2. Save the selected farm boundary for the current field.</Text>
        <Text style={styles.step}>3. Review the generated crop list and advisory details.</Text>
      </Card>

      <Card title="Field Notes" subtitle="Current build mode">
        <Text style={styles.noteText}>
          Recommendations are currently generated from a static dataset so the frontend can be demonstrated cleanly without depending on live backend scoring.
        </Text>
      </Card>

      <Button title="Logout" onPress={signOut} variant="secondary"  />
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
  },
});

import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BrandHeader from '../components/BrandHeader';
import Button from '../components/Button';
import AuthContext from '../context/AuthContext';
import { getFarms } from '../services/api';
import { APP_NAME } from '../theme/brand';
import { colors, typography } from '../theme/colors';

const NEWS_ITEMS = [
  {
    title: 'Plan irrigation around the next dry window',
    summary: ``,
  },
  {
    title: 'Keep one field note for each saved farm',
    summary: ``,
  },
  {
    title: 'Use field history before changing crops',
    summary: '',
  },
];

const QUICK_ACTIONS = [
  { key: 'map', title: 'Mark Farm', subtitle: 'Save a new boundary', route: 'MapScreen' },
  { key: 'history', title: 'History', subtitle: 'Open saved recommendations', route: 'HistoryTab' },
  { key: 'reports', title: 'Recent Reports', subtitle: 'Review past crop matches', route: 'HistoryTab' },
  { key: 'help', title: 'Next Steps', subtitle: 'Open crop guidance after selection', route: 'HistoryTab' },
];

function QuickAction({ item, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed ? styles.quickActionPressed : null]}>
      <Text style={styles.quickActionTitle}>{item.title}</Text>
      <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
    </Pressable>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const items = await getFarms();
      setFarms(items);
    } catch {
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFarms();
    }, []),
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* <BrandHeader compact style={styles.brandBlock} /> */}

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{APP_NAME} home</Text>
        <Text style={styles.title}>Welcome {user?.name || 'Farmer'} </Text>
        {/* <Text style={styles.subtitle}>
          Start by marking a farm in {APP_NAME}, or reopen an existing one and ask for a fresh crop recommendation whenever you need it.
        </Text> */}
      </View>

      <View style={styles.quickGrid}>
        {QUICK_ACTIONS.map((item) => (
          <QuickAction key={item.key} item={item} onPress={() => navigation.navigate(item.route)} />
        ))}
      </View>
{/* 
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent farmer notes</Text> 
        <Text style={styles.sectionSubtitle}>{APP_NAME} keeps this home feed focused on practical field decisions.</Text> 
      </View>
      {NEWS_ITEMS.map((item) => (
        <View key={item.title} style={styles.newsCard}>
          <Text style={styles.newsTitle}>{item.title}</Text>
          <Text style={styles.newsSummary}>{item.summary}</Text>
        </View>
      ))} */}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Saved farms</Text>
          {/* <Text style={styles.sectionSubtitle}>Your latest land records stay attached to your {APP_NAME} profile.</Text> */}
      </View>
      {loading ? (
        <View style={styles.loadingBox}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : farms.length ? (
        farms.slice(0, 3).map((farm) => (
          <Pressable key={farm.id} onPress={() => navigation.navigate('FarmDetailsScreen', { farm })} style={({ pressed }) => [styles.farmCard, pressed ? styles.quickActionPressed : null]}>
            <Text style={styles.farmName}>{farm.name}</Text>
            <Text style={styles.farmMeta}>{farm.location_label || 'Saved field location'}</Text>
            <Text style={styles.farmMeta}>Area {Number(farm.area_hectares || 0).toFixed(2)} hectares</Text>
          </Pressable>
        ))
      ) : (
        <View style={styles.emptyCard}><Text style={styles.emptyText}>No farms have been saved yet. Mark a field on the map in {APP_NAME} to create your first record.</Text></View>
      )}

      <Button title="Open Recommendation History" onPress={() => navigation.navigate('HistoryTab')} />
      <Button title="Sign Out" onPress={signOut} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 30, backgroundColor: colors.background },
  brandBlock: { marginBottom: 14 },
  hero: { backgroundColor: colors.primaryDark, borderWidth: 2, borderColor: colors.border, padding: 20, marginBottom: 16 },
  eyebrow: { ...typography.body, color: colors.accentSoft, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { ...typography.display, marginTop: 10, fontSize: 32, lineHeight: 38, color: colors.textOnDark },
  subtitle: { ...typography.body, marginTop: 12, fontSize: 16, lineHeight: 24, color: '#E6DED0' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  quickAction: { width: '48.2%', borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, padding: 14, marginBottom: 12 },
  quickActionPressed: { opacity: 0.9 },
  quickActionTitle: { ...typography.body, fontSize: 15, fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.6 },
  quickActionSubtitle: { ...typography.body, marginTop: 8, fontSize: 13, lineHeight: 19, color: colors.textMuted },
  sectionHeader: { borderBottomWidth: 2, borderBottomColor: colors.border, paddingBottom: 10, marginTop: 6, marginBottom: 12 },
  sectionTitle: { ...typography.display, fontSize: 28, lineHeight: 32, color: colors.text },
  sectionSubtitle: { ...typography.body, marginTop: 6, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  newsCard: { borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, marginBottom: 12 },
  newsTitle: { ...typography.display, fontSize: 24, lineHeight: 28, color: colors.text },
  newsSummary: { ...typography.body, marginTop: 8, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  loadingBox: { borderWidth: 2, borderColor: colors.border, paddingVertical: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, marginBottom: 12 },
  farmCard: { borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, marginBottom: 12 },
  farmName: { ...typography.display, fontSize: 24, lineHeight: 28, color: colors.text },
  farmMeta: { ...typography.body, marginTop: 6, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  emptyCard: { borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, marginBottom: 12 },
  emptyText: { ...typography.body, fontSize: 14, lineHeight: 21, color: colors.textMuted },
});

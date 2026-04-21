import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getHistory } from '../services/api';
import { colors, typography } from '../theme/colors';

function HistoryItem({ item, onPress }) {
  const crops = (item.top_crops || item.recommended_crops || []).slice(0, 3).map((crop) => crop.name || crop.crop).join(', ');
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}>
      <Text style={styles.cardTitle}>{item.farm_name || 'Farm recommendation'}</Text>
      <Text style={styles.cardMeta}>{new Date(item.created_at || Date.now()).toLocaleString()}</Text>
      <Text style={styles.cardMeta}>Soil pH {item?.soil_data?.ph ?? '--'} | Temp {item?.climate_data?.temp ?? '--'} C</Text>
      <Text style={styles.cardMeta}>Top crops: {crops || 'Not available'}</Text>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const items = await getHistory();
      setHistory(items);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.detail || 'We could not load the recommendation history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={history}
      keyExtractor={(item, index) => item.id || `${index}`}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchHistory(true)} tintColor={colors.primary} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Recommendation history</Text>
          {/* <Text style={styles.subtitle}>Every recommendation is now stored with its farm, so the farmer can reopen any past result later.</Text> */}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No recommendation history yet.</Text>}
      renderItem={({ item }) => (
        <HistoryItem item={item} onPress={() => navigation.navigate('RecommendationScreen', { item, farm: item.farm_id ? { id: item.farm_id, name: item.farm_name } : null })} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, paddingBottom: 28, backgroundColor: colors.background },
  header: { marginBottom: 10, borderBottomWidth: 2, borderBottomColor: colors.border, paddingBottom: 12 },
  title: { ...typography.display, fontSize: 34, lineHeight: 40, color: colors.text },
  subtitle: { ...typography.body, marginTop: 8, color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  error: { ...typography.body, marginTop: 8, color: colors.danger, fontSize: 13 },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 30, fontSize: 15 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  card: { borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, marginBottom: 12 },
  pressed: { opacity: 0.92 },
  cardTitle: { ...typography.display, fontSize: 24, lineHeight: 28, color: colors.text },
  cardMeta: { ...typography.body, fontSize: 14, lineHeight: 20, color: colors.textMuted, marginTop: 6 },
});

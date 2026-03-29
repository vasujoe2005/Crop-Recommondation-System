import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Card from '../components/Card';
import { getHistory } from '../services/api';

function HistoryItem({ item, onPress }) {
  const soil = item?.soil_data || {};
  const climate = item?.climate_data || {};

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card
        title={item.farm_name || 'Farm Record'}
        subtitle={new Date(item.created_at || Date.now()).toLocaleString()}
      >
        <Text style={styles.itemText}>Soil pH: {soil?.ph ?? '--'}</Text>
        <Text style={styles.itemText}>
          Temperature: {climate?.temp ?? '--'}
          {climate?.temp !== undefined && climate?.temp !== null ? ' C' : ''}
        </Text>
        <Text style={styles.itemText}>
          Rainfall: {climate?.rainfall ?? '--'}
          {climate?.rainfall !== undefined && climate?.rainfall !== null ? ' mm' : ''}
        </Text>
        <Text style={styles.itemText}>Texture: {soil?.texture || '--'}</Text>
        <Text style={styles.itemText}>
          Crops: {(item.top_crops || item.recommended_crops || [])
            .slice(0, 4)
            .map((crop) => crop.name || crop.crop)
            .join(', ') || 'N/A'}
        </Text>
      </Card>
    </TouchableOpacity>
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
      const data = await getHistory();
      setHistory(Array.isArray(data) ? data : data?.items || []);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.detail || 'Unable to load history.');
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
        <ActivityIndicator size="large" color="#2F855A" />
      </View>
    );
  }

  return (
    <FlatList
      data={history}
      keyExtractor={(item, index) => item.id || item._id || `${index}`}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchHistory(true)} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Recommendation History</Text>
          <Text style={styles.subtitle}>
            Saved farm selections and generated recommendations appear here.
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No recommendation history available.</Text>}
      renderItem={({ item }) => (
        <HistoryItem item={item} onPress={() => navigation.navigate('RecommendationScreen', { item })} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    marginTop: 8,
    color: '#475569',
    fontSize: 15,
  },
  error: {
    marginTop: 8,
    color: '#DC2626',
  },
  empty: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 6,
  },
});

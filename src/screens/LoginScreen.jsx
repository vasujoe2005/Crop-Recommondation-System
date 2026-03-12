import React, { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import InputField from '../components/InputField';
import AuthContext from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signIn(form);
    } catch (loginError) {
      setError(loginError?.response?.data?.detail || 'Unable to sign in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* <View style={styles.heroPanel}>
          <Text style={styles.badge}>Precision Farming Suite</Text>
          <Text style={styles.title}>Plan crops with clearer field intelligence</Text>
          <Text style={styles.subtitle}>
            Secure access to farm mapping, saved land selections, and crop guidance built for day-to-day use.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>10+</Text>
              <Text style={styles.statLabel}>Crop options</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>Fast</Text>
              <Text style={styles.statLabel}>Offline preview</Text>
            </View>
          </View>
        </View> */}

        <Card title="Farmer Login" subtitle="Use your registered email and password">
          <InputField
            label="Email"
            value={form.email}
            onChangeText={(email) => setForm((prev) => ({ ...prev, email }))}
            placeholder="farmer@example.com"
            keyboardType="email-address"
          />
          <InputField
            label="Password"
            value={form.password}
            onChangeText={(password) => setForm((prev) => ({ ...prev, password }))}
            placeholder="Enter your password"
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Login" onPress={handleLogin} loading={loading}  />
          <Button title="Create Account" onPress={() => navigation.navigate('Register')} variant="secondary" />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  heroPanel: {
    backgroundColor: colors.primaryDark,
    borderRadius: 30,
    padding: 24,
    marginBottom: 18,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    color: '#F3F7F2',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 31,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 37,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    color: '#DDE9DF',
    lineHeight: 23,
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: 20,
  },
  statChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: '#D5E5D8',
    marginTop: 2,
    fontSize: 12,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '600',
  },
});

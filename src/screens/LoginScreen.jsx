import React, { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import InputField from '../components/InputField';
import AuthContext from '../context/AuthContext';
import { colors, typography } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signIn(form);
    } catch (loginError) {
      setError(loginError?.response?.data?.detail || 'We could not sign you in with those details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <View style={styles.screen}>
        <Image source={require('../../assets/geocrop-ai-logo.png')} style={styles.logo} resizeMode="contain" />

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.formWrap}>
            <Card title="Sign in" subtitle="">
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
                masked
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button title="Sign In" onPress={handleLogin} loading={loading} />
              <Button title="Create Account" onPress={() => navigation.navigate('Register')} variant="secondary" />
            </Card>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
  logo: {
    position: 'absolute',
    top: 28,
    left: 0,
    right: 0,
    zIndex: 1,
    alignSelf: 'center',
    width: 420,
    height: 320,
  },
  container: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  formWrap: {
    width: '100%',
  },
  error: { ...typography.body, color: colors.danger, marginBottom: 12, fontSize: 13, lineHeight: 19 },
});

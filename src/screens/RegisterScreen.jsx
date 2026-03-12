import React, { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import InputField from '../components/InputField';
import AuthContext from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!form.name || !form.email || !form.phone || !form.password) return 'All fields are required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await signUp(form);
      setSuccess('Account created successfully. Please login.');
      setTimeout(() => navigation.navigate('Login'), 800);
    } catch (registerError) {
      setError(registerError?.response?.data?.detail || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroRow}>
          <Text style={styles.overline}>Create Farmer Account</Text>
          {/* <Text style={styles.heroText}>Set up a clean workspace for farm mapping and recommendation history.</Text> */}
        </View>

        <Card title="Registration" subtitle="Enter your farmer details to get started">
          <InputField
            label="Name"
            value={form.name}
            onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
            placeholder="Farmer name"
            autoCapitalize="words"
          />
          <InputField
            label="Email"
            value={form.email}
            onChangeText={(email) => setForm((prev) => ({ ...prev, email }))}
            placeholder="farmer@example.com"
            keyboardType="email-address"
          />
          <InputField
            label="Phone Number"
            value={form.phone}
            onChangeText={(phone) => setForm((prev) => ({ ...prev, phone }))}
            placeholder="+91 9876543210"
            keyboardType="phone-pad"
          />
          <InputField
            label="Password"
            value={form.password}
            onChangeText={(password) => setForm((prev) => ({ ...prev, password }))}
            placeholder="Create a password"
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}
          <Button title="Register" onPress={handleRegister} loading={loading}  />
          <Button title="Back to Login" onPress={() => navigation.goBack()} variant="secondary" />
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
  heroRow: {
    marginBottom: 16,
  },
  overline: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  heroText: {
    marginTop: 10,
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '900',
    color: colors.text,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  success: {
    color: colors.success,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '700',
  },
});

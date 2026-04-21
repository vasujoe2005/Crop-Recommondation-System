import React, { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import InputField from '../components/InputField';
import AuthContext from '../context/AuthContext';
import { APP_NAME } from '../theme/brand';
import { colors, typography } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!form.name || !form.email || !form.phone || !form.password) return 'Please complete every field before continuing.';
    if (form.password.length < 6) return 'Choose a password with at least 6 characters.';
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
      setSuccess(`Your ${APP_NAME} account is ready. You can sign in now.`);
      setTimeout(() => navigation.navigate('Login'), 800);
    } catch (registerError) {
      setError(registerError?.response?.data?.detail || 'We could not create the account right now.');
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
            <Card title="Create account" subtitle="">
              <InputField label="Name" value={form.name} onChangeText={(name) => setForm((prev) => ({ ...prev, name }))} placeholder="Farmer name" autoCapitalize="words" />
              <InputField label="Email" value={form.email} onChangeText={(email) => setForm((prev) => ({ ...prev, email }))} placeholder="farmer@example.com" keyboardType="email-address" />
              <InputField label="Phone number" value={form.phone} onChangeText={(phone) => setForm((prev) => ({ ...prev, phone }))} placeholder="+91 9876543210" keyboardType="phone-pad" />
              <InputField label="Password" value={form.password} onChangeText={(password) => setForm((prev) => ({ ...prev, password }))} placeholder="Create a password" masked />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {success ? <Text style={styles.success}>{success}</Text> : null}
              <Button title="Create Account" onPress={handleRegister} loading={loading} />
              <Button title="Back To Sign In" onPress={() => navigation.goBack()} variant="secondary" />
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
    right: 20,
    zIndex: 1,
    alignSelf: 'center',
    width: 420,
    height: 320,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
    paddingTop: 220,
  },
  formWrap: {
    width: '100%',
  },
  error: { ...typography.body, color: colors.danger, marginBottom: 12, fontSize: 13, lineHeight: 19 },
  success: { ...typography.body, color: colors.success, marginBottom: 12, fontSize: 13, lineHeight: 19 },
});

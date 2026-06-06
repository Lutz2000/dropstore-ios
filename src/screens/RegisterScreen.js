import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

const COUNTRIES = ['Uganda','Kenya','Tanzania','Rwanda','Burundi','South Sudan','DR Congo'];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [role, setRole]   = useState('buyer');
  const [form, setForm]   = useState({
    name: '', phone: '', email: '', gender: 'male',
    age: '', country: 'Uganda', password: '', password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    setErrors({});
    setLoading(true);
    try {
      await register({ ...form, role });
      // Don't manually navigate — AppNavigator will reactively update based on user state
      // This avoids race conditions where the component redirects before AuthContext updates
    } catch (e) {
      if (e?.response?.status === 422) {
        if (e.response.data.redirect === 'subscription_packages') {
          Alert.alert(
            'Free Account Already Used',
            e.response.data.message || 'A free vendor account has already been created from this device. Please log in to your existing account.',
            [{ text: 'OK' }]
          );
        } else {
          setErrors(e.response.data.errors || {});
        }
      } else {
        Alert.alert('Error', e?.response?.data?.message || 'Registration failed.');
      }
    } finally { setLoading(false); }
  };

  const err = (k) => errors[k] ? <Text style={styles.error}>{errors[k][0]}</Text> : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.sub}>Join DropStore today</Text>

        {/* Role Tabs */}
        <View style={styles.tabs}>
          {['buyer','vendor'].map(r => (
            <TouchableOpacity key={r} style={[styles.tab, role === r && styles.tabActive]} onPress={() => setRole(r)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <MaterialCommunityIcons name={r === 'buyer' ? 'shopping-cart' : 'store'} size={18} color={role === r ? '#fff' : COLORS.primary} />
                <Text style={[styles.tabText, role === r && styles.tabTextActive]}>
                  {r === 'buyer' ? 'Buyer' : 'Vendor'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {[
          ['name',  'Full Name',     'default', false],
          ['phone', 'Phone Number',  'phone-pad', false],
          ['email', 'Email',         'email-address', false],
          ['age',   'Age',           'numeric', false],
          ['password',              'Password',         'default', true],
          ['password_confirmation', 'Confirm Password', 'default', true],
        ].map(([key, label, type, secure]) => (
          <View key={key}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={form[key]}
              onChangeText={v => set(key, v)}
              placeholder={label}
              keyboardType={type}
              secureTextEntry={secure}
              autoCapitalize="none"
              placeholderTextColor="#aaa"
            />
            {err(key)}
          </View>
        ))}

        {/* Gender */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.row}>
          {['male','female'].map(g => (
            <TouchableOpacity key={g} style={[styles.pill, form.gender === g && styles.pillActive]} onPress={() => set('gender', g)}>
              <Text style={[styles.pillText, form.gender === g && styles.pillTextActive]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Country */}
        <Text style={styles.label}>Country</Text>
        <View style={styles.row}>
          {COUNTRIES.map(c => (
            <TouchableOpacity key={c} style={[styles.pill, form.country === c && styles.pillActive]} onPress={() => set('country', c)}>
              <Text style={[styles.pillText, form.country === c && styles.pillTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? <Text style={styles.linkAccent}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container    : { flex: 1, backgroundColor: '#fff' },
  inner        : { padding: 24, paddingTop: 50, paddingBottom: 40 },
  title        : { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
  sub          : { color: '#888', marginTop: 4, marginBottom: 20, fontSize: 15 },
  tabs         : { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#FFA100', marginBottom: 16 },
  tab          : { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive    : { backgroundColor: '#FFA100' },
  tabText      : { fontWeight: '600', color: '#FFA100' },
  tabTextActive: { color: '#fff' },
  label        : { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginTop: 12, marginBottom: 4 },
  input        : { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: '#f5f5f5', color: '#1a1a1a' },
  error        : { color: '#ef4444', fontSize: 12, marginTop: 2 },
  row          : { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  pill         : { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 },
  pillActive   : { backgroundColor: '#FFA100', borderColor: '#FFA100' },
  pillText     : { color: '#555', fontSize: 13 },
  pillTextActive: { color: '#fff', fontWeight: '600' },
  btn          : { backgroundColor: '#FFA100', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 28 },
  btnText      : { color: '#fff', fontSize: 16, fontWeight: '700' },
  link         : { textAlign: 'center', color: '#888', marginTop: 20, fontSize: 14 },
  linkAccent   : { color: '#FFA100', fontWeight: '600' },
});

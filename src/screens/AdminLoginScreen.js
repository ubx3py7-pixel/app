// src/screens/AdminLoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { C } from '../theme';
import { adminLogin } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginScreen({ navigation }) {
  const { loginAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError('Enter username and password.'); return; }
    setLoading(true); setError('');
    try {
      const res = await adminLogin(username, password);
      loginAdmin(res.token);
      navigation.replace('AdminDashboard');
    } catch (e) {
      setError(e.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={s.container}>
          <View style={s.iconBox}><Text style={s.icon}>🛡️</Text></View>
          <Text style={s.title}>Admin Login</Text>
          <Text style={s.sub}>Restricted — authorised personnel only</Text>

          <View style={s.field}>
            <Text style={s.label}>USERNAME</Text>
            <TextInput style={s.input} value={username} onChangeText={setUsername}
              placeholder="admin" placeholderTextColor={C.muted} autoCapitalize="none" />
          </View>

          <View style={s.field}>
            <Text style={s.label}>PASSWORD</Text>
            <TextInput style={s.input} value={password} onChangeText={setPassword}
              placeholder="••••••••" placeholderTextColor={C.muted} secureTextEntry
              onSubmitEditing={handleLogin} />
          </View>

          {!!error && <Text style={s.err}>{error}</Text>}

          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Login →</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: C.bg },
  kav:       { flex: 1 },
  back:      { padding: 20 },
  backText:  { color: C.muted, fontSize: 14 },
  container: { flex: 1, padding: 28, justifyContent: 'center' },
  iconBox:   { width: 64, height: 64, borderRadius: 18, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  icon:      { fontSize: 30 },
  title:     { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 6 },
  sub:       { fontSize: 13, color: C.muted, marginBottom: 32 },
  field:     { marginBottom: 16 },
  label:     { fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 6 },
  input:     { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 13, color: C.text, fontSize: 14, fontFamily: 'monospace' },
  err:       { color: C.danger, fontSize: 12, marginBottom: 12 },
  btn:       { backgroundColor: C.accent, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 8, shadowColor: C.accent, shadowOpacity: 0.4, shadowRadius: 10 },
  btnText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
});

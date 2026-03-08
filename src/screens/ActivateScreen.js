// src/screens/ActivateScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { C } from '../theme';
import { activateCode } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function ActivateScreen({ navigation }) {
  const { loginUser } = useAuth();
  const [username, setUsername] = useState('');
  const [code, setCode]         = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const formatCode = (text) => {
    // auto-insert dashes every 4 chars
    const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const parts = [];
    for (let i = 0; i < clean.length && i < 16; i += 4) parts.push(clean.slice(i, i + 4));
    return parts.join('-');
  };

  const handleActivate = async () => {
    if (!username.trim() || !code.trim()) { setError('Enter both username and code.'); return; }
    setLoading(true); setError('');
    try {
      const res = await activateCode(username.trim(), code.trim());
      loginUser(res.token, res.user);
      navigation.replace('UserDashboard');
    } catch (e) {
      setError(e.message || 'Invalid or expired activation code.');
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
          <View style={s.iconBox}><Text style={s.icon}>🔑</Text></View>
          <Text style={s.title}>Activate Access</Text>
          <Text style={s.sub}>Enter your code to unlock the bot dashboard.</Text>

          <View style={s.field}>
            <Text style={s.label}>YOUR USERNAME / HANDLE</Text>
            <TextInput style={s.input} value={username} onChangeText={setUsername}
              placeholder="@your_telegram" placeholderTextColor={C.muted} autoCapitalize="none" />
          </View>

          <View style={s.field}>
            <Text style={s.label}>ACTIVATION CODE</Text>
            <TextInput
              style={[s.input, s.codeInput]}
              value={code}
              onChangeText={t => setCode(formatCode(t))}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              placeholderTextColor={C.muted}
              autoCapitalize="characters"
              maxLength={19}
              onSubmitEditing={handleActivate}
            />
          </View>

          {!!error && <Text style={s.err}>{error}</Text>}

          <TouchableOpacity style={s.btn} onPress={handleActivate} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Activate →</Text>}
          </TouchableOpacity>

          <Text style={s.hint}>Don't have a code? Contact the admin.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  kav:        { flex: 1 },
  back:       { padding: 20 },
  backText:   { color: C.muted, fontSize: 14 },
  container:  { flex: 1, padding: 28, justifyContent: 'center' },
  iconBox:    { width: 64, height: 64, borderRadius: 18, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  icon:       { fontSize: 30 },
  title:      { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 6 },
  sub:        { fontSize: 13, color: C.muted, marginBottom: 32 },
  field:      { marginBottom: 16 },
  label:      { fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 6 },
  input:      { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 13, color: C.text, fontSize: 14 },
  codeInput:  { fontFamily: 'monospace', fontSize: 17, letterSpacing: 4, textAlign: 'center' },
  err:        { color: C.danger, fontSize: 12, marginBottom: 12 },
  btn:        { backgroundColor: C.accent, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 8, shadowColor: C.accent, shadowOpacity: 0.4, shadowRadius: 10 },
  btnText:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  hint:       { textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 24 },
});

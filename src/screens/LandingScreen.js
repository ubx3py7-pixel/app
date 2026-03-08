// src/screens/LandingScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { C } from '../theme';

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.iconBox}>
          <Text style={s.iconText}>🤖</Text>
        </View>
        <Text style={s.title}>SpyBot Panel</Text>
        <Text style={s.sub}>Instagram automation — restricted access</Text>

        <View style={s.btnGroup}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('Activate')}>
            <Text style={s.btnPrimaryText}>🔑  Activate with Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnGhost} onPress={() => navigation.navigate('AdminLogin')}>
            <Text style={s.btnGhostText}>🛡️  Admin Login</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.hint}>Need access? Contact the admin for an activation code.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconBox:    { width: 80, height: 80, borderRadius: 22, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: C.accent, shadowOpacity: 0.5, shadowRadius: 20 },
  iconText:   { fontSize: 38 },
  title:      { fontSize: 30, fontWeight: '800', color: C.text, marginBottom: 8, letterSpacing: 0.5 },
  sub:        { fontSize: 14, color: C.muted, marginBottom: 40, textAlign: 'center' },
  btnGroup:   { width: '100%', gap: 12 },
  btnPrimary: { backgroundColor: C.accent, borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: C.accent, shadowOpacity: 0.4, shadowRadius: 12 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnGhost:   { backgroundColor: 'transparent', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  btnGhostText: { color: C.muted, fontSize: 15, fontWeight: '600' },
  hint:       { marginTop: 40, color: C.muted, fontSize: 12, textAlign: 'center' },
});

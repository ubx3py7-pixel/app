// src/screens/UserDashboard.js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { C } from '../theme';
import { useAuth } from '../context/AuthContext';

function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function expLabel(iso) {
  if (!iso) return 'Never';
  const diff = new Date(iso) - Date.now();
  if (diff < 0) return 'Expired';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

const COMMANDS = [
  ['/start',    'Start the bot & see intro'],
  ['/login',    'Login with Instagram credentials'],
  ['/plogin',   'Login via Playwright browser'],
  ['/slogin',   'Login with saved session string'],
  ['/psid',     'Login with PSID session'],
  ['/attack',   'Start message attack on a target'],
  ['/pattack',  'Playwright-based message attack'],
  ['/stop',     'Stop running attack'],
  ['/task',     'View ongoing tasks'],
  ['/viewmyac', 'View linked Instagram accounts'],
  ['/setig',    'Set default Instagram account'],
  ['/pair',     'Pair two Instagram accounts'],
  ['/unpair',   'Remove account pairing'],
  ['/switch',   'Switch accounts automatically'],
  ['/threads',  'Set thread/tab count'],
  ['/kill',     'Kill process by PID'],
  ['/flush',    'Clear all tasks'],
  ['/usg',      'View CPU/RAM usage'],
  ['/logout',   'Logout Instagram account'],
  ['/cancel',   'Cancel active fetch'],
];

export default function UserDashboard({ navigation }) {
  const { userInfo, logoutUser } = useAuth();
  const [tab, setTab] = useState('overview');
  const user = userInfo || {};
  const isExpired = user.expires_at && new Date(user.expires_at) < new Date();

  const handleLogout = () => { logoutUser(); navigation.replace('Landing'); };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Welcome, {user.username}</Text>
          <Text style={s.headerSub}>{user.code_label || 'Standard'} Access</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Expired Warning */}
      {isExpired && (
        <View style={s.expiredBanner}>
          <Text style={s.expiredText}>⚠️  Your activation has expired. Contact admin for a new code.</Text>
        </View>
      )}

      {/* Status Banner */}
      <View style={s.banner}>
        <View style={s.bannerItem}>
          <Text style={s.bannerVal}>{isExpired ? 'Expired' : 'Active'}</Text>
          <Text style={s.bannerLbl}>Status</Text>
        </View>
        <View style={s.bannerDivider} />
        <View style={s.bannerItem}>
          <Text style={[s.bannerVal, { color: C.yellow }]}>{expLabel(user.expires_at)}</Text>
          <Text style={s.bannerLbl}>Remaining</Text>
        </View>
        <View style={s.bannerDivider} />
        <View style={s.bannerItem}>
          <Text style={[s.bannerVal, { color: C.accent, fontSize: 11, letterSpacing: 1.5 }]} numberOfLines={1}>{user.code_key}</Text>
          <Text style={s.bannerLbl}>Code</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        {['overview', 'commands', 'session'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll}>
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <View style={s.section}>
            <View style={s.grid}>
              {[
                { val: isExpired ? '🔴 Expired' : '🟢 Active', lbl: 'Bot Status', color: isExpired ? C.danger : C.green },
                { val: user.code_label || 'Standard', lbl: 'Plan', color: C.accent },
                { val: expLabel(user.expires_at), lbl: 'Time Left', color: C.yellow },
                { val: fmt(user.activated_at), lbl: 'Activated', color: C.text },
              ].map(item => (
                <View key={item.lbl} style={s.statCard}>
                  <Text style={[s.statVal, { color: item.color }]} numberOfLines={1}>{item.val}</Text>
                  <Text style={s.statLbl}>{item.lbl}</Text>
                </View>
              ))}
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoTitle}>🚀 Quick Guide</Text>
              <Text style={s.infoText}>
                This panel manages your SpyBot access. The bot runs on Telegram and automates Instagram messaging.{'\n\n'}
                Use the Commands tab to see all available bot commands. Your session is linked to the activation code provided by the admin.
              </Text>
            </View>
          </View>
        )}

        {/* COMMANDS */}
        {tab === 'commands' && (
          <View style={s.section}>
            <View style={s.commandCard}>
              {COMMANDS.map(([cmd, desc], i) => (
                <View key={cmd} style={[s.commandRow, i < COMMANDS.length - 1 && s.commandBorder]}>
                  <Text style={s.commandName}>{cmd}</Text>
                  <Text style={s.commandDesc}>{desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SESSION */}
        {tab === 'session' && (
          <View style={s.section}>
            <View style={s.infoCard}>
              <Text style={s.infoTitle}>💾 Session Info</Text>
              <Text style={s.infoText}>
                Sessions are stored server-side at:{'\n'}
                <Text style={{ color: C.accent, fontFamily: 'monospace' }}>sessions/&lt;tg_id&gt;_&lt;username&gt;_state.json</Text>{'\n\n'}
                Use <Text style={{ color: C.accent }}>/slogin</Text> to import an existing session, or{' '}
                <Text style={{ color: C.accent }}>/plogin</Text> to create a new one via browser automation.
              </Text>
            </View>
            <View style={s.codeCard}>
              <Text style={s.infoTitle}>Your Activation</Text>
              {[
                ['Username',  user.username],
                ['Code',      user.code_key],
                ['Plan',      user.code_label || 'Standard'],
                ['Activated', fmt(user.activated_at)],
                ['Expires',   user.expires_at ? fmt(user.expires_at) : 'Never'],
              ].map(([k, v]) => (
                <View key={k} style={s.sessionRow}>
                  <Text style={s.sessionKey}>{k}</Text>
                  <Text style={[s.sessionVal, k === 'Code' && { color: C.accent, letterSpacing: 2 }]} numberOfLines={1}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle:  { fontSize: 19, fontWeight: '800', color: C.text },
  headerSub:    { fontSize: 11, color: C.accent, marginTop: 2 },
  logoutBtn:    { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  logoutText:   { color: C.muted, fontSize: 13 },
  expiredBanner:{ backgroundColor: 'rgba(255,68,102,0.1)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,68,102,0.3)', padding: 12 },
  expiredText:  { color: C.danger, fontSize: 12, textAlign: 'center' },
  banner:       { flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, padding: 16 },
  bannerItem:   { flex: 1, alignItems: 'center' },
  bannerVal:    { fontSize: 14, fontWeight: '800', color: C.green },
  bannerLbl:    { fontSize: 10, color: C.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.6 },
  bannerDivider:{ width: 1, backgroundColor: C.border, marginHorizontal: 8 },
  tabBar:       { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface },
  tab:          { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive:    { borderBottomWidth: 2, borderBottomColor: C.accent },
  tabText:      { fontSize: 12, color: C.muted },
  tabTextActive:{ color: C.accent, fontWeight: '700' },
  scroll:       { flex: 1 },
  section:      { padding: 16, gap: 14 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard:     { width: '47%', backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16 },
  statVal:      { fontSize: 14, fontWeight: '800', color: C.text },
  statLbl:      { fontSize: 10, color: C.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.7 },
  infoCard:     { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 18 },
  infoTitle:    { color: C.text, fontWeight: '700', fontSize: 14, marginBottom: 10 },
  infoText:     { color: C.muted, fontSize: 13, lineHeight: 20 },
  commandCard:  { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  commandRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, flexWrap: 'wrap', gap: 4 },
  commandBorder:{ borderBottomWidth: 1, borderBottomColor: C.border },
  commandName:  { color: C.accent, fontWeight: '700', fontFamily: 'monospace', fontSize: 13 },
  commandDesc:  { color: C.muted, fontSize: 12, flex: 1, textAlign: 'right' },
  codeCard:     { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 18 },
  sessionRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  sessionKey:   { color: C.muted, fontSize: 12 },
  sessionVal:   { color: C.text, fontSize: 12, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});

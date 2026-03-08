// src/screens/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ActivityIndicator, Alert,
  RefreshControl, Modal, KeyboardAvoidingView, Platform, Clipboard
} from 'react-native';
import { C } from '../theme';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, listCodes, listUsers, generateCode, revokeCode, deleteCode } from '../api/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
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
function statusColor(s) {
  return { active: C.green, revoked: C.danger, expired: C.danger, used: C.muted }[s] || C.muted;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ val, label, color }) {
  return (
    <View style={sc.card}>
      <Text style={[sc.val, { color }]}>{val}</Text>
      <Text style={sc.lbl}>{label}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  card: { flex: 1, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16, alignItems: 'center' },
  val:  { fontSize: 26, fontWeight: '800' },
  lbl:  { fontSize: 10, color: C.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
});

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ navigation }) {
  const { adminToken, logoutAdmin } = useAuth();
  const [tab, setTab]         = useState('stats');
  const [stats, setStats]     = useState(null);
  const [codes, setCodes]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [genModal, setGenModal]     = useState(false);

  // Generate form state
  const [genLabel, setGenLabel]         = useState('');
  const [genUses, setGenUses]           = useState('1');
  const [genExpiry, setGenExpiry]       = useState('');
  const [genLoading, setGenLoading]     = useState(false);
  const [lastCode, setLastCode]         = useState(null);

  const load = useCallback(async () => {
    try {
      const [s, c, u] = await Promise.all([
        getAdminStats(adminToken),
        listCodes(adminToken),
        listUsers(adminToken),
      ]);
      setStats(s); setCodes(c); setUsers(u);
    } catch (e) {
      if (e.message?.includes('Invalid') || e.message?.includes('expired')) {
        logoutAdmin(); navigation.replace('Landing');
      }
    }
  }, [adminToken]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleRevoke = (id) => {
    Alert.alert('Revoke Code', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Revoke', style: 'destructive', onPress: async () => {
        await revokeCode(adminToken, id); load();
      }},
    ]);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Code', 'This cannot be undone.', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteCode(adminToken, id); load();
      }},
    ]);
  };

  const handleGenerate = async () => {
    setGenLoading(true);
    try {
      const expiresHours = genExpiry ? parseInt(genExpiry) : null;
      const code = await generateCode(adminToken, {
        label: genLabel, max_uses: parseInt(genUses) || 1, expires_hours: expiresHours
      });
      setLastCode(code); setGenLabel(''); setGenUses('1'); setGenExpiry('');
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setGenLoading(false);
    }
  };

  const copyCode = (key) => {
    Clipboard.setString(key);
    Alert.alert('Copied!', key);
  };

  const tabs = ['stats', 'codes', 'users', 'generate'];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Admin Panel</Text>
          <Text style={s.headerSub}>SpyBot Management</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={() => { logoutAdmin(); navigation.replace('Landing'); }}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'stats' ? '📊' : t === 'codes' ? '🔑' : t === 'users' ? '👥' : '⚡'} {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}>

        {/* STATS */}
        {tab === 'stats' && (
          <View style={s.section}>
            {stats ? (
              <>
                <View style={s.statRow}>
                  <StatCard val={stats.total_codes}  label="Total Codes"  color={C.accent} />
                  <StatCard val={stats.active_codes} label="Active Codes" color={C.green} />
                  <StatCard val={stats.total_users}  label="Users"        color={C.yellow} />
                </View>
                <View style={s.infoCard}>
                  <Text style={s.infoTitle}>ℹ️  Bot Info</Text>
                  {[['Bot File','fixspbot.py'],['Sender','msg.py'],['Sessions','sessions/'],['DB','spybot.db']].map(([k,v]) => (
                    <View key={k} style={s.infoRow}>
                      <Text style={s.infoKey}>{k}</Text>
                      <Text style={s.infoVal}>{v}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} />}
          </View>
        )}

        {/* CODES */}
        {tab === 'codes' && (
          <View style={s.section}>
            <TouchableOpacity style={s.genBtn} onPress={() => { setTab('generate'); }}>
              <Text style={s.genBtnText}>+ Generate New Code</Text>
            </TouchableOpacity>
            {codes.length === 0
              ? <Text style={s.empty}>No codes yet. Generate one!</Text>
              : codes.map(code => (
                <View key={code.id} style={s.codeCard}>
                  <TouchableOpacity onPress={() => copyCode(code.key)}>
                    <Text style={s.codeKey}>{code.key}</Text>
                  </TouchableOpacity>
                  <View style={s.codeRow}>
                    <Text style={[s.codeBadge, { color: statusColor(code.status) }]}>● {code.status}</Text>
                    {!!code.label && <Text style={s.codeLabel}>{code.label}</Text>}
                    <Text style={s.codeMeta}>{code.uses}/{code.max_uses} uses</Text>
                  </View>
                  <View style={s.codeRow}>
                    <Text style={s.codeMeta}>Expires: {code.expires_at ? expLabel(code.expires_at) : 'Never'}</Text>
                    <Text style={s.codeMeta}>Created: {fmt(code.created_at)}</Text>
                  </View>
                  <View style={s.codeActions}>
                    <TouchableOpacity style={s.copyBtn} onPress={() => copyCode(code.key)}>
                      <Text style={s.copyBtnText}>📋 Copy</Text>
                    </TouchableOpacity>
                    {code.is_active === 1 && (
                      <TouchableOpacity style={s.revokeBtn} onPress={() => handleRevoke(code.id)}>
                        <Text style={s.revokeBtnText}>Revoke</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(code.id)}>
                      <Text style={s.delBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <View style={s.section}>
            {users.length === 0
              ? <Text style={s.empty}>No users have activated yet.</Text>
              : users.map(u => (
                <View key={u.id} style={s.codeCard}>
                  <Text style={s.userName}>{u.username}</Text>
                  <Text style={s.codeKey} numberOfLines={1}>{u.code_key}</Text>
                  {!!u.code_label && <Text style={s.codeLabel}>{u.code_label}</Text>}
                  <View style={s.codeRow}>
                    <Text style={s.codeMeta}>Activated: {fmt(u.activated_at)}</Text>
                    <Text style={s.codeMeta}>Expires: {u.expires_at ? fmt(u.expires_at) : 'Never'}</Text>
                  </View>
                  {u.last_seen && <Text style={s.codeMeta}>Last seen: {fmt(u.last_seen)}</Text>}
                  <Text style={[s.codeBadge, { color: u.expires_at && new Date(u.expires_at) < new Date() ? C.danger : C.green }]}>
                    ● {u.expires_at && new Date(u.expires_at) < new Date() ? 'expired' : 'active'}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* GENERATE */}
        {tab === 'generate' && (
          <View style={s.section}>
            <View style={s.formCard}>
              <Text style={s.formTitle}>⚡ Generate Activation Code</Text>

              <Text style={s.label}>LABEL (optional)</Text>
              <TextInput style={s.input} value={genLabel} onChangeText={setGenLabel}
                placeholder="e.g. VIP, Trial, User123" placeholderTextColor={C.muted} />

              <Text style={s.label}>MAX USES</Text>
              <TextInput style={s.input} value={genUses} onChangeText={setGenUses}
                keyboardType="number-pad" placeholder="1" placeholderTextColor={C.muted} />
              <Text style={s.hint}>How many times this code can be activated.</Text>

              <Text style={s.label}>EXPIRES IN HOURS (optional)</Text>
              <TextInput style={s.input} value={genExpiry} onChangeText={setGenExpiry}
                keyboardType="number-pad" placeholder="e.g. 720 for 30 days, blank = never" placeholderTextColor={C.muted} />

              <TouchableOpacity style={s.genSubmitBtn} onPress={handleGenerate} disabled={genLoading}>
                {genLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.genSubmitText}>Generate Code →</Text>}
              </TouchableOpacity>
            </View>

            {lastCode && (
              <View style={s.resultCard}>
                <Text style={s.resultTitle}>✅ Code Generated!</Text>
                <TouchableOpacity onPress={() => copyCode(lastCode.key)}>
                  <Text style={s.resultCode}>{lastCode.key}</Text>
                  <Text style={s.resultHint}>Tap to copy</Text>
                </TouchableOpacity>
                <View style={s.resultMeta}>
                  {lastCode.label ? <Text style={s.codeMeta}>Label: {lastCode.label}</Text> : null}
                  <Text style={s.codeMeta}>Max Uses: {lastCode.max_uses}</Text>
                  <Text style={s.codeMeta}>Expires: {lastCode.expires_at ? fmt(lastCode.expires_at) : 'Never'}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle:{ fontSize: 20, fontWeight: '800', color: C.text },
  headerSub:  { fontSize: 11, color: C.muted, marginTop: 2 },
  logoutBtn:  { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  logoutText: { color: C.muted, fontSize: 13 },
  tabBar:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface },
  tab:        { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive:  { borderBottomWidth: 2, borderBottomColor: C.accent },
  tabText:    { fontSize: 11, color: C.muted },
  tabTextActive: { color: C.accent, fontWeight: '700' },
  scroll:     { flex: 1 },
  section:    { padding: 16, gap: 12 },
  statRow:    { flexDirection: 'row', gap: 10 },
  infoCard:   { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16, marginTop: 8 },
  infoTitle:  { color: C.text, fontWeight: '700', marginBottom: 12, fontSize: 14 },
  infoRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  infoKey:    { color: C.muted, fontSize: 12 },
  infoVal:    { color: C.accent, fontSize: 12, fontFamily: 'monospace' },
  codeCard:   { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16, gap: 6 },
  codeKey:    { color: C.accent, fontFamily: 'monospace', fontSize: 15, letterSpacing: 2, fontWeight: '700' },
  codeRow:    { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  codeBadge:  { fontSize: 12, fontWeight: '600' },
  codeLabel:  { color: C.yellow, fontSize: 12 },
  codeMeta:   { color: C.muted, fontSize: 11 },
  codeActions:{ flexDirection: 'row', gap: 8, marginTop: 6 },
  copyBtn:    { backgroundColor: 'rgba(124,92,252,0.15)', borderWidth: 1, borderColor: 'rgba(124,92,252,0.3)', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 6 },
  copyBtnText:{ color: C.accent, fontSize: 12, fontWeight: '600' },
  revokeBtn:  { backgroundColor: 'rgba(255,68,102,0.1)', borderWidth: 1, borderColor: 'rgba(255,68,102,0.3)', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 6 },
  revokeBtnText: { color: C.danger, fontSize: 12, fontWeight: '600' },
  delBtn:     { backgroundColor: C.surface2, borderRadius: 7, paddingHorizontal: 12, paddingVertical: 6 },
  delBtnText: { color: C.muted, fontSize: 12 },
  userName:   { color: C.text, fontWeight: '700', fontSize: 15 },
  empty:      { color: C.muted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  genBtn:     { backgroundColor: C.accent, borderRadius: 12, padding: 14, alignItems: 'center', shadowColor: C.accent, shadowOpacity: 0.35, shadowRadius: 10 },
  genBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  formCard:   { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 20, gap: 8 },
  formTitle:  { color: C.text, fontWeight: '800', fontSize: 16, marginBottom: 8 },
  label:      { fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginTop: 8 },
  input:      { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 9, padding: 12, color: C.text, fontSize: 14, fontFamily: 'monospace' },
  hint:       { color: C.muted, fontSize: 11 },
  genSubmitBtn: { backgroundColor: C.accent, borderRadius: 11, padding: 14, alignItems: 'center', marginTop: 12, shadowColor: C.accent, shadowOpacity: 0.35, shadowRadius: 10 },
  genSubmitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  resultCard: { backgroundColor: 'rgba(57,217,138,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(57,217,138,0.3)', padding: 20, alignItems: 'center', gap: 10 },
  resultTitle: { color: C.green, fontWeight: '800', fontSize: 16 },
  resultCode: { color: C.accent, fontFamily: 'monospace', fontSize: 18, letterSpacing: 3, fontWeight: '700', textAlign: 'center' },
  resultHint: { color: C.muted, fontSize: 11 },
  resultMeta: { gap: 4, alignItems: 'center' },
});

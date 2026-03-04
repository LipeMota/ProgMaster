import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/Theme';
import { api } from '../../utils/api';

export default function Missions() {
  const [daily, setDaily] = useState<any[]>([]);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [bosses, setBosses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState('');
  const [tab, setTab] = useState<'daily' | 'weekly' | 'boss'>('daily');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;
      setUserId(uid);
      const [d, w, b] = await Promise.all([
        api.getDailyMissions(uid), api.getWeeklyMissions(uid), api.getBossMissions()
      ]);
      setDaily(d); setWeekly(w); setBosses(b);
    } catch (e) { console.error(e); }
    setLoading(false); setRefreshing(false);
  };

  const claimMission = async (missionId: string) => {
    try {
      await api.completeMission(userId, missionId);
      loadAll();
    } catch (e) { console.error(e); }
  };

  if (loading) return <View style={styles.loadWrap}><ActivityIndicator size="large" color={COLORS.neonCyan} /></View>;

  const renderMission = (m: any, i: number) => {
    const pct = m.target > 0 ? Math.round((m.progress / m.target) * 100) : 0;
    const iconMap: any = { brain: 'bulb', flame: 'flame', code: 'code-slash', bug: 'bug', users: 'people', quiz: 'bulb', streak: 'flame', code_complete: 'code-slash', bug_hunt: 'bug', pair: 'people' };
    return (
      <View key={m.id || i} style={[styles.missionCard, m.completed && styles.completedCard]} testID={`mission-${m.id}`}>
        <View style={styles.missionLeft}>
          <Ionicons name={(iconMap[m.icon] || iconMap[m.type] || 'flag') as any} size={24} color={m.completed ? COLORS.neonGreen : COLORS.neonCyan} />
        </View>
        <View style={styles.missionMid}>
          <Text style={styles.missionTitle}>{m.title}</Text>
          <Text style={styles.missionDesc}>{m.description}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressText}>{m.progress || 0}/{m.target} {m.completed ? '✅' : ''}</Text>
        </View>
        <View style={styles.missionRight}>
          <Text style={styles.rewardText}>+{m.xp_reward} XP</Text>
          <Text style={styles.rewardCoins}>+{m.coins_reward} 🪙</Text>
          {m.completed && !m.claimed && (
            <TouchableOpacity testID={`claim-${m.id}`} style={styles.claimBtn} onPress={() => claimMission(m.id)}>
              <Text style={styles.claimText}>COLETAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} testID="missions-screen">
      <Text style={styles.title}>⚔️ MISSÕES</Text>
      <View style={styles.tabRow}>
        {(['daily', 'weekly', 'boss'] as const).map(t => (
          <TouchableOpacity key={t} testID={`tab-${t}`} style={[styles.tabBtn, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'daily' ? '📅 Diárias' : t === 'weekly' ? '📋 Semanais' : '👹 Boss'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} tintColor={COLORS.neonCyan} />}>
        {tab === 'daily' && (daily.length > 0 ? daily.map(renderMission) : <Text style={styles.emptyText}>Nenhuma missão diária disponível</Text>)}
        {tab === 'weekly' && (weekly.length > 0 ? weekly.map(renderMission) : <Text style={styles.emptyText}>Nenhuma missão semanal disponível</Text>)}
        {tab === 'boss' && bosses.map((b, i) => (
          <View key={b.id} style={styles.bossCard} testID={`boss-${b.id}`}>
            <Text style={styles.bossEmoji}>👹</Text>
            <Text style={styles.bossName}>{b.title}</Text>
            <Text style={styles.bossDesc}>{b.description}</Text>
            <View style={styles.bossRewards}>
              <Text style={styles.bossReward}>+{b.xp_reward} XP</Text>
              <Text style={styles.bossReward}>+{b.coins_reward} 🪙</Text>
              <Text style={styles.bossBadge}>🏆 {b.badge}</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadWrap: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FONT_SIZES.h2, fontFamily: 'SpaceMono', color: COLORS.neonCyan, textAlign: 'center', marginTop: SPACING.m, letterSpacing: 3, marginBottom: SPACING.s },
  tabRow: { flexDirection: 'row', paddingHorizontal: SPACING.m, gap: SPACING.s, marginBottom: SPACING.m },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.panelBg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.panelBorder },
  tabActive: { borderColor: COLORS.neonCyan, backgroundColor: COLORS.neonCyan + '15' },
  tabText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, fontWeight: '600' },
  tabTextActive: { color: COLORS.neonCyan },
  scroll: { paddingHorizontal: SPACING.l },
  missionCard: { flexDirection: 'row', backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, marginBottom: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  completedCard: { borderColor: COLORS.neonGreen + '50' },
  missionLeft: { justifyContent: 'center', marginRight: SPACING.m },
  missionMid: { flex: 1 },
  missionTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '700' },
  missionDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginTop: 2 },
  progressBarBg: { height: 4, backgroundColor: COLORS.xpBarBg, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: COLORS.neonCyan, borderRadius: 2 },
  progressText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 2, fontFamily: 'SpaceMono' },
  missionRight: { alignItems: 'flex-end', justifyContent: 'center' },
  rewardText: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontWeight: '700', fontFamily: 'SpaceMono' },
  rewardCoins: { color: COLORS.neonYellow, fontSize: FONT_SIZES.tiny, fontFamily: 'SpaceMono' },
  claimBtn: { marginTop: 6, backgroundColor: COLORS.neonGreen, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  claimText: { color: COLORS.background, fontSize: FONT_SIZES.tiny, fontWeight: '800' },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xl },
  bossCard: { backgroundColor: COLORS.panelBg, borderRadius: 16, padding: SPACING.l, marginBottom: SPACING.m, borderWidth: 1, borderColor: COLORS.neonPink + '40', alignItems: 'center' },
  bossEmoji: { fontSize: 48, marginBottom: SPACING.s },
  bossName: { color: COLORS.neonPink, fontSize: FONT_SIZES.h3, fontWeight: '800', fontFamily: 'SpaceMono' },
  bossDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, textAlign: 'center', marginVertical: SPACING.s },
  bossRewards: { flexDirection: 'row', gap: SPACING.m, marginTop: SPACING.s },
  bossReward: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono' },
  bossBadge: { color: COLORS.neonYellow, fontSize: FONT_SIZES.small },
});

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, AVATARS, getLevelTitle, getXpForLevel } from '../../constants/Theme';
import { api } from '../../utils/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [counts, setCounts] = useState<any>(null);

  const loadData = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) { router.replace('/'); return; }
      const [u, c] = await Promise.all([api.getUser(userId), api.getQuestionCounts()]);
      setUser(u);
      setCounts(c);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) return <View style={styles.loadWrap}><ActivityIndicator size="large" color={COLORS.neonCyan} /></View>;
  if (!user) return <View style={styles.loadWrap}><Text style={styles.errText}>Erro ao carregar</Text></View>;

  const xpNeeded = user.xp_proximo_nivel || getXpForLevel(user.nivel);
  const xpPct = Math.min((user.xp / xpNeeded) * 100, 100);
  const av = AVATARS[user.avatar_id] || AVATARS.hacker;

  return (
    <SafeAreaView style={styles.container} testID="dashboard-screen">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.neonCyan} />}>
        {/* HUD */}
        <View style={styles.hud} testID="player-hud">
          <View style={styles.hudLeft}>
            <View style={[styles.avatarCircle, { borderColor: av.color }]}>
              <Text style={styles.avatarEmoji}>{av.emoji}</Text>
            </View>
            <View>
              <Text style={styles.playerName}>{user.nome}</Text>
              <Text style={styles.playerTitle}>Nv.{user.nivel} {getLevelTitle(user.nivel)}</Text>
            </View>
          </View>
          <TouchableOpacity testID="profile-btn" onPress={() => router.push('/profile')}>
            <Ionicons name="settings-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* XP Bar */}
        <View style={styles.xpSection}>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${xpPct}%` }]} />
          </View>
          <Text style={styles.xpText}>{user.xp} / {xpNeeded} XP</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow} testID="stats-row">
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🪙</Text>
            <Text style={styles.statValue}>{user.codecoins}</Text>
            <Text style={styles.statLabel}>CodeCoins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statValue, { color: COLORS.streakFlame }]}>{user.streak_dias}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{user.total_acertos}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📝</Text>
            <Text style={styles.statValue}>{user.total_quizzes}</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>⚡ AÇÕES RÁPIDAS</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'bulb', label: 'Quiz Rápido', color: COLORS.neonCyan, route: '/(tabs)/quizzes' },
            { icon: 'code-slash', label: 'Pair Prog', color: COLORS.neonGreen, route: '/pair-programming' },
            { icon: 'bug', label: 'Bug Hunt', color: COLORS.neonPink, route: '/bug-hunt' },
            { icon: 'timer', label: 'Pomodoro', color: COLORS.neonYellow, route: '/pomodoro' },
            { icon: 'chatbubbles', label: 'Entrevista', color: COLORS.neonPurple, route: '/interview' },
            { icon: 'terminal', label: 'Dual Code', color: COLORS.neonCyan, route: '/dual-coding' },
          ].map((a, i) => (
            <TouchableOpacity key={i} testID={`action-${a.label.toLowerCase().replace(/\s/g,'-')}`} style={styles.actionCard} onPress={() => router.push(a.route as any)}>
              <Ionicons name={a.icon as any} size={28} color={a.color} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Languages Progress */}
        <Text style={styles.sectionTitle}>🗺️ PROGRESSO POR LINGUAGEM</Text>
        {counts?.by_language && Object.entries(counts.by_language).map(([lang, data]: any) => {
          const stats = user.quiz_stats?.[lang] || { total: 0, acertos: 0 };
          const pct = stats.total > 0 ? Math.round((stats.acertos / stats.total) * 100) : 0;
          const langMap: any = { csharp: { n: 'C#', e: '🏙️', c: '#9B4DCA' }, sql: { n: 'SQL', e: '🏰', c: '#FF6B35' }, python: { n: 'Python', e: '🌲', c: '#39FF14' }, java: { n: 'Java', e: '🏯', c: '#FF003C' } };
          const l = langMap[lang] || { n: lang, e: '📦', c: COLORS.neonCyan };
          return (
            <View key={lang} style={styles.langCard}>
              <View style={styles.langHeader}>
                <Text style={styles.langEmoji}>{l.e}</Text>
                <Text style={[styles.langName, { color: l.c }]}>{l.n}</Text>
                <Text style={styles.langCount}>{data.total} questões</Text>
              </View>
              <View style={styles.langBarBg}>
                <View style={[styles.langBarFill, { width: `${pct}%`, backgroundColor: l.c }]} />
              </View>
              <Text style={styles.langPct}>{pct}% precisão ({stats.acertos}/{stats.total})</Text>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadWrap: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  errText: { color: COLORS.error, fontSize: FONT_SIZES.body },
  hud: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  hudLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, backgroundColor: COLORS.panelBg, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 26 },
  playerName: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '700' },
  playerTitle: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono' },
  xpSection: { paddingHorizontal: SPACING.l, marginBottom: SPACING.m },
  xpBarBg: { height: 8, backgroundColor: COLORS.xpBarBg, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: COLORS.xpBar, borderRadius: 4 },
  xpText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 4, textAlign: 'right', fontFamily: 'SpaceMono' },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.m, marginBottom: SPACING.l, gap: SPACING.s },
  statCard: { flex: 1, backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, alignItems: 'center', borderWidth: 1, borderColor: COLORS.panelBorder },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h3, fontWeight: '800', fontFamily: 'SpaceMono' },
  statLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 2 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '700', paddingHorizontal: SPACING.l, marginBottom: SPACING.m, fontFamily: 'SpaceMono', letterSpacing: 1 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.m, gap: SPACING.s, marginBottom: SPACING.xl },
  actionCard: { width: '31%', backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, alignItems: 'center', borderWidth: 1, borderColor: COLORS.panelBorder, minHeight: 80, justifyContent: 'center' },
  actionLabel: { color: COLORS.textPrimary, fontSize: FONT_SIZES.tiny, marginTop: 6, textAlign: 'center', fontWeight: '600' },
  langCard: { marginHorizontal: SPACING.l, marginBottom: SPACING.m, backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  langHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.s },
  langEmoji: { fontSize: 20, marginRight: SPACING.s },
  langName: { fontSize: FONT_SIZES.body, fontWeight: '700', flex: 1 },
  langCount: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny },
  langBarBg: { height: 6, backgroundColor: COLORS.xpBarBg, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  langBarFill: { height: '100%', borderRadius: 3 },
  langPct: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, fontFamily: 'SpaceMono' },
});

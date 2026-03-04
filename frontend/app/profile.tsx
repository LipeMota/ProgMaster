import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, AVATARS, getLevelTitle, getXpForLevel } from '../constants/Theme';
import { api } from '../utils/api';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;
      const [u, s] = await Promise.all([api.getUser(uid), api.getStats(uid)]);
      setUser(u);
      setStats(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const changeAvatar = async (avatarId: string) => {
    if (!user) return;
    if (!user.skins_desbloqueadas?.includes(avatarId)) {
      Alert.alert('Skin bloqueada', 'Compre esta skin na loja primeiro!');
      return;
    }
    try {
      await api.updateUser(user.id, { avatar_id: avatarId });
      loadProfile();
    } catch (e) { console.error(e); }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userId');
    router.replace('/');
  };

  if (loading) return <View style={styles.loadWrap}><ActivityIndicator size="large" color={COLORS.neonCyan} /></View>;
  if (!user) return <View style={styles.loadWrap}><Text style={styles.errText}>Erro ao carregar perfil</Text></View>;

  const xpNeeded = user.xp_proximo_nivel || getXpForLevel(user.nivel);
  const accuracy = user.total_quizzes > 0 ? Math.round((user.total_acertos / user.total_quizzes) * 100) : 0;
  const av = AVATARS[user.avatar_id] || AVATARS.hacker;

  return (
    <SafeAreaView style={styles.container} testID="profile-screen">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={COLORS.neonCyan} /></TouchableOpacity>
        <Text style={styles.title}>👤 PERFIL</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar & Name */}
        <View style={styles.profileCard}>
          <View style={[styles.bigAvatar, { borderColor: av.color }]}>
            <Text style={styles.bigAvatarEmoji}>{av.emoji}</Text>
          </View>
          <Text style={styles.name}>{user.nome}</Text>
          <Text style={[styles.titleText, { color: av.color }]}>Nv.{user.nivel} {getLevelTitle(user.nivel)}</Text>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${Math.min((user.xp / xpNeeded) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.xpText}>{user.xp}/{xpNeeded} XP</Text>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>📊 ESTATÍSTICAS</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'CodeCoins', value: user.codecoins, icon: '🪙' },
            { label: 'Streak', value: `${user.streak_dias} dias`, icon: '🔥' },
            { label: 'Quizzes', value: user.total_quizzes, icon: '📝' },
            { label: 'Acertos', value: user.total_acertos, icon: '✅' },
            { label: 'Precisão', value: `${accuracy}%`, icon: '🎯' },
            { label: 'Missões', value: user.total_missoes, icon: '⚔️' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Language Stats */}
        <Text style={styles.sectionTitle}>📈 POR LINGUAGEM</Text>
        {user.quiz_stats && Object.entries(user.quiz_stats).map(([lang, data]: any) => {
          const pct = data.total > 0 ? Math.round((data.acertos / data.total) * 100) : 0;
          const langNames: any = { csharp: 'C#', sql: 'SQL', python: 'Python', java: 'Java' };
          return (
            <View key={lang} style={styles.langStatRow}>
              <Text style={styles.langStatName}>{langNames[lang] || lang}</Text>
              <Text style={styles.langStatPct}>{pct}%</Text>
              <Text style={styles.langStatDetail}>{data.acertos}/{data.total}</Text>
            </View>
          );
        })}

        {/* Avatar Selection */}
        <Text style={styles.sectionTitle}>🎭 AVATARS</Text>
        <View style={styles.avatarRow}>
          {Object.entries(AVATARS).map(([key, avData]) => {
            const owned = user.skins_desbloqueadas?.includes(key);
            const isActive = user.avatar_id === key;
            return (
              <TouchableOpacity key={key} testID={`profile-avatar-${key}`} style={[styles.avatarOption, isActive && { borderColor: avData.color }, !owned && styles.lockedAvatar]} onPress={() => changeAvatar(key)}>
                <Text style={styles.avatarOptEmoji}>{avData.emoji}</Text>
                <Text style={[styles.avatarOptName, isActive && { color: avData.color }]}>{avData.name}</Text>
                {!owned && <Text style={styles.lockIcon}>🔒</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Badges */}
        {user.badges && user.badges.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🏆 BADGES</Text>
            <View style={styles.badgeRow}>
              {user.badges.map((b: string, i: number) => (
                <View key={i} style={styles.badge}><Text style={styles.badgeText}>{b}</Text></View>
              ))}
            </View>
          </>
        )}

        {/* Logout */}
        <TouchableOpacity testID="logout-btn" style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out" size={20} color={COLORS.neonPink} />
          <Text style={styles.logoutText}>Sair / Trocar Conta</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadWrap: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  errText: { color: COLORS.error, fontSize: FONT_SIZES.body },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  title: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h3, fontFamily: 'SpaceMono' },
  scroll: { padding: SPACING.l },
  profileCard: { alignItems: 'center', backgroundColor: COLORS.panelBg, borderRadius: 20, padding: SPACING.xl, marginBottom: SPACING.l, borderWidth: 1, borderColor: COLORS.panelBorder },
  bigAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.m },
  bigAvatarEmoji: { fontSize: 42 },
  name: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h2, fontWeight: '800' },
  titleText: { fontSize: FONT_SIZES.body, fontFamily: 'SpaceMono', marginTop: 4 },
  xpBarBg: { height: 8, backgroundColor: COLORS.xpBarBg, borderRadius: 4, width: '100%', overflow: 'hidden', marginTop: SPACING.m },
  xpBarFill: { height: '100%', backgroundColor: COLORS.xpBar, borderRadius: 4 },
  xpText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 4, fontFamily: 'SpaceMono' },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '700', marginBottom: SPACING.m, fontFamily: 'SpaceMono' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.s, marginBottom: SPACING.l },
  statItem: { width: '31%', backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, alignItems: 'center', borderWidth: 1, borderColor: COLORS.panelBorder },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body, fontWeight: '800', fontFamily: 'SpaceMono' },
  statLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 2 },
  langStatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.s, borderBottomWidth: 1, borderBottomColor: COLORS.panelBorder },
  langStatName: { color: COLORS.textPrimary, flex: 1, fontSize: FONT_SIZES.body },
  langStatPct: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body, fontFamily: 'SpaceMono', marginRight: SPACING.m },
  langStatDetail: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono' },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.s, marginBottom: SPACING.l },
  avatarOption: { width: 70, height: 80, backgroundColor: COLORS.panelBg, borderRadius: 12, borderWidth: 2, borderColor: COLORS.panelBorder, alignItems: 'center', justifyContent: 'center' },
  lockedAvatar: { opacity: 0.4 },
  avatarOptEmoji: { fontSize: 28 },
  avatarOptName: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 2 },
  lockIcon: { position: 'absolute', top: 4, right: 4, fontSize: 10 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.s, marginBottom: SPACING.l },
  badge: { backgroundColor: COLORS.neonYellow + '20', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.neonYellow + '40' },
  badgeText: { color: COLORS.neonYellow, fontSize: FONT_SIZES.small, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.s, paddingVertical: SPACING.m, marginTop: SPACING.l, borderWidth: 1, borderColor: COLORS.neonPink + '40', borderRadius: 8 },
  logoutText: { color: COLORS.neonPink, fontSize: FONT_SIZES.body },
});

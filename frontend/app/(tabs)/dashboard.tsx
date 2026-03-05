import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, AVATARS, getLevelTitle, getXpForLevel } from '../../constants/Theme';
import { getUser, getQuizHistory } from '../../utils/database';
import { MOCK_QUESTIONS } from '../../utils/mockData';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) { 
        router.replace('/'); 
        return; 
      }
      
      const [userData, history] = await Promise.all([
        getUser(userId),
        getQuizHistory(userId)
      ]);
      
      if (!userData) {
        Toast.show({
          type: 'error',
          text1: 'Usuário não encontrado',
          text2: 'Recriando perfil...'
        });
        router.replace('/');
        return;
      }
      
      setUser(userData);
      setQuizHistory(history || []);
    } catch (e: any) {
      console.error('Error loading dashboard:', e);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar',
        text2: e.message || 'Tente novamente'
      });
    }
    setLoading(false);
    setRefreshing(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { 
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true); 
    loadData(); 
  };

  const handleActionPress = (route: string, label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Toast.show({
      type: 'info',
      text1: label,
      text2: 'Carregando...'
    });
    router.push(route as any);
  };

  if (loading) {
    return (
      <View style={styles.loadWrap}>
        <ActivityIndicator size="large" color={COLORS.neonCyan} />
        <Text style={styles.loadText}>Carregando perfil...</Text>
      </View>
    );
  }
  
  if (!user) {
    return (
      <View style={styles.loadWrap}>
        <Text style={styles.errText}>Erro ao carregar perfil</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.replace('/')}>
          <Text style={styles.retryText}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const xpNeeded = getXpForLevel(user.level + 1);
  const xpPct = Math.min((user.xp / xpNeeded) * 100, 100);
  const av = AVATARS[user.avatar_id] || AVATARS.hacker;
  
  // Calcular estatísticas dos quizzes
  const totalQuizzes = quizHistory.length;
  const totalAcertos = quizHistory.reduce((acc, q) => acc + q.score, 0);
  const totalQuestoes = quizHistory.reduce((acc, q) => acc + q.total_questions, 0);
  const precisao = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;
  
  // Contar questões por linguagem
  const questionCounts = {
    csharp: MOCK_QUESTIONS.csharp?.length || 0,
    sql: MOCK_QUESTIONS.sql?.length || 0,
    python: MOCK_QUESTIONS.python?.length || 0,
    java: MOCK_QUESTIONS.java?.length || 0,
  };
  
  // Estatísticas por linguagem
  const langStats: any = {};
  quizHistory.forEach((quiz: any) => {
    if (!langStats[quiz.language]) {
      langStats[quiz.language] = { total: 0, acertos: 0 };
    }
    langStats[quiz.language].total += quiz.total_questions;
    langStats[quiz.language].acertos += quiz.score;
  });

  return (
    <SafeAreaView style={styles.container} testID="dashboard-screen">
      <ScrollView 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.neonCyan} 
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HUD */}
        <View style={styles.hud} testID="player-hud">
          <View style={styles.hudLeft}>
            <View style={[styles.avatarCircle, { borderColor: av.color }]}>
              <Text style={styles.avatarEmoji}>{av.emoji}</Text>
            </View>
            <View>
              <Text style={styles.playerName}>{user.nome}</Text>
              <Text style={styles.playerTitle}>Lv.{user.level} {getLevelTitle(user.level)}</Text>
            </View>
          </View>
          <TouchableOpacity 
            testID="profile-btn" 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/profile');
            }}
            accessibilityLabel="Configurações"
          >
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
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>{user.coins}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statValue, { color: COLORS.streakFlame }]}>{user.streak_days || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{totalAcertos}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statValue}>{totalQuizzes}</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
        </View>

        {/* Precisão Geral */}
        {totalQuestoes > 0 && (
          <View style={styles.accuracyCard}>
            <Text style={styles.accuracyLabel}>Precisão Geral</Text>
            <Text style={[styles.accuracyValue, { color: precisao >= 70 ? COLORS.success : COLORS.warning }]}>
              {precisao}%
            </Text>
            <Text style={styles.accuracyDetail}>{totalAcertos} de {totalQuestoes} questões</Text>
          </View>
        )}

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
            <TouchableOpacity 
              key={i} 
              testID={`action-${a.label.toLowerCase().replace(/\s/g,'-')}`} 
              style={styles.actionCard} 
              onPress={() => handleActionPress(a.route, a.label)}
              accessibilityLabel={a.label}
            >
              <Ionicons name={a.icon as any} size={28} color={a.color} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Languages Progress */}
        <Text style={styles.sectionTitle}>🗺️ PROGRESSO POR LINGUAGEM</Text>
        {Object.entries(questionCounts).map(([lang, total]) => {
          const stats = langStats[lang] || { total: 0, acertos: 0 };
          const pct = stats.total > 0 ? Math.round((stats.acertos / stats.total) * 100) : 0;
          const langMap: any = {
            csharp: { n: 'C#', e: '🏢', c: COLORS.csharp },
            sql: { n: 'SQL', e: '🗄️', c: COLORS.sql },
            python: { n: 'Python', e: '🐍', c: COLORS.python },
            java: { n: 'Java', e: '☕', c: COLORS.java }
          };
          const l = langMap[lang] || { n: lang, e: '📚', c: COLORS.neonCyan };
          
          return (
            <View key={lang} style={styles.langCard}>
              <View style={styles.langHeader}>
                <Text style={styles.langEmoji}>{l.e}</Text>
                <Text style={[styles.langName, { color: l.c }]}>{l.n}</Text>
                <Text style={styles.langCount}>{total} questões</Text>
              </View>
              {stats.total > 0 && (
                <>
                  <View style={styles.langBarBg}>
                    <View style={[styles.langBarFill, { width: `${pct}%`, backgroundColor: l.c }]} />
                  </View>
                  <Text style={styles.langPct}>{pct}% precisão ({stats.acertos}/{stats.total})</Text>
                </>
              )}
              {stats.total === 0 && (
                <Text style={styles.langNoData}>Ainda não praticado</Text>
              )}
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
  loadWrap: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: SPACING.l },
  loadText: { color: COLORS.textSecondary, marginTop: SPACING.m, fontSize: FONT_SIZES.body },
  errText: { color: COLORS.error, fontSize: FONT_SIZES.body, marginBottom: SPACING.m },
  retryBtn: { backgroundColor: COLORS.neonCyan, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 2 },
  retryText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '700' },
  hud: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  hudLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, backgroundColor: COLORS.panelBg, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 26 },
  playerName: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '700' },
  playerTitle: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', fontWeight: '300' },
  xpSection: { paddingHorizontal: SPACING.l, marginBottom: SPACING.m },
  xpBarBg: { height: 8, backgroundColor: COLORS.xpBarBg, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: COLORS.xpBar, borderRadius: 4 },
  xpText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 4, textAlign: 'right', fontFamily: 'SpaceMono', fontWeight: '300' },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.m, marginBottom: SPACING.l, gap: SPACING.s },
  statCard: { flex: 1, backgroundColor: COLORS.panelBg, borderRadius: 2, padding: SPACING.m, alignItems: 'center', borderWidth: 1, borderColor: COLORS.panelBorder },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h3, fontWeight: '700', fontFamily: 'SpaceMono' },
  statLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 2, fontWeight: '300' },
  accuracyCard: { marginHorizontal: SPACING.l, marginBottom: SPACING.l, backgroundColor: COLORS.panelBg, borderRadius: 2, padding: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder, alignItems: 'center' },
  accuracyLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginBottom: 4, fontWeight: '300' },
  accuracyValue: { fontSize: 32, fontWeight: '700', fontFamily: 'SpaceMono' },
  accuracyDetail: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 4, fontWeight: '300' },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '300', paddingHorizontal: SPACING.l, marginBottom: SPACING.m, fontFamily: 'SpaceMono', letterSpacing: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.m, gap: SPACING.s, marginBottom: SPACING.xl },
  actionCard: { width: '31%', backgroundColor: COLORS.panelBg, borderRadius: 2, padding: SPACING.m, alignItems: 'center', borderWidth: 1, borderColor: COLORS.panelBorder, minHeight: 80, justifyContent: 'center' },
  actionLabel: { color: COLORS.textPrimary, fontSize: FONT_SIZES.tiny, marginTop: 6, textAlign: 'center', fontWeight: '600' },
  langCard: { marginHorizontal: SPACING.l, marginBottom: SPACING.m, backgroundColor: COLORS.panelBg, borderRadius: 2, padding: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  langHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.s },
  langEmoji: { fontSize: 20, marginRight: SPACING.s },
  langName: { fontSize: FONT_SIZES.body, fontWeight: '700', flex: 1 },
  langCount: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, fontWeight: '300' },
  langBarBg: { height: 6, backgroundColor: COLORS.xpBarBg, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  langBarFill: { height: '100%', borderRadius: 3 },
  langPct: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, fontFamily: 'SpaceMono', fontWeight: '300' },
  langNoData: { color: COLORS.textTertiary, fontSize: FONT_SIZES.tiny, fontStyle: 'italic', fontWeight: '300' },
});

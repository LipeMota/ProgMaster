import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/Theme';
import { api } from '../utils/api';

export default function Pomodoro() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleComplete = async () => {
    setRunning(false);
    if (mode === 'work') {
      setCompleted(prev => prev + 1);
      try {
        const uid = await AsyncStorage.getItem('userId');
        if (uid) await api.completePomodoro(uid, 25);
      } catch (e) {}
      setMode('break');
      setSeconds(5 * 60);
    } else {
      setMode('work');
      setSeconds(25 * 60);
    }
  };

  const toggle = () => setRunning(!running);

  const reset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setSeconds(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const pct = mode === 'work' ? ((25 * 60 - seconds) / (25 * 60)) * 100 : ((5 * 60 - seconds) / (5 * 60)) * 100;

  return (
    <SafeAreaView style={styles.container} testID="pomodoro-screen">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={COLORS.neonCyan} /></TouchableOpacity>
        <Text style={styles.title}>🍅 FOCUS POMODORO</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.modeLabel}>{mode === 'work' ? '💻 CÓDIGO' : '☕ PAUSA'}</Text>
        <Text style={styles.modeDesc}>{mode === 'work' ? '25min de foco no código' : '5min de descanso'}</Text>

        <View style={styles.timerCircle}>
          <View style={[styles.progressRing, { borderColor: mode === 'work' ? COLORS.neonCyan : COLORS.neonGreen }]}>
            <Text style={styles.timerText}>{String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: mode === 'work' ? COLORS.neonCyan : COLORS.neonGreen }]} />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity testID="pomo-reset" style={styles.ctrlBtn} onPress={reset}>
            <Ionicons name="refresh" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity testID="pomo-toggle" style={[styles.playBtn, { backgroundColor: running ? COLORS.neonPink : COLORS.neonCyan }]} onPress={toggle}>
            <Ionicons name={running ? 'pause' : 'play'} size={36} color={COLORS.background} />
          </TouchableOpacity>
          <TouchableOpacity testID="pomo-skip" style={styles.ctrlBtn} onPress={handleComplete}>
            <Ionicons name="play-skip-forward" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{completed}</Text>
            <Text style={styles.statLabel}>Sessões</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>+{completed * 15}</Text>
            <Text style={styles.statLabel}>XP Ganho</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>+{completed * 8}</Text>
            <Text style={styles.statLabel}>🪙 Ganho</Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 DICA</Text>
          <Text style={styles.tipText}>25min código + 5min quiz = bônus XP!</Text>
          <Text style={styles.tipText}>Complete sessões para ganhar recompensas extras.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  title: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h3, fontFamily: 'SpaceMono' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.l, paddingTop: SPACING.xl },
  modeLabel: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h2, fontWeight: '800', fontFamily: 'SpaceMono' },
  modeDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, marginTop: SPACING.s, marginBottom: SPACING.xl },
  timerCircle: { marginBottom: SPACING.l },
  progressRing: { width: 200, height: 200, borderRadius: 100, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.panelBg },
  timerText: { color: COLORS.textPrimary, fontSize: 48, fontFamily: 'SpaceMono', fontWeight: '800' },
  progressBar: { width: '80%', height: 6, backgroundColor: COLORS.xpBarBg, borderRadius: 3, marginBottom: SPACING.xl, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xl, marginBottom: SPACING.xl },
  ctrlBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.panelBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.panelBorder },
  playBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: SPACING.m, marginBottom: SPACING.xl },
  statBox: { backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, alignItems: 'center', flex: 1, borderWidth: 1, borderColor: COLORS.panelBorder },
  statVal: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h3, fontWeight: '800', fontFamily: 'SpaceMono' },
  statLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 4 },
  tipBox: { backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, width: '100%', borderWidth: 1, borderColor: COLORS.panelBorder },
  tipTitle: { color: COLORS.neonYellow, fontSize: FONT_SIZES.body, fontWeight: '700', marginBottom: SPACING.s },
  tipText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, lineHeight: 22 },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES } from '../constants/Theme';
import { addXp, addCoins } from '../utils/database';

export default function Pomodoro() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(25 * 60); // 25 minutos
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      handleComplete();
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, seconds]);

  const handleComplete = async () => {
    setIsActive(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (!isBreak) {
      // Pomodoro completado
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          await addXp(userId, 25);
          await addCoins(userId, 5);
          Toast.show({
            type: 'success',
            text1: '🍅 Pomodoro Completo!',
            text2: '+25 XP  +5 💰'
          });
          setCompletedSessions(prev => prev + 1);
        }
      } catch (e: any) {
        console.error('Pomodoro reward error:', e);
      }
      // Iniciar break
      setSeconds(5 * 60); // 5 min break
      setIsBreak(true);
    } else {
      // Break completado
      Toast.show({
        type: 'info',
        text1: '☕ Break Completo!',
        text2: 'Pronto para próximo Pomodoro'
      });
      setSeconds(25 * 60);
      setIsBreak(false);
    }
  };

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
  };

  const reset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
    setSeconds(isBreak ? 5 * 60 : 25 * 60);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}>
          <Ionicons name="close" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>POMODORO</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.mode}>{isBreak ? '☕ BREAK' : '🍅 FOCO'}</Text>
        
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={toggle}>
            <Ionicons 
              name={isActive ? 'pause' : 'play'} 
              size={48} 
              color={COLORS.neonCyan} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={reset}>
            <Ionicons name="refresh" size={32} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedSessions}</Text>
            <Text style={styles.statLabel}>Sessões Completadas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedSessions * 25}</Text>
            <Text style={styles.statLabel}>XP Ganho</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🍅 25 min foco = 25 XP + 5 💰{' \n'}
            ☕ 5 min break automático
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  title: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h3, fontWeight: '700', fontFamily: 'SpaceMono', letterSpacing: 2 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  mode: { color: COLORS.textSecondary, fontSize: FONT_SIZES.h2, marginBottom: SPACING.xl, fontFamily: 'SpaceMono', fontWeight: '300' },
  timerCircle: { width: 280, height: 280, borderRadius: 140, borderWidth: 8, borderColor: COLORS.neonCyan, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  timerText: { color: COLORS.textPrimary, fontSize: 64, fontWeight: '700', fontFamily: 'SpaceMono' },
  controls: { flexDirection: 'row', gap: SPACING.xl, marginBottom: SPACING.xl },
  controlBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.panelBg, borderWidth: 1, borderColor: COLORS.panelBorder, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: SPACING.xl, marginBottom: SPACING.l },
  statItem: { alignItems: 'center' },
  statValue: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h1, fontWeight: '700', fontFamily: 'SpaceMono' },
  statLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 4, fontWeight: '300' },
  infoBox: { backgroundColor: COLORS.panelBg, borderRadius: 2, padding: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  infoText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, textAlign: 'center', lineHeight: 20, fontWeight: '300' },
});

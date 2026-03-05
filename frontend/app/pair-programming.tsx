import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES } from '../constants/Theme';

export default function PairProgramming() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}>
          <Ionicons name="close" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>PAIR PROGRAMMING</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>👥</Text>
        <Text style={styles.comingSoon}>EM BREVE</Text>
        <Text style={styles.description}>
          Colabore com outros desenvolvedores{' \n'}
          para resolver desafios de código{' \n'}
          em tempo real.
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Match automático com parceiros</Text>
          <Text style={styles.featureItem}>• Chat integrado</Text>
          <Text style={styles.featureItem}>• Editor de código colaborativo</Text>
          <Text style={styles.featureItem}>• Recompensas em dupla</Text>
        </View>
        <TouchableOpacity 
          style={styles.notifyBtn}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          }}
        >
          <Ionicons name="notifications-outline" size={20} color={COLORS.background} />
          <Text style={styles.notifyText}>VOLTAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  title: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body, fontWeight: '700', fontFamily: 'SpaceMono', letterSpacing: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emoji: { fontSize: 80, marginBottom: SPACING.l },
  comingSoon: { color: COLORS.neonGreen, fontSize: FONT_SIZES.h2, fontWeight: '700', fontFamily: 'SpaceMono', letterSpacing: 3, marginBottom: SPACING.m },
  description: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl, fontWeight: '300' },
  featureList: { alignItems: 'flex-start', marginBottom: SPACING.xl },
  featureItem: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginBottom: SPACING.s, fontWeight: '300' },
  notifyBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, backgroundColor: COLORS.neonCyan, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 2 },
  notifyText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '700', letterSpacing: 2 },
});

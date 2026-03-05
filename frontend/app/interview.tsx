import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES } from '../constants/Theme';

export default function Interview() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}>
          <Ionicons name="close" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>INTERVIEW PREP</Text>
        <View style={{ width: 28 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.emoji}>💼</Text>
        <Text style={styles.comingSoon}>EM BREVE</Text>
        <Text style={styles.description}>Pratique entrevistas técnicas{' \n'}com IA que simula recrutadores reais</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Perguntas comportamentais + técnicas</Text>
          <Text style={styles.featureItem}>• Feedback personalizado</Text>
          <Text style={styles.featureItem}>• Simulação de FAANG</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.back(); }}>
          <Text style={styles.btnText}>VOLTAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  title: { color: COLORS.neonPurple, fontSize: FONT_SIZES.body, fontWeight: '700', fontFamily: 'SpaceMono', letterSpacing: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emoji: { fontSize: 80, marginBottom: SPACING.l },
  comingSoon: { color: COLORS.neonPurple, fontSize: FONT_SIZES.h2, fontWeight: '700', fontFamily: 'SpaceMono', letterSpacing: 3, marginBottom: SPACING.m },
  description: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl, fontWeight: '300' },
  featureList: { alignItems: 'flex-start', marginBottom: SPACING.xl },
  featureItem: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginBottom: SPACING.s, fontWeight: '300' },
  btn: { backgroundColor: COLORS.neonPurple, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 2 },
  btnText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '700', letterSpacing: 2 },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/Theme';
import { api } from '../utils/api';

export default function Interview() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [category, setCategory] = useState('');
  const cats = [
    { key: 'dotnet', name: '.NET / C#', emoji: '🏙️', color: '#9B4DCA' },
    { key: 'sql', name: 'SQL / Banco', emoji: '🏰', color: '#FF6B35' },
    { key: 'python', name: 'Python', emoji: '🌲', color: '#39FF14' },
    { key: 'java', name: 'Java', emoji: '🏯', color: '#FF003C' },
  ];

  const loadQuestions = async (cat: string) => {
    setLoading(true); setCategory(cat); setCurrentIdx(0); setShowAnswer(false);
    try {
      const qs = await api.getInterviewQuestions(cat, 5);
      setQuestions(qs);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const next = () => {
    if (currentIdx + 1 < questions.length) { setCurrentIdx(prev => prev + 1); setShowAnswer(false); }
  };

  return (
    <SafeAreaView style={styles.container} testID="interview-screen">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={COLORS.neonCyan} /></TouchableOpacity>
        <Text style={styles.title}>💼 SIMULADOR ENTREVISTA</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {!category ? (
          <>
            <Text style={styles.subtitle}>Prepare-se para entrevistas técnicas!</Text>
            {cats.map(c => (
              <TouchableOpacity key={c.key} testID={`int-cat-${c.key}`} style={styles.catCard} onPress={() => loadQuestions(c.key)}>
                <Text style={styles.catEmoji}>{c.emoji}</Text>
                <Text style={[styles.catName, { color: c.color }]}>{c.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </>
        ) : loading ? (
          <ActivityIndicator size="large" color={COLORS.neonCyan} style={{ marginTop: 100 }} />
        ) : questions.length > 0 ? (
          <>
            <TouchableOpacity style={styles.backBtn} onPress={() => setCategory('')}>
              <Ionicons name="arrow-back" size={16} color={COLORS.neonCyan} /><Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.counter}>{currentIdx + 1}/{questions.length}</Text>
            <View style={styles.qCard}>
              <Text style={styles.qLabel}>PERGUNTA:</Text>
              <Text style={styles.qText}>{questions[currentIdx]?.question}</Text>
            </View>
            {showAnswer ? (
              <View style={styles.ansCard}>
                <Text style={styles.ansLabel}>RESPOSTA IDEAL:</Text>
                <Text style={styles.ansText}>{questions[currentIdx]?.answer}</Text>
              </View>
            ) : (
              <TouchableOpacity testID="show-answer-btn" style={styles.showBtn} onPress={() => setShowAnswer(true)}>
                <Text style={styles.showBtnText}>👁️ MOSTRAR RESPOSTA</Text>
              </TouchableOpacity>
            )}
            {currentIdx + 1 < questions.length && (
              <TouchableOpacity testID="next-interview-btn" style={styles.nextBtn} onPress={next}>
                <Text style={styles.nextBtnText}>PRÓXIMA PERGUNTA →</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.emptyText}>Nenhuma pergunta encontrada</Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  title: { color: COLORS.neonPurple, fontSize: FONT_SIZES.h3, fontFamily: 'SpaceMono' },
  subtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, marginBottom: SPACING.m },
  scroll: { padding: SPACING.l },
  catCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, marginBottom: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  catEmoji: { fontSize: 28, marginRight: SPACING.m },
  catName: { flex: 1, fontSize: FONT_SIZES.h3, fontWeight: '700', fontFamily: 'SpaceMono' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: SPACING.m },
  backText: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small },
  counter: { color: COLORS.neonCyan, fontFamily: 'SpaceMono', fontSize: FONT_SIZES.body, textAlign: 'center', marginBottom: SPACING.m },
  qCard: { backgroundColor: COLORS.panelBg, borderRadius: 16, padding: SPACING.l, marginBottom: SPACING.l, borderWidth: 1, borderColor: COLORS.panelBorder },
  qLabel: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', marginBottom: SPACING.s },
  qText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, lineHeight: 28 },
  ansCard: { backgroundColor: COLORS.neonGreen + '10', borderRadius: 16, padding: SPACING.l, borderWidth: 1, borderColor: COLORS.neonGreen + '30', marginBottom: SPACING.m },
  ansLabel: { color: COLORS.neonGreen, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', marginBottom: SPACING.s },
  ansText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, lineHeight: 24 },
  showBtn: { backgroundColor: COLORS.neonPurple + '20', borderRadius: 8, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.neonPurple + '40', marginBottom: SPACING.m },
  showBtnText: { color: COLORS.neonPurple, fontSize: FONT_SIZES.body, fontWeight: '700' },
  nextBtn: { backgroundColor: COLORS.neonCyan, borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '800' },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xxl },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/Theme';
import { api } from '../utils/api';

export default function BugHunt() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState('');

  const loadChallenge = async (lang: string) => {
    setLoading(true); setSelectedLang(lang);
    setSelected(null); setResult(null);
    try {
      const c = await api.getBugHunt(lang, 2);
      setChallenge(c);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!challenge || selected === null) return;
    setLoading(true);
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (uid) {
        const r = await api.submitAnswer(uid, challenge.id, selected);
        setResult(r);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const langs = [
    { key: 'csharp', name: 'C#', emoji: '🏙️', color: '#9B4DCA' },
    { key: 'sql', name: 'SQL', emoji: '🏰', color: '#FF6B35' },
    { key: 'python', name: 'Python', emoji: '🌲', color: '#39FF14' },
    { key: 'java', name: 'Java', emoji: '🏯', color: '#FF003C' },
  ];

  return (
    <SafeAreaView style={styles.container} testID="bug-hunt-screen">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={COLORS.neonCyan} /></TouchableOpacity>
        <Text style={styles.title}>🐛 BUG HUNT ARENA</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {!selectedLang ? (
          <>
            <Text style={styles.subtitle}>Encontre bugs em código real!</Text>
            {langs.map(l => (
              <TouchableOpacity key={l.key} testID={`bh-lang-${l.key}`} style={styles.langCard} onPress={() => loadChallenge(l.key)}>
                <Text style={styles.langEmoji}>{l.emoji}</Text>
                <Text style={[styles.langName, { color: l.color }]}>{l.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </>
        ) : loading ? (
          <ActivityIndicator size="large" color={COLORS.neonCyan} style={{ marginTop: 100 }} />
        ) : challenge ? (
          <>
            <TouchableOpacity style={styles.backBtn} onPress={() => { setSelectedLang(''); setChallenge(null); }}>
              <Ionicons name="arrow-back" size={16} color={COLORS.neonCyan} /><Text style={styles.backText}>Trocar linguagem</Text>
            </TouchableOpacity>
            <Text style={styles.qText}>{challenge.question}</Text>
            {challenge.code_snippet && (
              <View style={styles.codeBlock}><Text style={styles.codeText}>{challenge.code_snippet}</Text></View>
            )}
            {challenge.options?.map((opt: string, i: number) => (
              <TouchableOpacity key={i} testID={`bh-option-${i}`}
                style={[styles.optionBtn, selected === String(i) && styles.optionSelected,
                  result && result.correct_answer === String(i) && styles.optionCorrect,
                  result && selected === String(i) && !result.correct && styles.optionWrong]}
                onPress={() => !result && setSelected(String(i))} disabled={!!result}>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
            {result && (
              <View style={[styles.feedbackBox, result.correct ? styles.fbCorrect : styles.fbWrong]}>
                <Text style={styles.fbTitle}>{result.correct ? '✅ Bug encontrado!' : '❌ Não é esse bug'}</Text>
                <Text style={styles.fbExpl}>{result.explanation}</Text>
              </View>
            )}
            {!result ? (
              <TouchableOpacity testID="bh-submit" style={[styles.submitBtn, !selected && styles.disabled]} onPress={submitAnswer} disabled={!selected}>
                <Text style={styles.submitText}>CONFIRMAR</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity testID="bh-next" style={styles.submitBtn} onPress={() => loadChallenge(selectedLang)}>
                <Text style={styles.submitText}>PRÓXIMO BUG →</Text>
              </TouchableOpacity>
            )}
          </>
        ) : null}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  title: { color: COLORS.neonPink, fontSize: FONT_SIZES.h3, fontFamily: 'SpaceMono' },
  subtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, marginBottom: SPACING.m },
  scroll: { padding: SPACING.l },
  langCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, marginBottom: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  langEmoji: { fontSize: 28, marginRight: SPACING.m },
  langName: { flex: 1, fontSize: FONT_SIZES.h3, fontWeight: '700', fontFamily: 'SpaceMono' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: SPACING.m },
  backText: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small },
  qText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, lineHeight: 24, marginBottom: SPACING.m },
  codeBlock: { backgroundColor: COLORS.codeBg, borderRadius: 8, padding: SPACING.m, marginBottom: SPACING.l, borderWidth: 1, borderColor: COLORS.panelBorder },
  codeText: { color: COLORS.neonGreen, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', lineHeight: 20 },
  optionBtn: { backgroundColor: COLORS.panelBg, borderRadius: 10, padding: SPACING.m, marginBottom: SPACING.s, borderWidth: 1, borderColor: COLORS.panelBorder },
  optionSelected: { borderColor: COLORS.neonCyan },
  optionCorrect: { borderColor: COLORS.neonGreen, backgroundColor: COLORS.neonGreen + '15' },
  optionWrong: { borderColor: COLORS.neonPink, backgroundColor: COLORS.neonPink + '15' },
  optionText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.small },
  feedbackBox: { borderRadius: 12, padding: SPACING.m, marginVertical: SPACING.m },
  fbCorrect: { backgroundColor: COLORS.neonGreen + '15', borderWidth: 1, borderColor: COLORS.neonGreen + '40' },
  fbWrong: { backgroundColor: COLORS.neonPink + '15', borderWidth: 1, borderColor: COLORS.neonPink + '40' },
  fbTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '700' },
  fbExpl: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginTop: SPACING.s, lineHeight: 20 },
  submitBtn: { backgroundColor: COLORS.neonCyan, borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '800' },
  disabled: { opacity: 0.4 },
});

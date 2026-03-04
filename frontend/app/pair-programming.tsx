import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/Theme';
import { api } from '../utils/api';

export default function PairProgramming() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [selectedLang, setSelectedLang] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => { loadUserId(); }, []);

  const loadUserId = async () => {
    const uid = await AsyncStorage.getItem('userId');
    if (uid) setUserId(uid);
    setLoading(false);
  };

  const loadChallenge = async (lang: string) => {
    setLoading(true);
    setSelectedLang(lang);
    try {
      const c = await api.getPairChallenge(lang, 1);
      setChallenge(c);
      setCode(c.starter_code || '');
      setResult(null);
      setHintsUsed(0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const useHint = () => {
    if (!challenge?.hints || hintsUsed >= challenge.hints.length) return;
    setHintsUsed(prev => prev + 1);
  };

  const submit = async () => {
    if (!challenge || !userId) return;
    setLoading(true);
    try {
      const r = await api.validatePair(userId, challenge.id, code);
      setResult(r);
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
    <SafeAreaView style={styles.container} testID="pair-programming-screen">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.neonCyan} />
          </TouchableOpacity>
          <Text style={styles.title}>👥 PAIR PROGRAMMING</Text>
          <View style={{ width: 24 }} />
        </View>

        {!selectedLang ? (
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.subtitle}>Escolha a linguagem para o desafio:</Text>
            {langs.map(l => (
              <TouchableOpacity key={l.key} testID={`pair-lang-${l.key}`} style={styles.langCard} onPress={() => loadChallenge(l.key)}>
                <Text style={styles.langEmoji}>{l.emoji}</Text>
                <Text style={[styles.langName, { color: l.color }]}>{l.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : loading ? (
          <View style={styles.loadWrap}><ActivityIndicator size="large" color={COLORS.neonCyan} /></View>
        ) : challenge ? (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.backLangBtn} onPress={() => { setSelectedLang(''); setChallenge(null); }}>
              <Ionicons name="arrow-back" size={16} color={COLORS.neonCyan} />
              <Text style={styles.backLangText}>Trocar linguagem</Text>
            </TouchableOpacity>

            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDesc}>{challenge.description}</Text>

            <View style={styles.codeEditor}>
              <Text style={styles.editorLabel}>📝 SEU CÓDIGO:</Text>
              <TextInput
                testID="pair-code-editor"
                style={styles.editorInput}
                multiline
                value={code}
                onChangeText={setCode}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {/* Hints */}
            {challenge.hints && challenge.hints.length > 0 && (
              <View style={styles.hintsSection}>
                <TouchableOpacity testID="use-hint-btn" style={styles.hintBtn} onPress={useHint} disabled={hintsUsed >= challenge.hints.length}>
                  <Text style={styles.hintBtnText}>💡 Usar Dica ({hintsUsed}/{challenge.hints.length})</Text>
                </TouchableOpacity>
                {challenge.hints.slice(0, hintsUsed).map((h: string, i: number) => (
                  <Text key={i} style={styles.hintText}>Dica {i + 1}: {h}</Text>
                ))}
              </View>
            )}

            {result && (
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>✅ {result.message}</Text>
                <Text style={styles.resultReward}>+{result.xp_earned} XP  +{result.coins_earned} 🪙</Text>
                <Text style={styles.resultFeedback}>{result.feedback}</Text>
              </View>
            )}

            {!result && (
              <TouchableOpacity testID="pair-submit-btn" style={styles.submitBtn} onPress={submit}>
                <Text style={styles.submitText}>ENVIAR CÓDIGO</Text>
              </TouchableOpacity>
            )}

            {challenge.solution && result && (
              <View style={styles.solutionBox}>
                <Text style={styles.solutionLabel}>📖 SOLUÇÃO:</Text>
                <Text style={styles.solutionCode}>{challenge.solution}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.newBtn} onPress={() => loadChallenge(selectedLang)}>
              <Text style={styles.newBtnText}>🔄 NOVO DESAFIO</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  title: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h3, fontFamily: 'SpaceMono', letterSpacing: 1 },
  subtitle: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, marginBottom: SPACING.m },
  scroll: { padding: SPACING.l },
  langCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, marginBottom: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  langEmoji: { fontSize: 28, marginRight: SPACING.m },
  langName: { flex: 1, fontSize: FONT_SIZES.h3, fontWeight: '700', fontFamily: 'SpaceMono' },
  backLangBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: SPACING.m },
  backLangText: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small },
  challengeTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h2, fontWeight: '800', marginBottom: SPACING.s },
  challengeDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, lineHeight: 22, marginBottom: SPACING.l },
  codeEditor: { marginBottom: SPACING.m },
  editorLabel: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', marginBottom: SPACING.s },
  editorInput: { backgroundColor: COLORS.codeBg, borderRadius: 8, padding: SPACING.m, color: COLORS.neonGreen, fontFamily: 'SpaceMono', fontSize: FONT_SIZES.small, minHeight: 180, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.panelBorder, lineHeight: 22 },
  hintsSection: { marginBottom: SPACING.m },
  hintBtn: { backgroundColor: COLORS.neonYellow + '20', borderRadius: 8, padding: SPACING.m, marginBottom: SPACING.s, borderWidth: 1, borderColor: COLORS.neonYellow + '40' },
  hintBtnText: { color: COLORS.neonYellow, fontSize: FONT_SIZES.small, fontWeight: '600' },
  hintText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginLeft: SPACING.m, marginBottom: 4, fontStyle: 'italic' },
  resultBox: { backgroundColor: COLORS.neonGreen + '15', borderRadius: 12, padding: SPACING.m, borderWidth: 1, borderColor: COLORS.neonGreen + '40', marginBottom: SPACING.m },
  resultTitle: { color: COLORS.neonGreen, fontSize: FONT_SIZES.body, fontWeight: '700' },
  resultReward: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', marginTop: SPACING.s },
  resultFeedback: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginTop: SPACING.s },
  submitBtn: { backgroundColor: COLORS.neonCyan, borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: SPACING.m },
  submitText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '800', letterSpacing: 1 },
  solutionBox: { backgroundColor: COLORS.codeBg, borderRadius: 8, padding: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder, marginBottom: SPACING.m },
  solutionLabel: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', marginBottom: SPACING.s },
  solutionCode: { color: COLORS.neonGreen, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', lineHeight: 20 },
  newBtn: { backgroundColor: COLORS.panelBg, borderRadius: 8, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.panelBorder },
  newBtnText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '600' },
});

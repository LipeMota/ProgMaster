import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/Theme';
import { api } from '../utils/api';

export default function QuizPlay() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { language, type, userId } = params as { language: string; type: string; userId: string };

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [codeAnswer, setCodeAnswer] = useState('');
  const [result, setResult] = useState<any>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0, xp: 0, coins: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => { startQuiz(); }, []);

  const startQuiz = async () => {
    try {
      const data = await api.startQuiz(userId, language, type === 'mixed' ? 'mcq' : type, 10);
      setQuestions(data.questions || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (submitting) return;
    const q = questions[currentIdx];
    const ans = q.type === 'code_complete' ? codeAnswer : selected;
    if (!ans && ans !== '0') return;
    setSubmitting(true);
    try {
      const r = await api.submitAnswer(userId, q.id, ans || '');
      setResult(r);
      setScore(prev => ({
        correct: prev.correct + (r.correct ? 1 : 0),
        wrong: prev.wrong + (r.correct ? 0 : 1),
        xp: prev.xp + (r.xp_earned || 0),
        coins: prev.coins + (r.coins_earned || 0),
      }));
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
      setCodeAnswer('');
      setResult(null);
    }
  };

  if (loading) return <View style={styles.loadWrap}><ActivityIndicator size="large" color={COLORS.neonCyan} /></View>;
  if (questions.length === 0) return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.errorText}>Nenhuma questão encontrada</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  if (finished) {
    const pct = Math.round((score.correct / questions.length) * 100);
    return (
      <SafeAreaView style={styles.container} testID="quiz-results">
        <ScrollView contentContainerStyle={styles.resultsWrap}>
          <Text style={styles.resultsEmoji}>{pct >= 70 ? '🏆' : pct >= 40 ? '⭐' : '💪'}</Text>
          <Text style={styles.resultsTitle}>QUIZ COMPLETO!</Text>
          <Text style={styles.resultsPct}>{pct}%</Text>
          <View style={styles.resultsRow}>
            <View style={styles.resultBox}>
              <Text style={styles.resultVal}>{score.correct}</Text>
              <Text style={styles.resultLabel}>Corretas</Text>
            </View>
            <View style={styles.resultBox}>
              <Text style={[styles.resultVal, { color: COLORS.neonPink }]}>{score.wrong}</Text>
              <Text style={styles.resultLabel}>Erradas</Text>
            </View>
          </View>
          <View style={styles.rewardsBox}>
            <Text style={styles.rewardLine}>+{score.xp} XP ganho</Text>
            <Text style={styles.rewardLine}>+{score.coins} 🪙 CodeCoins</Text>
          </View>
          <TouchableOpacity testID="quiz-finish-btn" style={styles.finishBtn} onPress={() => router.back()}>
            <Text style={styles.finishBtnText}>VOLTAR</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = questions[currentIdx];
  const langNames: Record<string, string> = { csharp: 'C#', sql: 'SQL', python: 'Python', java: 'Java' };

  return (
    <SafeAreaView style={styles.container} testID="quiz-play-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity testID="quiz-close-btn" onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{langNames[language] || language} Quiz</Text>
        <Text style={styles.counter}>{currentIdx + 1}/{questions.length}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${((currentIdx + 1) / questions.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Question */}
        <View style={styles.questionCard}>
          <View style={styles.qMeta}>
            <Text style={styles.qType}>{q.type === 'mcq' ? '🧠 MCQ' : q.type === 'code_complete' ? '💻 Código' : '🐛 Bug'}</Text>
            <Text style={styles.qDiff}>{'⭐'.repeat(q.difficulty || 1)}</Text>
          </View>
          <Text style={styles.qText}>{q.question}</Text>
          {q.code_snippet ? (
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{q.code_snippet}</Text>
            </View>
          ) : null}
        </View>

        {/* MCQ Options */}
        {(q.type === 'mcq' || q.type === 'bug_hunt') && q.options?.map((opt: string, i: number) => {
          const idx = String(i);
          const isSelected = selected === idx;
          const isCorrect = result && result.correct_answer === idx;
          const isWrong = result && isSelected && !result.correct;
          return (
            <TouchableOpacity
              key={i}
              testID={`option-${i}`}
              style={[styles.optionBtn, isSelected && !result && styles.optionSelected,
                result && isCorrect && styles.optionCorrect, isWrong && styles.optionWrong]}
              onPress={() => !result && setSelected(idx)}
              disabled={!!result}
            >
              <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Code Complete Input */}
        {q.type === 'code_complete' && !result && (
          <View style={styles.codeInputWrap}>
            <TextInput
              testID="code-answer-input"
              style={styles.codeInput}
              placeholder="Digite sua resposta..."
              placeholderTextColor={COLORS.textSecondary}
              value={codeAnswer}
              onChangeText={setCodeAnswer}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Result Feedback */}
        {result && (
          <View style={[styles.feedbackBox, result.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackTitle}>{result.correct ? '✅ CORRETO!' : '❌ INCORRETO'}</Text>
            {!result.correct && <Text style={styles.feedbackAnswer}>Resposta: {result.correct_answer}</Text>}
            <Text style={styles.feedbackExpl}>{result.explanation}</Text>
            {result.correct && <Text style={styles.feedbackReward}>+{result.xp_earned} XP  +{result.coins_earned} 🪙</Text>}
          </View>
        )}

        {/* Action Button */}
        {!result ? (
          <TouchableOpacity
            testID="submit-answer-btn"
            style={[styles.actionBtn, (!selected && !codeAnswer) && styles.disabledBtn]}
            onPress={submitAnswer}
            disabled={(!selected && !codeAnswer) || submitting}
          >
            {submitting ? <ActivityIndicator color={COLORS.background} /> : <Text style={styles.actionBtnText}>CONFIRMAR</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity testID="next-question-btn" style={styles.actionBtn} onPress={nextQuestion}>
            <Text style={styles.actionBtnText}>{currentIdx + 1 >= questions.length ? 'VER RESULTADO' : 'PRÓXIMA →'}</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadWrap: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.error, textAlign: 'center', marginTop: 100, fontSize: FONT_SIZES.body },
  backBtn: { alignSelf: 'center', marginTop: SPACING.l, padding: SPACING.m },
  backBtnText: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '700', fontFamily: 'SpaceMono' },
  counter: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body, fontFamily: 'SpaceMono' },
  progressBarBg: { height: 4, backgroundColor: COLORS.xpBarBg, marginHorizontal: SPACING.l },
  progressBarFill: { height: '100%', backgroundColor: COLORS.neonCyan, borderRadius: 2 },
  scroll: { padding: SPACING.l },
  questionCard: { backgroundColor: COLORS.panelBg, borderRadius: 16, padding: SPACING.l, marginBottom: SPACING.l, borderWidth: 1, borderColor: COLORS.panelBorder },
  qMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.m },
  qType: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono' },
  qDiff: { fontSize: FONT_SIZES.small },
  qText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, lineHeight: 24 },
  codeBlock: { backgroundColor: COLORS.codeBg, borderRadius: 8, padding: SPACING.m, marginTop: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  codeText: { color: COLORS.neonGreen, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', lineHeight: 20 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, marginBottom: SPACING.s, borderWidth: 1, borderColor: COLORS.panelBorder },
  optionSelected: { borderColor: COLORS.neonCyan, backgroundColor: COLORS.neonCyan + '10' },
  optionCorrect: { borderColor: COLORS.neonGreen, backgroundColor: COLORS.neonGreen + '15' },
  optionWrong: { borderColor: COLORS.neonPink, backgroundColor: COLORS.neonPink + '15' },
  optionLetter: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body, fontWeight: '800', fontFamily: 'SpaceMono', width: 28 },
  optionText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.small, flex: 1 },
  codeInputWrap: { marginBottom: SPACING.m },
  codeInput: { backgroundColor: COLORS.codeBg, borderRadius: 8, padding: SPACING.m, color: COLORS.neonGreen, fontFamily: 'SpaceMono', fontSize: FONT_SIZES.body, borderWidth: 1, borderColor: COLORS.panelBorder },
  feedbackBox: { borderRadius: 12, padding: SPACING.m, marginBottom: SPACING.m },
  feedbackCorrect: { backgroundColor: COLORS.neonGreen + '15', borderWidth: 1, borderColor: COLORS.neonGreen + '40' },
  feedbackWrong: { backgroundColor: COLORS.neonPink + '15', borderWidth: 1, borderColor: COLORS.neonPink + '40' },
  feedbackTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '800', marginBottom: SPACING.s },
  feedbackAnswer: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, marginBottom: SPACING.s, fontFamily: 'SpaceMono' },
  feedbackExpl: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, lineHeight: 20 },
  feedbackReward: { color: COLORS.neonGreen, fontSize: FONT_SIZES.small, marginTop: SPACING.s, fontFamily: 'SpaceMono' },
  actionBtn: { backgroundColor: COLORS.neonCyan, borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: SPACING.s },
  actionBtnText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '800', letterSpacing: 1 },
  disabledBtn: { opacity: 0.4 },
  resultsWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  resultsEmoji: { fontSize: 64, marginBottom: SPACING.m },
  resultsTitle: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h1, fontWeight: '800', fontFamily: 'SpaceMono', letterSpacing: 2 },
  resultsPct: { color: COLORS.textPrimary, fontSize: 60, fontWeight: '800', fontFamily: 'SpaceMono', marginVertical: SPACING.l },
  resultsRow: { flexDirection: 'row', gap: SPACING.xl, marginBottom: SPACING.l },
  resultBox: { alignItems: 'center' },
  resultVal: { color: COLORS.neonGreen, fontSize: FONT_SIZES.h1, fontWeight: '800', fontFamily: 'SpaceMono' },
  resultLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small },
  rewardsBox: { backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.l, alignItems: 'center', borderWidth: 1, borderColor: COLORS.panelBorder, marginBottom: SPACING.xl },
  rewardLine: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body, fontFamily: 'SpaceMono', marginVertical: 4 },
  finishBtn: { backgroundColor: COLORS.neonCyan, borderRadius: 8, paddingVertical: 16, paddingHorizontal: 48 },
  finishBtnText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '800', letterSpacing: 1 },
});

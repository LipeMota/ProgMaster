import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES } from '../constants/Theme';
import { getRandomQuestions } from '../utils/mockData';
import { saveQuizResult } from '../utils/database';

export default function QuizPlay() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { language } = params as { language: string };

  const [userId, setUserId] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => { startQuiz(); }, []);

  const startQuiz = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Usuário não encontrado' });
        router.replace('/');
        return;
      }
      setUserId(uid);
      const qs = getRandomQuestions(language, 10);
      if (qs.length === 0) {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Nenhuma questão disponível' });
        router.back();
        return;
      }
      setQuestions(qs);
    } catch (e: any) {
      console.error('Quiz start error:', e);
      Toast.show({ type: 'error', text1: 'Erro ao iniciar', text2: e.message });
    }
    setLoading(false);
  };

  const submitAnswer = () => {
    if (!selected) return;
    const q = questions[currentIdx];
    const isCorrect = q.options[parseInt(selected)] === q.correct_answer;
    
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    
    setResult({ 
      correct: isCorrect, 
      correct_answer: q.correct_answer,
      selected_answer: q.options[parseInt(selected)]
    });
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
    }));
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      finishQuiz();
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelected(null);
      setResult(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const finishQuiz = async () => {
    try {
      const rewards = await saveQuizResult(userId, language, score.correct, questions.length);
      Toast.show({
        type: 'success',
        text1: 'Quiz Completo!',
        text2: `+${rewards.xpGained} XP  +${rewards.coinsGained} 💰`
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFinished(true);
    } catch (e: any) {
      console.error('Quiz finish error:', e);
      Toast.show({ type: 'error', text1: 'Erro ao salvar', text2: e.message });
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadWrap}>
        <ActivityIndicator size="large" color={COLORS.neonCyan} />
        <Text style={styles.loadText}>Carregando questões...</Text>
      </View>
    );
  }

  if (finished) {
    const pct = Math.round((score.correct / questions.length) * 100);
    const xpGained = score.correct * 10;
    const coinsGained = score.correct * 2;
    
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
            <Text style={styles.rewardLine}>+{xpGained} XP ganho</Text>
            <Text style={styles.rewardLine}>+{coinsGained} 💰 Coins</Text>
          </View>
          <TouchableOpacity 
            testID="quiz-finish-btn" 
            style={styles.finishBtn} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }}
          >
            <Text style={styles.finishBtnText}>VOLTAR</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = questions[currentIdx];
  const langNames: Record<string, string> = { 
    csharp: 'C#', 
    sql: 'SQL', 
    python: 'Python', 
    java: 'Java' 
  };

  return (
    <SafeAreaView style={styles.container} testID="quiz-play-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          testID="quiz-close-btn" 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="close" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{langNames[language] || language} Quiz</Text>
        <Text style={styles.counter}>{currentIdx + 1}/{questions.length}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${((currentIdx + 1) / questions.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <View style={styles.questionCard}>
          <View style={styles.qMeta}>
            <Text style={styles.qType}>🧠 MCQ</Text>
            <Text style={styles.qDiff}>{'⭐'.repeat(q.difficulty || 1)}</Text>
          </View>
          <Text style={styles.qText}>{q.question}</Text>
          {q.category && (
            <Text style={styles.qCategory}>Categoria: {q.category}</Text>
          )}
        </View>

        {/* MCQ Options */}
        {q.options?.map((opt: string, i: number) => {
          const idx = String(i);
          const isSelected = selected === idx;
          const isCorrect = result && opt === q.correct_answer;
          const isWrong = result && isSelected && !result.correct;
          
          return (
            <TouchableOpacity
              key={i}
              testID={`option-${i}`}
              style={[
                styles.optionBtn, 
                isSelected && !result && styles.optionSelected,
                result && isCorrect && styles.optionCorrect, 
                isWrong && styles.optionWrong
              ]}
              onPress={() => {
                if (!result) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelected(idx);
                }
              }}
              disabled={!!result}
            >
              <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
              <Text style={styles.optionText}>{opt}</Text>
              {result && isCorrect && <Ionicons name="checkmark-circle" size={24} color={COLORS.neonGreen} />}
              {isWrong && <Ionicons name="close-circle" size={24} color={COLORS.neonPink} />}
            </TouchableOpacity>
          );
        })}

        {/* Result Feedback */}
        {result && (
          <View style={[styles.feedbackBox, result.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackTitle}>{result.correct ? '✅ CORRETO!' : '❌ INCORRETO'}</Text>
            {!result.correct && (
              <Text style={styles.feedbackAnswer}>
                Resposta correta: {result.correct_answer}
              </Text>
            )}
            <Text style={styles.feedbackReward}>
              {result.correct ? '+10 XP  +2 💰' : '+0 XP'}
            </Text>
          </View>
        )}

        {/* Action Button */}
        {!result ? (
          <TouchableOpacity
            testID="submit-answer-btn"
            style={[styles.actionBtn, !selected && styles.disabledBtn]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              submitAnswer();
            }}
            disabled={!selected}
          >
            <Text style={styles.actionBtnText}>CONFIRMAR</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            testID="next-question-btn" 
            style={styles.actionBtn} 
            onPress={nextQuestion}
          >
            <Text style={styles.actionBtnText}>
              {currentIdx + 1 >= questions.length ? 'VER RESULTADO' : 'PRÓXIMA →'}
            </Text>
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
  loadText: { color: COLORS.textSecondary, marginTop: SPACING.m, fontSize: FONT_SIZES.body, fontWeight: '300' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '700', fontFamily: 'SpaceMono' },
  counter: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body, fontFamily: 'SpaceMono', fontWeight: '300' },
  progressBarBg: { height: 4, backgroundColor: COLORS.xpBarBg, marginHorizontal: SPACING.l },
  progressBarFill: { height: '100%', backgroundColor: COLORS.neonCyan, borderRadius: 2 },
  scroll: { padding: SPACING.l },
  questionCard: { backgroundColor: COLORS.panelBg, borderRadius: 2, padding: SPACING.l, marginBottom: SPACING.l, borderWidth: 1, borderColor: COLORS.panelBorder },
  qMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.m },
  qType: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', fontWeight: '300' },
  qDiff: { fontSize: FONT_SIZES.small },
  qText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, lineHeight: 24, fontWeight: '400' },
  qCategory: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: SPACING.s, fontWeight: '300' },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderRadius: 2, padding: SPACING.m, marginBottom: SPACING.s, borderWidth: 1, borderColor: COLORS.panelBorder },
  optionSelected: { borderColor: COLORS.neonCyan, backgroundColor: COLORS.neonCyan + '10' },
  optionCorrect: { borderColor: COLORS.neonGreen, backgroundColor: COLORS.neonGreen + '15' },
  optionWrong: { borderColor: COLORS.neonPink, backgroundColor: COLORS.neonPink + '15' },
  optionLetter: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body, fontWeight: '700', fontFamily: 'SpaceMono', width: 28 },
  optionText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.small, flex: 1, fontWeight: '400' },
  feedbackBox: { borderRadius: 2, padding: SPACING.m, marginBottom: SPACING.m },
  feedbackCorrect: { backgroundColor: COLORS.neonGreen + '15', borderWidth: 1, borderColor: COLORS.neonGreen + '40' },
  feedbackWrong: { backgroundColor: COLORS.neonPink + '15', borderWidth: 1, borderColor: COLORS.neonPink + '40' },
  feedbackTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '700', marginBottom: SPACING.s },
  feedbackAnswer: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, marginBottom: SPACING.s, fontFamily: 'SpaceMono', fontWeight: '300' },
  feedbackReward: { color: COLORS.neonGreen, fontSize: FONT_SIZES.small, marginTop: SPACING.s, fontFamily: 'SpaceMono', fontWeight: '600' },
  actionBtn: { backgroundColor: COLORS.neonCyan, borderRadius: 2, paddingVertical: 16, alignItems: 'center', marginTop: SPACING.s },
  actionBtnText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '700', letterSpacing: 2 },
  disabledBtn: { opacity: 0.3 },
  resultsWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  resultsEmoji: { fontSize: 64, marginBottom: SPACING.m },
  resultsTitle: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h1, fontWeight: '700', fontFamily: 'SpaceMono', letterSpacing: 2 },
  resultsPct: { color: COLORS.textPrimary, fontSize: 60, fontWeight: '700', fontFamily: 'SpaceMono', marginVertical: SPACING.l },
  resultsRow: { flexDirection: 'row', gap: SPACING.xl, marginBottom: SPACING.l },
  resultBox: { alignItems: 'center' },
  resultVal: { color: COLORS.neonGreen, fontSize: FONT_SIZES.h1, fontWeight: '700', fontFamily: 'SpaceMono' },
  resultLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, fontWeight: '300' },
  rewardsBox: { backgroundColor: COLORS.panelBg, borderRadius: 2, padding: SPACING.l, alignItems: 'center', borderWidth: 1, borderColor: COLORS.panelBorder, marginBottom: SPACING.xl },
  rewardLine: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body, fontFamily: 'SpaceMono', marginVertical: 4, fontWeight: '300' },
  finishBtn: { backgroundColor: COLORS.neonCyan, borderRadius: 2, paddingVertical: 16, paddingHorizontal: 48 },
  finishBtnText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '700', letterSpacing: 2 },
});

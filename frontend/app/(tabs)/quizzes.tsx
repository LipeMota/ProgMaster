import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/Theme';
import { api } from '../../utils/api';

const LANG_INFO: Record<string, { name: string; emoji: string; color: string }> = {
  csharp: { name: 'C#', emoji: '🏙️', color: '#9B4DCA' },
  sql: { name: 'SQL', emoji: '🏰', color: '#FF6B35' },
  python: { name: 'Python', emoji: '🌲', color: '#39FF14' },
  java: { name: 'Java', emoji: '🏯', color: '#FF003C' },
};

const QUIZ_TYPES = [
  { key: 'mcq', label: 'Múltipla Escolha', emoji: '🧠', desc: 'Escolha a resposta correta' },
  { key: 'code_complete', label: 'Completar Código', emoji: '💻', desc: 'Preencha o código que falta' },
  { key: 'bug_hunt', label: 'Caça Bugs', emoji: '🐛', desc: 'Encontre erros no código' },
  { key: 'mixed', label: 'Mix Aleatório', emoji: '🎲', desc: 'Todos os tipos misturados' },
];

export default function Quizzes() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedLang, setSelectedLang] = useState<string>(params.language as string || '');
  const [counts, setCounts] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (uid) {
        setUserId(uid);
        const c = await api.getQuestionCounts();
        setCounts(c);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadCategories = async (lang: string) => {
    try {
      const cats = await api.getCategories(lang);
      setCategories(cats);
    } catch (e) { console.error(e); }
  };

  const selectLanguage = (lang: string) => {
    setSelectedLang(lang);
    loadCategories(lang);
  };

  const startQuiz = (type: string) => {
    router.push({ pathname: '/quiz-play', params: { language: selectedLang, type, userId } });
  };

  if (loading) return <View style={styles.loadWrap}><ActivityIndicator size="large" color={COLORS.neonCyan} /></View>;

  return (
    <SafeAreaView style={styles.container} testID="quizzes-screen">
      <Text style={styles.title}>🧠 QUIZZES</Text>

      {!selectedLang ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionTitle}>Escolha a Linguagem</Text>
          {Object.entries(LANG_INFO).map(([key, info]) => {
            const langCount = counts?.by_language?.[key]?.total || 0;
            return (
              <TouchableOpacity key={key} testID={`lang-${key}`} style={styles.langCard} onPress={() => selectLanguage(key)}>
                <Text style={styles.langEmoji}>{info.emoji}</Text>
                <View style={styles.langInfo}>
                  <Text style={[styles.langName, { color: info.color }]}>{info.name}</Text>
                  <Text style={styles.langCount}>{langCount} questões disponíveis</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity testID="back-to-langs" style={styles.backBtn} onPress={() => { setSelectedLang(''); setCategories([]); }}>
            <Ionicons name="arrow-back" size={20} color={COLORS.neonCyan} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.selectedHeader}>
            <Text style={styles.selectedEmoji}>{LANG_INFO[selectedLang]?.emoji}</Text>
            <Text style={[styles.selectedName, { color: LANG_INFO[selectedLang]?.color }]}>
              {LANG_INFO[selectedLang]?.name}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Tipo de Quiz</Text>
          {QUIZ_TYPES.map(qt => (
            <TouchableOpacity key={qt.key} testID={`quiz-type-${qt.key}`} style={styles.typeCard} onPress={() => startQuiz(qt.key)}>
              <Text style={styles.typeEmoji}>{qt.emoji}</Text>
              <View style={styles.typeInfo}>
                <Text style={styles.typeLabel}>{qt.label}</Text>
                <Text style={styles.typeDesc}>{qt.desc}</Text>
              </View>
              <Ionicons name="play-circle" size={28} color={COLORS.neonCyan} />
            </TouchableOpacity>
          ))}

          {categories.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: SPACING.l }]}>Categorias</Text>
              <View style={styles.catGrid}>
                {categories.map((cat, i) => (
                  <View key={i} style={styles.catChip}>
                    <Text style={styles.catName}>{cat.category}</Text>
                    <Text style={styles.catCount}>{cat.count}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadWrap: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FONT_SIZES.h2, fontFamily: 'SpaceMono', color: COLORS.neonCyan, textAlign: 'center', marginTop: SPACING.m, letterSpacing: 3, marginBottom: SPACING.m },
  scroll: { paddingHorizontal: SPACING.l },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '700', marginBottom: SPACING.m },
  langCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, marginBottom: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  langEmoji: { fontSize: 32, marginRight: SPACING.m },
  langInfo: { flex: 1 },
  langName: { fontSize: FONT_SIZES.h3, fontWeight: '800', fontFamily: 'SpaceMono' },
  langCount: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginTop: 2 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: SPACING.m },
  backText: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body },
  selectedHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, marginBottom: SPACING.l },
  selectedEmoji: { fontSize: 40 },
  selectedName: { fontSize: FONT_SIZES.h1, fontWeight: '800', fontFamily: 'SpaceMono' },
  typeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, marginBottom: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  typeEmoji: { fontSize: 28, marginRight: SPACING.m },
  typeInfo: { flex: 1 },
  typeLabel: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '700' },
  typeDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginTop: 2 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.s },
  catChip: { backgroundColor: COLORS.panelBg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.panelBorder, flexDirection: 'row', alignItems: 'center', gap: 6 },
  catName: { color: COLORS.textPrimary, fontSize: FONT_SIZES.small },
  catCount: { color: COLORS.neonCyan, fontSize: FONT_SIZES.tiny, fontFamily: 'SpaceMono' },
});

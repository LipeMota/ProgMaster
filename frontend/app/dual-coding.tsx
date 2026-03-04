import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/Theme';

const CHALLENGES = [
  { lang: 'C#', title: 'Método Soma Pares', desc: 'Crie um método que soma todos os números pares de uma lista.',
    code: 'public static int SomarPares(List<int> nums)\n{\n    // Seu código aqui\n}',
    suggestion: 'Use LINQ Where + Sum:\nreturn nums.Where(n => n % 2 == 0).Sum();',
    test: 'SomarPares([1,2,3,4,5,6]) → 12' },
  { lang: 'SQL', title: 'Query com JOIN', desc: 'Escreva uma query que retorne clientes com suas vendas totais.',
    code: 'SELECT c.nome, _____(v.valor) as total\nFROM clientes c\n_____ JOIN vendas v\n  ON c.id = v.cliente_id\nGROUP BY c.nome;',
    suggestion: 'Use SUM e INNER JOIN:\nSELECT c.nome, SUM(v.valor) as total\nFROM clientes c\nINNER JOIN vendas v ON c.id = v.cliente_id\nGROUP BY c.nome;',
    test: 'Retorna: nome | total de vendas' },
  { lang: 'Python', title: 'Filtrar e Transformar', desc: 'Crie função que filtra nomes > 3 caracteres e converte para maiúsculo.',
    code: 'def processar_nomes(nomes):\n    # Seu código aqui\n    pass',
    suggestion: 'Use list comprehension:\nreturn [n.upper() for n in nomes if len(n) > 3]',
    test: 'processar_nomes(["Ana","João","Li","Maria"]) → ["JOÃO","MARIA"]' },
  { lang: 'Java', title: 'Stream Filter Map', desc: 'Use Stream API para filtrar e transformar lista.',
    code: 'public List<String> processar(List<String> nomes) {\n    return nomes.stream()\n        // Seu código aqui\n        .collect(Collectors.toList());\n}',
    suggestion: 'Use filter e map:\n.filter(n -> n.length() > 3)\n.map(String::toUpperCase)',
    test: 'processar(["Ana","João","Li"]) → ["JOÃO"]' },
];

export default function DualCoding() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [code, setCode] = useState(CHALLENGES[0].code);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const challenge = CHALLENGES[idx];

  const nextChallenge = () => {
    const next = (idx + 1) % CHALLENGES.length;
    setIdx(next);
    setCode(CHALLENGES[next].code);
    setShowSuggestion(false);
  };

  return (
    <SafeAreaView style={styles.container} testID="dual-coding-screen">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={COLORS.neonCyan} /></TouchableOpacity>
          <Text style={styles.title}>📝 DUAL CODING</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Col 1: Enunciado */}
          <View style={styles.col1}>
            <Text style={styles.colLabel}>📖 ENUNCIADO ({challenge.lang})</Text>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDesc}>{challenge.desc}</Text>
            <View style={styles.testBox}>
              <Text style={styles.testLabel}>🧪 TESTE:</Text>
              <Text style={styles.testText}>{challenge.test}</Text>
            </View>
          </View>

          {/* Col 2: Editor */}
          <View style={styles.col2}>
            <Text style={styles.colLabel}>💻 SEU CÓDIGO</Text>
            <TextInput
              testID="dual-code-editor"
              style={styles.editor}
              multiline
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Col 3: AI Suggestion */}
          <View style={styles.col3}>
            <Text style={styles.colLabel}>🤖 SUGESTÃO AI</Text>
            {showSuggestion ? (
              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionCode}>{challenge.suggestion}</Text>
              </View>
            ) : (
              <TouchableOpacity testID="show-suggestion-btn" style={styles.revealBtn} onPress={() => setShowSuggestion(true)}>
                <Text style={styles.revealText}>💡 REVELAR SUGESTÃO</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity testID="next-dual-btn" style={styles.nextBtn} onPress={nextChallenge}>
            <Text style={styles.nextText}>PRÓXIMO DESAFIO →</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.l, paddingVertical: SPACING.m },
  title: { color: COLORS.neonCyan, fontSize: FONT_SIZES.h3, fontFamily: 'SpaceMono' },
  scroll: { padding: SPACING.l },
  col1: { backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, marginBottom: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder },
  col2: { marginBottom: SPACING.m },
  col3: { marginBottom: SPACING.l },
  colLabel: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', marginBottom: SPACING.s, letterSpacing: 1 },
  challengeTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '800', marginBottom: SPACING.s },
  challengeDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, lineHeight: 22 },
  testBox: { backgroundColor: COLORS.codeBg, borderRadius: 8, padding: SPACING.s, marginTop: SPACING.m },
  testLabel: { color: COLORS.neonYellow, fontSize: FONT_SIZES.tiny, fontFamily: 'SpaceMono' },
  testText: { color: COLORS.neonGreen, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', marginTop: 4 },
  editor: { backgroundColor: COLORS.codeBg, borderRadius: 8, padding: SPACING.m, color: COLORS.neonGreen, fontFamily: 'SpaceMono', fontSize: FONT_SIZES.small, minHeight: 150, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.panelBorder, lineHeight: 22 },
  suggestionBox: { backgroundColor: COLORS.neonPurple + '10', borderRadius: 8, padding: SPACING.m, borderWidth: 1, borderColor: COLORS.neonPurple + '30' },
  suggestionCode: { color: COLORS.neonGreen, fontSize: FONT_SIZES.small, fontFamily: 'SpaceMono', lineHeight: 20 },
  revealBtn: { backgroundColor: COLORS.neonPurple + '20', borderRadius: 8, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.neonPurple + '40' },
  revealText: { color: COLORS.neonPurple, fontSize: FONT_SIZES.body, fontWeight: '700' },
  nextBtn: { backgroundColor: COLORS.neonCyan, borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  nextText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '800', letterSpacing: 1 },
});

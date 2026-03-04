import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, AVATARS } from '../constants/Theme';
import { api } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nome, setNome] = useState('');
  const [avatar, setAvatar] = useState('hacker');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const user = await api.getUser(userId);
        if (user && user.id) {
          router.replace('/(tabs)/dashboard');
          return;
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  const createUser = async () => {
    if (!nome.trim()) return;
    setCreating(true);
    try {
      const user = await api.createUser(nome.trim(), avatar);
      await AsyncStorage.setItem('userId', user.id);
      router.replace('/(tabs)/dashboard');
    } catch (e) {
      console.error('Create user error:', e);
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadContainer}>
        <ActivityIndicator size="large" color={COLORS.neonCyan} />
        <Text style={styles.loadText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <View style={styles.welcomeWrap} testID="welcome-screen">
              <Text style={styles.glitch}>{'< CodeQuest />'}</Text>
              <Text style={styles.subtitle}>PROGMASTER</Text>
              <View style={styles.divider} />
              <Text style={styles.lore}>
                Bem-vindo, Code Apprentice!{'\n\n'}
                O mundo de Matrix de Código precisa de você.{'\n'}
                Derrote bugs, conquiste dungeons e torne-se o{'\n'}
                Code Overlord supremo!
              </Text>
              <TouchableOpacity testID="start-adventure-btn" style={styles.cyberBtn} onPress={() => setStep(1)}>
                <Text style={styles.cyberBtnText}>⚡ INICIAR AVENTURA</Text>
              </TouchableOpacity>
              <View style={styles.statsPreview}>
                <Text style={styles.statsText}>🏙️ 4 Mundos  •  📚 4200+ Questões  •  ⚔️ Boss Fights</Text>
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.createWrap} testID="create-avatar-screen">
              <Text style={styles.stepTitle}>CRIAR PERSONAGEM</Text>
              <Text style={styles.stepSub}>Escolha seu nome de guerreiro</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person" size={20} color={COLORS.neonCyan} />
                <TextInput
                  testID="player-name-input"
                  style={styles.input}
                  placeholder="Seu nome de código..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={nome}
                  onChangeText={setNome}
                  maxLength={20}
                  autoCapitalize="words"
                />
              </View>
              <Text style={styles.stepSub}>Escolha seu avatar</Text>
              <View style={styles.avatarGrid}>
                {Object.entries(AVATARS).map(([key, av]) => (
                  <TouchableOpacity
                    key={key}
                    testID={`avatar-${key}`}
                    style={[styles.avatarCard, avatar === key && { borderColor: av.color, shadowColor: av.color }]}
                    onPress={() => setAvatar(key)}
                  >
                    <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                    <Text style={[styles.avatarName, avatar === key && { color: av.color }]}>{av.name}</Text>
                    {avatar === key && <View style={[styles.selectedDot, { backgroundColor: av.color }]} />}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                testID="create-character-btn"
                style={[styles.cyberBtn, !nome.trim() && styles.disabledBtn]}
                onPress={createUser}
                disabled={!nome.trim() || creating}
              >
                {creating ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.cyberBtnText}>🎮 CRIAR PERSONAGEM</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  loadText: { color: COLORS.textSecondary, marginTop: SPACING.m, fontSize: FONT_SIZES.body },
  scroll: { flexGrow: 1, padding: SPACING.l, justifyContent: 'center' },
  welcomeWrap: { alignItems: 'center' },
  glitch: { fontSize: 36, fontFamily: 'SpaceMono', color: COLORS.neonCyan, textAlign: 'center', letterSpacing: 2, textShadowColor: COLORS.neonCyan, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  subtitle: { fontSize: FONT_SIZES.h2, fontFamily: 'SpaceMono', color: COLORS.neonPink, letterSpacing: 8, marginTop: SPACING.s },
  divider: { width: 200, height: 2, backgroundColor: COLORS.neonCyan, marginVertical: SPACING.xl, opacity: 0.5 },
  lore: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl },
  cyberBtn: { backgroundColor: COLORS.neonCyan, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 4, marginTop: SPACING.m, minWidth: 250, alignItems: 'center' },
  cyberBtnText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '800', letterSpacing: 1 },
  disabledBtn: { opacity: 0.4 },
  statsPreview: { marginTop: SPACING.xl, paddingVertical: SPACING.m, paddingHorizontal: SPACING.l, borderWidth: 1, borderColor: COLORS.panelBorder, borderRadius: 8 },
  statsText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, textAlign: 'center' },
  createWrap: { alignItems: 'center' },
  stepTitle: { fontSize: FONT_SIZES.h2, fontFamily: 'SpaceMono', color: COLORS.neonCyan, letterSpacing: 3, marginBottom: SPACING.s },
  stepSub: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, marginBottom: SPACING.m, marginTop: SPACING.m },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderWidth: 1, borderColor: COLORS.panelBorder, borderRadius: 8, paddingHorizontal: SPACING.m, width: '100%', marginBottom: SPACING.m },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: FONT_SIZES.body, paddingVertical: 14, marginLeft: SPACING.s, fontFamily: 'SpaceMono' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.m, marginBottom: SPACING.l },
  avatarCard: { width: 90, height: 100, backgroundColor: COLORS.panelBg, borderWidth: 2, borderColor: COLORS.panelBorder, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 36 },
  avatarName: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 4, fontWeight: '600' },
  selectedDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
});

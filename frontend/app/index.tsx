import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, FONT_SIZES, AVATARS } from '../constants/Theme';
import { initDatabase, createUser, getUser } from '../utils/database';
import { validatePlayerName } from '../utils/validation';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nome, setNome] = useState('');
  const [avatar, setAvatar] = useState('hacker');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initDatabase();
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const user = await getUser(userId);
        if (user) {
          router.replace('/(tabs)/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Init error:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao inicializar',
        text2: 'Tente reiniciar o app',
      });
    }
    setLoading(false);
  };

  const handleCreateUser = async () => {
    // Validação
    const validation = validatePlayerName(nome);
    if (!validation.valid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Nome inválido',
        text2: validation.error,
      });
      return;
    }

    setCreating(true);
    try {
      const user = await createUser(nome.trim(), avatar);
      await AsyncStorage.setItem('userId', user.id);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Personagem criado!',
        text2: `Bem-vindo, ${nome.trim()}!`,
      });
      
      setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Create user error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar personagem',
        text2: error.message || 'Tente novamente',
      });
      setCreating(false);
    }
  };

  const handleAvatarSelect = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAvatar(key);
  };

  if (loading) {
    return (
      <View style={styles.loadContainer}>
        <ActivityIndicator size="large" color={COLORS.neonCyan} />
        <Text style={styles.loadText}>Inicializando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && (
            <View style={styles.welcomeWrap} testID="welcome-screen">
              <Text style={styles.glitch}>{'< ProgMaster />'}</Text>
              <Text style={styles.subtitle}>CODE QUEST</Text>
              <View style={styles.divider} />
              <Text style={styles.lore}>
                Domine as linguagens de programação{' \n'}
                Resolva desafios e evolua suas habilidades{' \n'}
                Torne-se um desenvolvedor completo
              </Text>
              <TouchableOpacity 
                testID="start-adventure-btn" 
                style={styles.primaryBtn} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setStep(1);
                }}
                accessibilityLabel="Iniciar jornada"
                accessibilityRole="button"
              >
                <Text style={styles.primaryBtnText}>⚡ INICIAR JORNADA</Text>
              </TouchableOpacity>
              <View style={styles.statsPreview}>
                <Text style={styles.statsText}>🎯 4 Linguagens  •  📚 100+ Questões  •  🏆 Desafios</Text>
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.createWrap} testID="create-avatar-screen">
              <Text style={styles.stepTitle}>CRIAR PERFIL</Text>
              <Text style={styles.stepSub}>Digite seu nome</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person" size={20} color={COLORS.neonCyan} />
                <TextInput
                  testID="player-name-input"
                  style={styles.input}
                  placeholder="Seu nome..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={nome}
                  onChangeText={setNome}
                  maxLength={20}
                  autoCapitalize="words"
                  autoFocus={true}
                  returnKeyType="done"
                  accessibilityLabel="Campo de nome"
                />
              </View>
              <Text style={styles.stepSub}>Escolha seu avatar</Text>
              <View style={styles.avatarGrid}>
                {Object.entries(AVATARS).map(([key, av]) => (
                  <TouchableOpacity
                    key={key}
                    testID={`avatar-${key}`}
                    style={[styles.avatarCard, avatar === key && { borderColor: av.color, shadowColor: av.color }]}
                    onPress={() => handleAvatarSelect(key)}
                    accessibilityLabel={`Avatar ${av.name}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                    <Text style={[styles.avatarName, avatar === key && { color: av.color }]}>{av.name}</Text>
                    {avatar === key && <View style={[styles.selectedDot, { backgroundColor: av.color }]} />}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                testID="create-character-btn"
                style={[styles.primaryBtn, (!nome.trim() || creating) && styles.disabledBtn]}
                onPress={handleCreateUser}
                disabled={!nome.trim() || creating}
                accessibilityLabel="Criar perfil"
                accessibilityRole="button"
              >
                {creating ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.primaryBtnText}>🚀 COMEÇAR</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  loadText: { color: COLORS.textSecondary, marginTop: SPACING.m, fontSize: FONT_SIZES.body },
  scroll: { flexGrow: 1, padding: SPACING.l, justifyContent: 'center' },
  welcomeWrap: { alignItems: 'center' },
  glitch: { fontSize: 32, fontFamily: 'SpaceMono', color: COLORS.neonCyan, textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: FONT_SIZES.h2, fontFamily: 'SpaceMono', color: COLORS.textPrimary, letterSpacing: 6, marginTop: SPACING.s, fontWeight: '300' },
  divider: { width: 80, height: 1, backgroundColor: COLORS.neonCyan, marginVertical: SPACING.xl, opacity: 0.3 },
  lore: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl, fontWeight: '300' },
  primaryBtn: { backgroundColor: COLORS.neonCyan, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 2, marginTop: SPACING.m, minWidth: 250, alignItems: 'center' },
  primaryBtnText: { color: COLORS.background, fontSize: FONT_SIZES.body, fontWeight: '700', letterSpacing: 2 },
  disabledBtn: { opacity: 0.3 },
  statsPreview: { marginTop: SPACING.xl, paddingVertical: SPACING.m, paddingHorizontal: SPACING.l, borderWidth: 1, borderColor: COLORS.panelBorder, borderRadius: 2 },
  statsText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, textAlign: 'center', fontWeight: '300' },
  createWrap: { alignItems: 'center' },
  stepTitle: { fontSize: FONT_SIZES.h2, fontFamily: 'SpaceMono', color: COLORS.neonCyan, letterSpacing: 4, marginBottom: SPACING.s, fontWeight: '300' },
  stepSub: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, marginBottom: SPACING.m, marginTop: SPACING.m, fontWeight: '300' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderWidth: 1, borderColor: COLORS.panelBorder, borderRadius: 2, paddingHorizontal: SPACING.m, width: '100%', marginBottom: SPACING.m },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: FONT_SIZES.body, paddingVertical: 14, marginLeft: SPACING.s, fontFamily: 'SpaceMono', height: 50 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.m, marginBottom: SPACING.l },
  avatarCard: { width: 90, height: 100, backgroundColor: COLORS.panelBg, borderWidth: 1, borderColor: COLORS.panelBorder, borderRadius: 2, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 36 },
  avatarName: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 4, fontWeight: '600' },
  selectedDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
});

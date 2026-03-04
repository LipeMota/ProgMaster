import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, LANGUAGES } from '../../constants/Theme';
import { api } from '../../utils/api';

export default function MapScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const u = await api.getUser(userId);
        setUser(u);
      }
    } catch (e) {}
    setLoading(false);
  };

  if (loading) return <View style={styles.loadWrap}><ActivityIndicator size="large" color={COLORS.neonCyan} /></View>;

  const unlocked = user?.linguagens_desbloqueadas || ['csharp'];

  const cities = [
    { key: 'csharp', name: 'C# Metropolis', emoji: '🏙️', color: '#9B4DCA', desc: 'A cidade dos desenvolvedores .NET', level: 1, quests: '1094 questões' },
    { key: 'sql', name: 'SQL Dungeon', emoji: '🏰', color: '#FF6B35', desc: 'As masmorras das queries', level: 5, quests: '1011 questões' },
    { key: 'python', name: 'Python Woods', emoji: '🌲', color: '#39FF14', desc: 'A floresta da automação', level: 8, quests: '1047 questões' },
    { key: 'java', name: 'Java Fortress', emoji: '🏯', color: '#FF003C', desc: 'A fortaleza do código robusto', level: 12, quests: '1048 questões' },
  ];

  return (
    <SafeAreaView style={styles.container} testID="map-screen">
      <Text style={styles.title}>🗺️ MAPA MUNDO</Text>
      <Text style={styles.subtitle}>Matrix de Código</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {cities.map((city, i) => {
          const isUnlocked = unlocked.includes(city.key);
          return (
            <TouchableOpacity
              key={city.key}
              testID={`city-${city.key}`}
              style={[styles.cityCard, !isUnlocked && styles.lockedCard]}
              onPress={() => {
                if (isUnlocked) {
                  router.push({ pathname: '/(tabs)/quizzes', params: { language: city.key } });
                }
              }}
              disabled={!isUnlocked}
            >
              <View style={[styles.cityIcon, { borderColor: isUnlocked ? city.color : COLORS.panelBorder }]}>
                <Text style={styles.cityEmoji}>{city.emoji}</Text>
              </View>
              <View style={styles.cityInfo}>
                <Text style={[styles.cityName, { color: isUnlocked ? city.color : COLORS.textSecondary }]}>{city.name}</Text>
                <Text style={styles.cityDesc}>{city.desc}</Text>
                <Text style={styles.cityQuests}>{city.quests}</Text>
              </View>
              <View style={styles.cityRight}>
                {isUnlocked ? (
                  <View style={[styles.unlockedBadge, { backgroundColor: city.color + '30' }]}>
                    <Text style={[styles.unlockedText, { color: city.color }]}>ABERTO</Text>
                  </View>
                ) : (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedIcon}>🔒</Text>
                    <Text style={styles.lockedText}>Nv.{city.level}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>📖 COMO DESBLOQUEAR</Text>
          <Text style={styles.legendText}>• C# Metropolis: Já desbloqueado!</Text>
          <Text style={styles.legendText}>• SQL Dungeon: Compre o passe na loja (150 🪙)</Text>
          <Text style={styles.legendText}>• Python Woods: Compre o passe na loja (150 🪙)</Text>
          <Text style={styles.legendText}>• Java Fortress: Compre o passe na loja (200 🪙)</Text>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadWrap: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FONT_SIZES.h2, fontFamily: 'SpaceMono', color: COLORS.neonCyan, textAlign: 'center', marginTop: SPACING.m, letterSpacing: 3 },
  subtitle: { fontSize: FONT_SIZES.small, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.l },
  scroll: { paddingHorizontal: SPACING.l },
  cityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderWidth: 1, borderColor: COLORS.panelBorder, borderRadius: 16, padding: SPACING.m, marginBottom: SPACING.m },
  lockedCard: { opacity: 0.5 },
  cityIcon: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  cityEmoji: { fontSize: 28 },
  cityInfo: { flex: 1, marginLeft: SPACING.m },
  cityName: { fontSize: FONT_SIZES.body, fontWeight: '800', fontFamily: 'SpaceMono' },
  cityDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginTop: 2 },
  cityQuests: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 2, fontFamily: 'SpaceMono' },
  cityRight: { marginLeft: SPACING.s },
  unlockedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  unlockedText: { fontSize: FONT_SIZES.tiny, fontWeight: '700', fontFamily: 'SpaceMono' },
  lockedBadge: { alignItems: 'center' },
  lockedIcon: { fontSize: 20 },
  lockedText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.tiny, marginTop: 2 },
  legendCard: { backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, borderWidth: 1, borderColor: COLORS.panelBorder, marginTop: SPACING.m },
  legendTitle: { color: COLORS.neonCyan, fontSize: FONT_SIZES.body, fontWeight: '700', marginBottom: SPACING.s, fontFamily: 'SpaceMono' },
  legendText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, lineHeight: 22 },
});

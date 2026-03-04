import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/Theme';
import { api } from '../../utils/api';

export default function Inventory() {
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'shop' | 'inventory'>('shop');
  const [userId, setUserId] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;
      setUserId(uid);
      const [items, inv, u] = await Promise.all([api.getShopItems(), api.getInventory(uid), api.getUser(uid)]);
      setShopItems(items); setInventory(inv); setUser(u);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const buyItem = async (item: any) => {
    if (!user || user.codecoins < item.price) {
      Alert.alert('CodeCoins insuficientes', `Você precisa de ${item.price} 🪙 mas tem apenas ${user?.codecoins || 0} 🪙`);
      return;
    }
    try {
      await api.buyItem(userId, item.id);
      Alert.alert('Compra realizada!', `${item.name} adquirido!`);
      loadAll();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao comprar');
    }
  };

  const iconMap: Record<string, string> = { lightbulb: 'bulb-outline', wizard: 'sparkles', knight: 'shield', ninja: 'eye', robot: 'hardware-chip', key: 'key', zap: 'flash', coins: 'cash' };

  if (loading) return <View style={styles.loadWrap}><ActivityIndicator size="large" color={COLORS.neonCyan} /></View>;

  return (
    <SafeAreaView style={styles.container} testID="inventory-screen">
      <View style={styles.header}>
        <Text style={styles.title}>🎒 INVENTÁRIO</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>🪙 {user?.codecoins || 0}</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity testID="tab-shop" style={[styles.tabBtn, tab === 'shop' && styles.tabActive]} onPress={() => setTab('shop')}>
          <Text style={[styles.tabText, tab === 'shop' && styles.tabTextActive]}>🛒 Loja</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="tab-inventory" style={[styles.tabBtn, tab === 'inventory' && styles.tabActive]} onPress={() => setTab('inventory')}>
          <Text style={[styles.tabText, tab === 'inventory' && styles.tabTextActive]}>📦 Meus Itens</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === 'shop' && (
          <>
            {['hints', 'skins', 'unlocks', 'boosts'].map(cat => {
              const catItems = shopItems.filter(i => i.category === cat);
              if (catItems.length === 0) return null;
              const catNames: Record<string, string> = { hints: '💡 Dicas', skins: '🎭 Skins', unlocks: '🔑 Desbloqueios', boosts: '⚡ Boosts' };
              return (
                <View key={cat}>
                  <Text style={styles.catTitle}>{catNames[cat] || cat}</Text>
                  {catItems.map(item => {
                    const owned = item.type === 'skin' && user?.skins_desbloqueadas?.includes(item.skin_id);
                    const langOwned = item.type === 'unlock' && user?.linguagens_desbloqueadas?.includes(item.language);
                    const isOwned = owned || langOwned;
                    return (
                      <View key={item.id} style={[styles.itemCard, isOwned && styles.ownedCard]} testID={`shop-item-${item.id}`}>
                        <Ionicons name={(iconMap[item.icon] || 'cube') as any} size={28} color={isOwned ? COLORS.neonGreen : COLORS.neonCyan} />
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemDesc}>{item.description}</Text>
                        </View>
                        {isOwned ? (
                          <View style={styles.ownedBadge}><Text style={styles.ownedText}>OBTIDO</Text></View>
                        ) : (
                          <TouchableOpacity testID={`buy-${item.id}`} style={styles.buyBtn} onPress={() => buyItem(item)}>
                            <Text style={styles.buyText}>{item.price} 🪙</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}
        {tab === 'inventory' && (
          inventory.length > 0 ? (
            inventory.map((inv, i) => (
              <View key={inv.id || i} style={styles.invCard}>
                <Text style={styles.invName}>{inv.item_name}</Text>
                <Text style={styles.invDate}>{new Date(inv.purchased_at).toLocaleDateString('pt-BR')}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhum item comprado ainda.{'\n'}Visite a loja!</Text>
          )
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadWrap: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.l, marginTop: SPACING.m },
  title: { fontSize: FONT_SIZES.h2, fontFamily: 'SpaceMono', color: COLORS.neonCyan, letterSpacing: 3 },
  coinBadge: { backgroundColor: COLORS.panelBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.neonYellow + '40' },
  coinText: { color: COLORS.neonYellow, fontSize: FONT_SIZES.body, fontWeight: '700', fontFamily: 'SpaceMono' },
  tabRow: { flexDirection: 'row', paddingHorizontal: SPACING.l, gap: SPACING.s, marginVertical: SPACING.m },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.panelBg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.panelBorder },
  tabActive: { borderColor: COLORS.neonCyan, backgroundColor: COLORS.neonCyan + '15' },
  tabText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.body, fontWeight: '600' },
  tabTextActive: { color: COLORS.neonCyan },
  scroll: { paddingHorizontal: SPACING.l },
  catTitle: { color: COLORS.textPrimary, fontSize: FONT_SIZES.h3, fontWeight: '700', marginBottom: SPACING.s, marginTop: SPACING.m },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panelBg, borderRadius: 12, padding: SPACING.m, marginBottom: SPACING.s, borderWidth: 1, borderColor: COLORS.panelBorder },
  ownedCard: { borderColor: COLORS.neonGreen + '30' },
  itemInfo: { flex: 1, marginLeft: SPACING.m },
  itemName: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body, fontWeight: '700' },
  itemDesc: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small, marginTop: 2 },
  buyBtn: { backgroundColor: COLORS.neonCyan + '20', borderWidth: 1, borderColor: COLORS.neonCyan, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  buyText: { color: COLORS.neonCyan, fontSize: FONT_SIZES.small, fontWeight: '700', fontFamily: 'SpaceMono' },
  ownedBadge: { backgroundColor: COLORS.neonGreen + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  ownedText: { color: COLORS.neonGreen, fontSize: FONT_SIZES.tiny, fontWeight: '700' },
  invCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.panelBg, borderRadius: 10, padding: SPACING.m, marginBottom: SPACING.s, borderWidth: 1, borderColor: COLORS.panelBorder },
  invName: { color: COLORS.textPrimary, fontSize: FONT_SIZES.body },
  invDate: { color: COLORS.textSecondary, fontSize: FONT_SIZES.small },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xxl, lineHeight: 24 },
});

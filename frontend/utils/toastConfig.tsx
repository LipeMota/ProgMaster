import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/Theme';

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={[styles.toast, styles.successToast]}>
      <Text style={styles.toastTitle}>✅ {text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View style={[styles.toast, styles.errorToast]}>
      <Text style={styles.toastTitle}>❌ {text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View style={[styles.toast, styles.infoToast]}>
      <Text style={styles.toastTitle}>💡 {text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
  warning: ({ text1, text2 }: any) => (
    <View style={[styles.toast, styles.warningToast]}>
      <Text style={styles.toastTitle}>⚠️ {text1}</Text>
      {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  toast: {
    width: '90%',
    padding: SPACING.m,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successToast: {
    backgroundColor: COLORS.panelBg,
    borderColor: COLORS.success,
  },
  errorToast: {
    backgroundColor: COLORS.panelBg,
    borderColor: COLORS.error,
  },
  infoToast: {
    backgroundColor: COLORS.panelBg,
    borderColor: COLORS.neonCyan,
  },
  warningToast: {
    backgroundColor: COLORS.panelBg,
    borderColor: COLORS.warning,
  },
  toastTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    marginBottom: 4,
  },
  toastMessage: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
  },
});

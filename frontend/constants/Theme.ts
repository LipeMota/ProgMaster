export const COLORS = {
  // Background escuro minimalista
  background: '#0A0A0F',
  panelBg: '#12121A',
  panelBorder: '#1F1F2E',
  
  // Textos com contraste adequado
  textPrimary: '#E8E8EA',
  textSecondary: '#8B8B9A',
  textTertiary: '#5A5A68',
  
  // Accent colors profissionais (menos saturadas)
  neonCyan: '#00D9FF',
  neonPink: '#E94560',
  neonGreen: '#00E676',
  neonPurple: '#9C27B0',
  neonYellow: '#FFD600',
  
  // Elementos de UI
  glassSurface: 'rgba(18, 18, 26, 0.85)',
  overlayDark: 'rgba(0, 0, 0, 0.85)',
  codeBg: '#0D0D15',
  
  // Status colors
  success: '#00E676',
  error: '#E94560',
  warning: '#FFD600',
  info: '#00D9FF',
  
  // Progress
  xpBar: '#00D9FF',
  xpBarBg: '#1A1A2E',
  streakFlame: '#FF6B35',
  
  // Linguagens (cores mais sérias)
  csharp: '#512BD4',
  sql: '#CC2927',
  python: '#3776AB',
  java: '#007396',
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  small: 14,
  tiny: 12,
};

export const FONT_WEIGHTS = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const AVATARS: Record<string, { name: string; emoji: string; color: string }> = {
  hacker: { name: 'Dev', emoji: '👨‍💻', color: COLORS.neonCyan },
  wizard: { name: 'Architect', emoji: '🧑‍💼', color: COLORS.neonPurple },
  knight: { name: 'Engineer', emoji: '👷', color: COLORS.error },
  ninja: { name: 'Specialist', emoji: '👩‍🔬', color: COLORS.neonGreen },
  robot: { name: 'AI Expert', emoji: '🤖', color: COLORS.neonYellow },
};

export const LANGUAGES: Record<string, { name: string; icon: string; color: string; mapName: string }> = {
  csharp: { name: 'C#', icon: '🏢', color: COLORS.csharp, mapName: 'C# Development' },
  sql: { name: 'SQL', icon: '🗄️', color: COLORS.sql, mapName: 'SQL Database' },
  python: { name: 'Python', icon: '🐍', color: COLORS.python, mapName: 'Python Programming' },
  java: { name: 'Java', icon: '☕', color: COLORS.java, mapName: 'Java Enterprise' },
};

export const LEVEL_TITLES: Record<string, { min: number; max: number; title: string }> = {
  junior: { min: 1, max: 10, title: 'Junior' },
  pleno: { min: 11, max: 20, title: 'Mid-Level' },
  senior: { min: 21, max: 30, title: 'Senior' },
  arquiteto: { min: 31, max: 99, title: 'Architect' },
};

export function getLevelTitle(level: number): string {
  if (level <= 10) return 'Junior';
  if (level <= 20) return 'Mid-Level';
  if (level <= 30) return 'Senior';
  return 'Architect';
}

// Sistema de XP rebalanceado (mais suave)
export function getXpForLevel(level: number): number {
  if (level <= 10) return 100 + (level - 1) * 50;
  if (level <= 20) return 600 + (level - 10) * 100;
  if (level <= 30) return 1600 + (level - 20) * 150;
  return 3100 + (level - 30) * 200;
}

// Animações rápidas e profissionais
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 400,
};

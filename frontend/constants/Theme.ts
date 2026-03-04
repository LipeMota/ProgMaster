export const COLORS = {
  background: '#050505',
  panelBg: '#12121A',
  panelBorder: '#2A2A35',
  textPrimary: '#E0E0E0',
  textSecondary: '#9494A8',
  neonCyan: '#00F0FF',
  neonPink: '#FF003C',
  neonGreen: '#39FF14',
  neonPurple: '#BF00FF',
  neonYellow: '#F1EE00',
  glassSurface: 'rgba(18, 18, 26, 0.85)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
  codeBg: '#0A0A12',
  success: '#39FF14',
  error: '#FF003C',
  warning: '#F1EE00',
  xpBar: '#00F0FF',
  xpBarBg: '#1A1A2E',
  streakFlame: '#FF6B35',
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
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  small: 13,
  tiny: 11,
};

export const AVATARS: Record<string, { name: string; emoji: string; color: string }> = {
  hacker: { name: 'Hacker', emoji: '🔓', color: '#00F0FF' },
  wizard: { name: 'Wizard', emoji: '🧙', color: '#BF00FF' },
  knight: { name: 'Knight', emoji: '⚔️', color: '#FF003C' },
  ninja: { name: 'Ninja', emoji: '🥷', color: '#39FF14' },
  robot: { name: 'Robot', emoji: '🤖', color: '#F1EE00' },
};

export const LANGUAGES: Record<string, { name: string; icon: string; color: string; mapName: string }> = {
  csharp: { name: 'C#', icon: '🏙️', color: '#9B4DCA', mapName: 'C# Metropolis' },
  sql: { name: 'SQL', icon: '🏰', color: '#FF6B35', mapName: 'SQL Dungeon' },
  python: { name: 'Python', icon: '🌲', color: '#39FF14', mapName: 'Python Woods' },
  java: { name: 'Java', icon: '🏯', color: '#FF003C', mapName: 'Java Fortress' },
};

export const LEVEL_TITLES: Record<string, { min: number; max: number; title: string }> = {
  junior: { min: 1, max: 10, title: 'Júnior' },
  pleno: { min: 11, max: 20, title: 'Pleno' },
  senior: { min: 21, max: 30, title: 'Sênior' },
  arquiteto: { min: 31, max: 99, title: 'Arquiteto' },
};

export function getLevelTitle(level: number): string {
  if (level <= 10) return 'Júnior';
  if (level <= 20) return 'Pleno';
  if (level <= 30) return 'Sênior';
  return 'Arquiteto';
}

export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

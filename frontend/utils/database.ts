import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('progmaster.db');

export const initDatabase = async () => {
  try {
    // Tabela de usuário
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        avatar_id TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        coins INTEGER DEFAULT 100,
        streak_days INTEGER DEFAULT 0,
        last_login TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de histórico de quiz
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS quiz_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        language TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);

    // Tabela de missões
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS missions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        target INTEGER NOT NULL,
        progress INTEGER DEFAULT 0,
        reward_xp INTEGER DEFAULT 0,
        reward_coins INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        expires_at TEXT,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);

    // Tabela de inventário
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id)
      );
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Funções de usuário
export const createUser = async (nome: string, avatar_id: string) => {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.runAsync(
    'INSERT INTO user (id, nome, avatar_id, last_login) VALUES (?, ?, ?, datetime("now"))',
    [id, nome, avatar_id]
  );
  return getUser(id);
};

export const getUser = async (userId: string) => {
  const result = await db.getFirstAsync('SELECT * FROM user WHERE id = ?', [userId]);
  return result;
};

export const updateUser = async (userId: string, data: any) => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), userId];
  await db.runAsync(`UPDATE user SET ${fields} WHERE id = ?`, values);
  return getUser(userId);
};

export const addXp = async (userId: string, xp: number) => {
  const user: any = await getUser(userId);
  if (!user) throw new Error('User not found');
  
  const newXp = user.xp + xp;
  const xpForNextLevel = getXpForLevel(user.level + 1);
  
  let newLevel = user.level;
  let remainingXp = newXp;
  
  while (remainingXp >= xpForNextLevel && newLevel < 99) {
    remainingXp -= xpForNextLevel;
    newLevel++;
  }
  
  await updateUser(userId, { xp: remainingXp, level: newLevel });
  return { leveledUp: newLevel > user.level, newLevel, newXp: remainingXp };
};

export const addCoins = async (userId: string, coins: number) => {
  const user: any = await getUser(userId);
  if (!user) throw new Error('User not found');
  await updateUser(userId, { coins: user.coins + coins });
};

// Quiz history
export const saveQuizResult = async (userId: string, language: string, score: number, total: number) => {
  const id = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.runAsync(
    'INSERT INTO quiz_history (id, user_id, language, score, total_questions) VALUES (?, ?, ?, ?, ?)',
    [id, userId, language, score, total]
  );
};

export const getQuizHistory = async (userId: string) => {
  return await db.getAllAsync(
    'SELECT * FROM quiz_history WHERE user_id = ? ORDER BY completed_at DESC LIMIT 20',
    [userId]
  );
};

// Helpers
function getXpForLevel(level: number): number {
  if (level <= 10) return 100 + (level - 1) * 50;
  if (level <= 20) return 600 + (level - 10) * 100;
  return 1600 + (level - 20) * 200;
}

export default {
  initDatabase,
  createUser,
  getUser,
  updateUser,
  addXp,
  addCoins,
  saveQuizResult,
  getQuizHistory,
};

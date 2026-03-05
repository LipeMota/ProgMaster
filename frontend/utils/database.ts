import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const getDatabase = () => {
  if (!db) {
    db = SQLite.openDatabaseSync('progmaster.db');
  }
  return db;
};

export const initDatabase = async () => {
  try {
    const database = getDatabase();
    
    // Tabela de usuário
    await database.execAsync(`
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
    await database.execAsync(`
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
    await database.execAsync(`
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
    await database.execAsync(`
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
  const database = getDatabase();
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await database.runAsync(
    'INSERT INTO user (id, nome, avatar_id, last_login) VALUES (?, ?, ?, datetime("now"))',
    [id, nome, avatar_id]
  );
  
  return getUser(id);
};

export const getUser = async (userId: string) => {
  const database = getDatabase();
  const result = await database.getFirstAsync(
    'SELECT * FROM user WHERE id = ?',
    [userId]
  );
  return result;
};

export const updateUser = async (userId: string, data: any) => {
  const database = getDatabase();
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), userId];
  
  await database.runAsync(
    `UPDATE user SET ${fields} WHERE id = ?`,
    values
  );
  
  return getUser(userId);
};

export const addXp = async (userId: string, xp: number) => {
  const user: any = await getUser(userId);
  if (!user) throw new Error('User not found');
  
  const newXp = user.xp + xp;
  let newLevel = user.level;
  let remainingXp = newXp;
  
  // Calcular níveis ganhos
  while (remainingXp >= getXpForLevel(newLevel + 1) && newLevel < 99) {
    remainingXp -= getXpForLevel(newLevel + 1);
    newLevel++;
  }
  
  await updateUser(userId, { xp: remainingXp, level: newLevel });
  
  return { 
    leveledUp: newLevel > user.level, 
    newLevel, 
    newXp: remainingXp,
    levelsGained: newLevel - user.level
  };
};

export const addCoins = async (userId: string, coins: number) => {
  const user: any = await getUser(userId);
  if (!user) throw new Error('User not found');
  
  await updateUser(userId, { coins: user.coins + coins });
};

// Atualizar streak
export const updateStreak = async (userId: string) => {
  const user: any = await getUser(userId);
  if (!user) throw new Error('User not found');
  
  const now = new Date();
  const lastLogin = user.last_login ? new Date(user.last_login) : null;
  
  let newStreak = user.streak_days || 0;
  
  if (lastLogin) {
    const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutivo
      newStreak++;
    } else if (daysDiff > 1) {
      // Perdeu o streak
      newStreak = 1;
    }
    // Se daysDiff === 0, já logou hoje, mantém streak
  } else {
    newStreak = 1;
  }
  
  await updateUser(userId, { 
    streak_days: newStreak,
    last_login: now.toISOString()
  });
  
  return newStreak;
};

// Quiz history
export const saveQuizResult = async (
  userId: string, 
  language: string, 
  score: number, 
  total: number
) => {
  const database = getDatabase();
  const id = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await database.runAsync(
    'INSERT INTO quiz_history (id, user_id, language, score, total_questions) VALUES (?, ?, ?, ?, ?)',
    [id, userId, language, score, total]
  );
  
  // Adicionar XP e moedas
  const xpGained = score * 10;
  const coinsGained = score * 2;
  
  await addXp(userId, xpGained);
  await addCoins(userId, coinsGained);
  
  return { xpGained, coinsGained };
};

export const getQuizHistory = async (userId: string, limit: number = 20) => {
  const database = getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM quiz_history WHERE user_id = ? ORDER BY completed_at DESC LIMIT ?',
    [userId, limit]
  );
};

// Missões
export const createMission = async (
  userId: string,
  type: string,
  title: string,
  description: string,
  target: number,
  rewardXp: number,
  rewardCoins: number,
  expiresAt?: string
) => {
  const database = getDatabase();
  const id = `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await database.runAsync(
    'INSERT INTO missions (id, user_id, type, title, description, target, reward_xp, reward_coins, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, type, title, description, target, rewardXp, rewardCoins, expiresAt || null]
  );
  
  return id;
};

export const getMissions = async (userId: string, type?: string) => {
  const database = getDatabase();
  
  if (type) {
    return await database.getAllAsync(
      'SELECT * FROM missions WHERE user_id = ? AND type = ? ORDER BY created_at DESC',
      [userId, type]
    );
  }
  
  return await database.getAllAsync(
    'SELECT * FROM missions WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
};

export const updateMissionProgress = async (missionId: string, progress: number) => {
  const database = getDatabase();
  
  await database.runAsync(
    'UPDATE missions SET progress = ? WHERE id = ?',
    [progress, missionId]
  );
};

export const completeMission = async (missionId: string) => {
  const database = getDatabase();
  
  const mission: any = await database.getFirstAsync(
    'SELECT * FROM missions WHERE id = ?',
    [missionId]
  );
  
  if (!mission) throw new Error('Mission not found');
  
  await database.runAsync(
    'UPDATE missions SET completed = 1 WHERE id = ?',
    [missionId]
  );
  
  // Recompensar
  await addXp(mission.user_id, mission.reward_xp);
  await addCoins(mission.user_id, mission.reward_coins);
  
  return {
    xpGained: mission.reward_xp,
    coinsGained: mission.reward_coins
  };
};

// Helpers
function getXpForLevel(level: number): number {
  if (level <= 10) return 100 + (level - 1) * 50;
  if (level <= 20) return 600 + (level - 10) * 100;
  if (level <= 30) return 1600 + (level - 20) * 150;
  return 3100 + (level - 30) * 200;
}

export default {
  initDatabase,
  createUser,
  getUser,
  updateUser,
  addXp,
  addCoins,
  updateStreak,
  saveQuizResult,
  getQuizHistory,
  createMission,
  getMissions,
  updateMissionProgress,
  completeMission,
};

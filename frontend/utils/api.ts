/**
 * @deprecated Este arquivo foi deprecado.
 * O app agora funciona 100% offline com SQLite local.
 * 
 * Use ao invés:
 * - `database.ts` para operações de usuário, quiz, missões
 * - `mockData.ts` para questões offline
 * 
 * Migração completa em 05/03/2026
 */

import { getUser, createUser, updateUser, addXp, addCoins, saveQuizResult, getQuizHistory } from './database';
import { getRandomQuestions, DAILY_MISSIONS, WEEKLY_MISSIONS } from './mockData';

// Adapter legacy para compatibilidade temporária
export const api = {
  // User
  createUser: (nome: string, avatar_id: string) => createUser(nome, avatar_id),
  getUser: (userId: string) => getUser(userId),
  updateUser: (userId: string, data: any) => updateUser(userId, data),
  addXp: (userId: string, xp: number) => addXp(userId, xp),
  addCoins: (userId: string, coins: number) => addCoins(userId, coins),

  // Questions (agora offline)
  getQuestions: async (params: Record<string, any> = {}) => {
    const { language = 'csharp', count = 10 } = params;
    return getRandomQuestions(language, count);
  },
  
  getRandomQuestions: (language: string, count = 10) => {
    return Promise.resolve(getRandomQuestions(language, count));
  },
  
  getQuestionCounts: () => {
    return Promise.resolve({
      total: 60,
      by_language: {
        csharp: { total: 15 },
        sql: { total: 15 },
        python: { total: 15 },
        java: { total: 15 },
      }
    });
  },
  
  getCategories: (language: string) => {
    return Promise.resolve(['fundamentals', 'advanced', 'practice']);
  },

  // Quiz
  startQuiz: async (userId: string, language: string, type = 'mcq', count = 10) => {
    const questions = getRandomQuestions(language, count);
    return {
      id: `quiz_${Date.now()}`,
      user_id: userId,
      language,
      questions,
      started_at: new Date().toISOString()
    };
  },
  
  submitAnswer: async (userId: string, questionId: string, answer: string) => {
    // Simulação - a lógica real deve estar na tela de quiz
    return { correct: true, points: 10 };
  },
  
  quizHistory: (userId: string) => getQuizHistory(userId),

  // Missions
  getDailyMissions: async (userId: string) => DAILY_MISSIONS,
  getWeeklyMissions: async (userId: string) => WEEKLY_MISSIONS,
  getBossMissions: async () => [],
  
  completeMission: async (userId: string, missionId: string) => {
    return { success: true, rewards: { xp: 50, coins: 10 } };
  },
  
  updateMissionProgress: async (missionId: string, userId: string) => {
    return { progress: 1 };
  },

  // Shop (placeholders)
  getShopItems: async () => [],
  buyItem: async (userId: string, itemId: string) => ({ success: false, message: 'Shop offline' }),
  getInventory: async (userId: string) => [],

  // Outros módulos (placeholders)
  getPairChallenge: async () => ({ id: '1', code: '// Coming soon', language: 'csharp' }),
  validatePair: async () => ({ success: false }),
  getBugHunt: async () => ({ id: '1', code: '// Coming soon', language: 'csharp' }),
  getInterviewQuestions: async () => [],
  getStats: async (userId: string) => ({}),
  getLeaderboard: async (userId: string) => [],
  completePomodoro: async (userId: string, minutes = 25) => ({ xp: 25, coins: 5 }),
  health: async () => ({ status: 'offline', mode: 'local' }),
};

export default api;

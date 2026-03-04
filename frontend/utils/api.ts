const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

async function apiCall(path: string, options?: RequestInit) {
  const url = `${BACKEND_URL}/api${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${res.status}: ${errText}`);
  }
  return res.json();
}

export const api = {
  // User
  createUser: (nome: string, avatar_id: string) =>
    apiCall('/user', { method: 'POST', body: JSON.stringify({ nome, avatar_id }) }),
  getUser: (userId: string) => apiCall(`/user/${userId}`),
  updateUser: (userId: string, data: any) =>
    apiCall(`/user/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  addXp: (userId: string, xp: number, source = 'quiz') =>
    apiCall(`/user/${userId}/add-xp`, { method: 'POST', body: JSON.stringify({ xp, source }) }),
  addCoins: (userId: string, coins: number, source = 'quiz') =>
    apiCall(`/user/${userId}/add-coins`, { method: 'POST', body: JSON.stringify({ coins, source }) }),

  // Questions
  getQuestions: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiCall(`/questions?${q}`);
  },
  getRandomQuestions: (language: string, count = 10, type?: string) => {
    let q = `language=${language}&count=${count}`;
    if (type) q += `&question_type=${type}`;
    return apiCall(`/questions/random?${q}`);
  },
  getQuestionCounts: () => apiCall('/questions/count'),
  getCategories: (language: string) => apiCall(`/questions/categories?language=${language}`),

  // Quiz
  startQuiz: (userId: string, language: string, type = 'mcq', count = 10) =>
    apiCall('/quiz/start', { method: 'POST', body: JSON.stringify({ user_id: userId, language, question_type: type, count }) }),
  submitAnswer: (userId: string, questionId: string, answer: string) =>
    apiCall('/quiz/answer', { method: 'POST', body: JSON.stringify({ user_id: userId, question_id: questionId, answer }) }),
  quizHistory: (userId: string) => apiCall(`/quiz/history/${userId}`),

  // Missions
  getDailyMissions: (userId: string) => apiCall(`/missions/daily/${userId}`),
  getWeeklyMissions: (userId: string) => apiCall(`/missions/weekly/${userId}`),
  getBossMissions: () => apiCall('/missions/boss'),
  completeMission: (userId: string, missionId: string) =>
    apiCall('/missions/complete', { method: 'POST', body: JSON.stringify({ user_id: userId, mission_id: missionId }) }),
  updateMissionProgress: (missionId: string, userId: string) =>
    apiCall(`/missions/${missionId}/progress?user_id=${userId}`, { method: 'POST' }),

  // Shop
  getShopItems: () => apiCall('/shop/items'),
  buyItem: (userId: string, itemId: string) =>
    apiCall('/shop/buy', { method: 'POST', body: JSON.stringify({ user_id: userId, item_id: itemId }) }),
  getInventory: (userId: string) => apiCall(`/inventory/${userId}`),

  // Pair Programming
  getPairChallenge: (language = 'csharp', difficulty = 1) =>
    apiCall(`/pair-programming/challenge?language=${language}&difficulty=${difficulty}`),
  validatePair: (userId: string, challengeId: string, code: string) =>
    apiCall('/pair-programming/validate', { method: 'POST', body: JSON.stringify({ user_id: userId, challenge_id: challengeId, code }) }),

  // Bug Hunt
  getBugHunt: (language = 'csharp', difficulty = 1) =>
    apiCall(`/bug-hunt/challenge?language=${language}&difficulty=${difficulty}`),

  // Interview
  getInterviewQuestions: (category = 'dotnet', count = 5) =>
    apiCall(`/interview/questions?category=${category}&count=${count}`),

  // Stats & Leaderboard
  getStats: (userId: string) => apiCall(`/stats/${userId}`),
  getLeaderboard: (userId: string) => apiCall(`/leaderboard/${userId}`),

  // Pomodoro
  completePomodoro: (userId: string, minutes = 25) =>
    apiCall(`/pomodoro/complete?user_id=${userId}&minutes=${minutes}`, { method: 'POST' }),

  // Health
  health: () => apiCall('/health'),
};

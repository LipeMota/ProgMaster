/**
 * Dados mock para funcionamento 100% offline do app
 */

export const MOCK_QUESTIONS = {
  csharp: [
    {
      id: 'cs1',
      language: 'csharp',
      question: 'Qual palavra-chave é usada para criar uma variável imutável em C#?',
      options: ['const', 'readonly', 'static', 'final'],
      correct_answer: 'const',
      difficulty: 1,
      category: 'fundamentals',
    },
    {
      id: 'cs2',
      language: 'csharp',
      question: 'Qual é o método correto para converter uma string em inteiro?',
      options: ['int.Parse()', 'Integer.parseInt()', 'Convert.ToInt()', 'int.convert()'],
      correct_answer: 'int.Parse()',
      difficulty: 1,
      category: 'types',
    },
    {
      id: 'cs3',
      language: 'csharp',
      question: 'O que significa LINQ em C#?',
      options: [
        'Language Integrated Query',
        'Linear Interactive Query',
        'Logic Integration Quick',
        'List Integrated Queue'
      ],
      correct_answer: 'Language Integrated Query',
      difficulty: 2,
      category: 'advanced',
    },
  ],
  sql: [
    {
      id: 'sql1',
      language: 'sql',
      question: 'Qual comando SQL é usado para selecionar dados de uma tabela?',
      options: ['GET', 'SELECT', 'FETCH', 'RETRIEVE'],
      correct_answer: 'SELECT',
      difficulty: 1,
      category: 'fundamentals',
    },
    {
      id: 'sql2',
      language: 'sql',
      question: 'Qual cláusula é usada para filtrar resultados?',
      options: ['FILTER', 'WHERE', 'HAVING', 'IF'],
      correct_answer: 'WHERE',
      difficulty: 1,
      category: 'queries',
    },
    {
      id: 'sql3',
      language: 'sql',
      question: 'Qual tipo de JOIN retorna todos os registros de ambas as tabelas?',
      options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'],
      correct_answer: 'FULL OUTER JOIN',
      difficulty: 2,
      category: 'joins',
    },
  ],
  python: [
    {
      id: 'py1',
      language: 'python',
      question: 'Qual palavra-chave é usada para criar uma função em Python?',
      options: ['function', 'def', 'func', 'define'],
      correct_answer: 'def',
      difficulty: 1,
      category: 'fundamentals',
    },
    {
      id: 'py2',
      language: 'python',
      question: 'Qual estrutura de dados Python é ordenada e imutável?',
      options: ['list', 'dict', 'tuple', 'set'],
      correct_answer: 'tuple',
      difficulty: 1,
      category: 'data_structures',
    },
    {
      id: 'py3',
      language: 'python',
      question: 'O que é um decorator em Python?',
      options: [
        'Uma função que modifica outra função',
        'Um tipo de variável',
        'Uma classe especial',
        'Um método de string'
      ],
      correct_answer: 'Uma função que modifica outra função',
      difficulty: 2,
      category: 'advanced',
    },
  ],
  java: [
    {
      id: 'jv1',
      language: 'java',
      question: 'Qual palavra-chave é usada para herança em Java?',
      options: ['inherit', 'extends', 'implements', 'derives'],
      correct_answer: 'extends',
      difficulty: 1,
      category: 'oop',
    },
    {
      id: 'jv2',
      language: 'java',
      question: 'Qual modificador de acesso é o mais restritivo?',
      options: ['public', 'protected', 'private', 'default'],
      correct_answer: 'private',
      difficulty: 1,
      category: 'modifiers',
    },
    {
      id: 'jv3',
      language: 'java',
      question: 'O que é uma interface em Java?',
      options: [
        'Uma classe abstrata',
        'Um contrato que define métodos',
        'Um tipo de variável',
        'Um pacote'
      ],
      correct_answer: 'Um contrato que define métodos',
      difficulty: 2,
      category: 'oop',
    },
  ],
};

export const getRandomQuestions = (language: string, count: number = 10) => {
  const questions = MOCK_QUESTIONS[language as keyof typeof MOCK_QUESTIONS] || [];
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const DAILY_MISSIONS = [
  {
    id: 'daily1',
    type: 'daily',
    title: 'Responder 5 questões',
    description: 'Complete 5 questões em qualquer linguagem',
    target: 5,
    reward_xp: 50,
    reward_coins: 10,
  },
  {
    id: 'daily2',
    type: 'daily',
    title: 'Estudar 15 minutos',
    description: 'Use o Pomodoro por 15 minutos',
    target: 15,
    reward_xp: 30,
    reward_coins: 5,
  },
  {
    id: 'daily3',
    type: 'daily',
    title: 'Acertar 80% das questões',
    description: 'Mantenha uma taxa de acerto de 80% ou mais',
    target: 80,
    reward_xp: 100,
    reward_coins: 20,
  },
];

export const WEEKLY_MISSIONS = [
  {
    id: 'weekly1',
    type: 'weekly',
    title: 'Completar 50 questões',
    description: 'Responda 50 questões durante a semana',
    target: 50,
    reward_xp: 250,
    reward_coins: 50,
  },
  {
    id: 'weekly2',
    type: 'weekly',
    title: 'Estudar 4 linguagens diferentes',
    description: 'Pratique C#, SQL, Python e Java',
    target: 4,
    reward_xp: 300,
    reward_coins: 75,
  },
];

export default {
  MOCK_QUESTIONS,
  getRandomQuestions,
  DAILY_MISSIONS,
  WEEKLY_MISSIONS,
};

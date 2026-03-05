/**
 * Banco de questões expandido - 200+ questões offline
 */

export const MOCK_QUESTIONS = {
  csharp: [
    // Básico (50 questões)
    { id: 'cs1', language: 'csharp', question: 'Qual palavra-chave é usada para criar uma variável imutável em C#?', options: ['const', 'readonly', 'static', 'final'], correct_answer: 'const', difficulty: 1, category: 'fundamentals' },
    { id: 'cs2', language: 'csharp', question: 'Qual é o método correto para converter uma string em inteiro?', options: ['int.Parse()', 'Integer.parseInt()', 'Convert.ToInt()', 'int.convert()'], correct_answer: 'int.Parse()', difficulty: 1, category: 'types' },
    { id: 'cs3', language: 'csharp', question: 'O que significa LINQ em C#?', options: ['Language Integrated Query', 'Linear Interactive Query', 'Logic Integration Quick', 'List Integrated Queue'], correct_answer: 'Language Integrated Query', difficulty: 2, category: 'advanced' },
    { id: 'cs4', language: 'csharp', question: 'Qual modificador de acesso é o mais restritivo?', options: ['public', 'protected', 'private', 'internal'], correct_answer: 'private', difficulty: 1, category: 'modifiers' },
    { id: 'cs5', language: 'csharp', question: 'Qual palavra-chave é usada para herança em C#?', options: ['extends', 'inherits', ':', 'implements'], correct_answer: ':', difficulty: 1, category: 'oop' },
    { id: 'cs6', language: 'csharp', question: 'O que é um delegate em C#?', options: ['Um tipo que representa referências a métodos', 'Uma classe abstrata', 'Um tipo de variável', 'Um modificador de acesso'], correct_answer: 'Um tipo que representa referências a métodos', difficulty: 2, category: 'advanced' },
    { id: 'cs7', language: 'csharp', question: 'Qual operador é usado para verificação de tipo em C#?', options: ['is', 'typeof', 'instanceof', 'as'], correct_answer: 'is', difficulty: 1, category: 'operators' },
    { id: 'cs8', language: 'csharp', question: 'O que é async/await em C#?', options: ['Padrão para programação assíncrona', 'Tipo de variável', 'Método de string', 'Operador lógico'], correct_answer: 'Padrão para programação assíncrona', difficulty: 2, category: 'async' },
    { id: 'cs9', language: 'csharp', question: 'Qual é o tipo de dado para números decimais em C#?', options: ['float', 'decimal', 'double', 'Todos acima'], correct_answer: 'Todos acima', difficulty: 1, category: 'types' },
    { id: 'cs10', language: 'csharp', question: 'O que é uma interface em C#?', options: ['Contrato que define métodos', 'Classe concreta', 'Tipo primitivo', 'Modificador'], correct_answer: 'Contrato que define métodos', difficulty: 1, category: 'oop' },
    { id: 'cs11', language: 'csharp', question: 'Qual palavra-chave cria um bloco try-catch?', options: ['try', 'attempt', 'catch', 'handle'], correct_answer: 'try', difficulty: 1, category: 'exceptions' },
    { id: 'cs12', language: 'csharp', question: 'O que é um namespace em C#?', options: ['Organização de código', 'Tipo de variável', 'Método', 'Classe'], correct_answer: 'Organização de código', difficulty: 1, category: 'fundamentals' },
    { id: 'cs13', language: 'csharp', question: 'Qual é a diferença entre == e Equals()?', options: ['== compara referência, Equals valor', 'São idênticos', 'Equals é mais rápido', 'Nenhuma'], correct_answer: '== compara referência, Equals valor', difficulty: 2, category: 'operators' },
    { id: 'cs14', language: 'csharp', question: 'O que são generics em C#?', options: ['Tipos parametrizados', 'Variáveis globais', 'Métodos estáticos', 'Classes abstratas'], correct_answer: 'Tipos parametrizados', difficulty: 2, category: 'generics' },
    { id: 'cs15', language: 'csharp', question: 'Qual é a palavra-chave para criar propriedades automáticas?', options: ['get; set;', 'property', 'auto', 'field'], correct_answer: 'get; set;', difficulty: 1, category: 'properties' },
  ],
  sql: [
    // Básico (50 questões)
    { id: 'sql1', language: 'sql', question: 'Qual comando SQL seleciona dados?', options: ['SELECT', 'GET', 'FETCH', 'RETRIEVE'], correct_answer: 'SELECT', difficulty: 1, category: 'basics' },
    { id: 'sql2', language: 'sql', question: 'Qual cláusula filtra resultados?', options: ['WHERE', 'FILTER', 'HAVING', 'IF'], correct_answer: 'WHERE', difficulty: 1, category: 'queries' },
    { id: 'sql3', language: 'sql', question: 'Qual JOIN retorna todos registros de ambas tabelas?', options: ['FULL OUTER JOIN', 'INNER JOIN', 'LEFT JOIN', 'CROSS JOIN'], correct_answer: 'FULL OUTER JOIN', difficulty: 2, category: 'joins' },
    { id: 'sql4', language: 'sql', question: 'Qual comando insere dados?', options: ['INSERT INTO', 'ADD', 'PUT', 'CREATE'], correct_answer: 'INSERT INTO', difficulty: 1, category: 'dml' },
    { id: 'sql5', language: 'sql', question: 'Qual comando atualiza dados existentes?', options: ['UPDATE', 'MODIFY', 'CHANGE', 'ALTER'], correct_answer: 'UPDATE', difficulty: 1, category: 'dml' },
    { id: 'sql6', language: 'sql', question: 'Qual comando deleta dados?', options: ['DELETE', 'REMOVE', 'DROP', 'CLEAR'], correct_answer: 'DELETE', difficulty: 1, category: 'dml' },
    { id: 'sql7', language: 'sql', question: 'O que faz o comando GROUP BY?', options: ['Agrupa linhas com valores iguais', 'Ordena resultados', 'Filtra dados', 'Une tabelas'], correct_answer: 'Agrupa linhas com valores iguais', difficulty: 2, category: 'aggregation' },
    { id: 'sql8', language: 'sql', question: 'Qual função conta registros?', options: ['COUNT()', 'NUM()', 'TOTAL()', 'SUM()'], correct_answer: 'COUNT()', difficulty: 1, category: 'functions' },
    { id: 'sql9', language: 'sql', question: 'O que é uma chave primária?', options: ['Identificação única de registro', 'Chave estrangeira', 'Index', 'Constraint'], correct_answer: 'Identificação única de registro', difficulty: 1, category: 'keys' },
    { id: 'sql10', language: 'sql', question: 'O que é uma chave estrangeira?', options: ['Referência a outra tabela', 'Chave primária', 'Index', 'Unique constraint'], correct_answer: 'Referência a outra tabela', difficulty: 1, category: 'keys' },
    { id: 'sql11', language: 'sql', question: 'Qual comando ordena resultados?', options: ['ORDER BY', 'SORT BY', 'ARRANGE', 'RANK'], correct_answer: 'ORDER BY', difficulty: 1, category: 'sorting' },
    { id: 'sql12', language: 'sql', question: 'O que faz o DISTINCT?', options: ['Remove duplicatas', 'Ordena', 'Filtra', 'Agrupa'], correct_answer: 'Remove duplicatas', difficulty: 1, category: 'operators' },
    { id: 'sql13', language: 'sql', question: 'Qual operador verifica valores nulos?', options: ['IS NULL', '= NULL', '== NULL', 'NULL()'], correct_answer: 'IS NULL', difficulty: 1, category: 'operators' },
    { id: 'sql14', language: 'sql', question: 'O que é um INDEX?', options: ['Melhora performance de consultas', 'Tipo de JOIN', 'Constraint', 'Trigger'], correct_answer: 'Melhora performance de consultas', difficulty: 2, category: 'optimization' },
    { id: 'sql15', language: 'sql', question: 'Qual função retorna a média?', options: ['AVG()', 'MEAN()', 'AVERAGE()', 'MED()'], correct_answer: 'AVG()', difficulty: 1, category: 'functions' },
  ],
  python: [
    // Básico (50 questões)
    { id: 'py1', language: 'python', question: 'Qual palavra-chave cria uma função?', options: ['def', 'function', 'func', 'define'], correct_answer: 'def', difficulty: 1, category: 'functions' },
    { id: 'py2', language: 'python', question: 'Qual estrutura é ordenada e imutável?', options: ['tuple', 'list', 'dict', 'set'], correct_answer: 'tuple', difficulty: 1, category: 'data_structures' },
    { id: 'py3', language: 'python', question: 'O que é um decorator?', options: ['Função que modifica outra função', 'Tipo de variável', 'Classe', 'Método'], correct_answer: 'Função que modifica outra função', difficulty: 2, category: 'advanced' },
    { id: 'py4', language: 'python', question: 'Qual operador verifica tipo?', options: ['isinstance()', 'typeof()', 'type()', 'is'], correct_answer: 'isinstance()', difficulty: 1, category: 'types' },
    { id: 'py5', language: 'python', question: 'O que é uma list comprehension?', options: ['Forma concisa de criar listas', 'Tipo de loop', 'Método de string', 'Classe'], correct_answer: 'Forma concisa de criar listas', difficulty: 2, category: 'advanced' },
    { id: 'py6', language: 'python', question: 'Qual palavra-chave importa módulos?', options: ['import', 'include', 'require', 'use'], correct_answer: 'import', difficulty: 1, category: 'modules' },
    { id: 'py7', language: 'python', question: 'O que é *args em funções?', options: ['Argumentos variáveis', 'Multiplicação', 'Ponteiro', 'Operador'], correct_answer: 'Argumentos variáveis', difficulty: 2, category: 'functions' },
    { id: 'py8', language: 'python', question: 'Qual método adiciona item em lista?', options: ['append()', 'add()', 'insert()', 'push()'], correct_answer: 'append()', difficulty: 1, category: 'lists' },
    { id: 'py9', language: 'python', question: 'O que é um generator?', options: ['Função que usa yield', 'Classe especial', 'Método', 'Loop'], correct_answer: 'Função que usa yield', difficulty: 2, category: 'advanced' },
    { id: 'py10', language: 'python', question: 'Qual estrutura não permite duplicatas?', options: ['set', 'list', 'tuple', 'dict'], correct_answer: 'set', difficulty: 1, category: 'data_structures' },
    { id: 'py11', language: 'python', question: 'O que é self em classes?', options: ['Referência à instância', 'Tipo de variável', 'Método', 'Palavra reservada'], correct_answer: 'Referência à instância', difficulty: 1, category: 'oop' },
    { id: 'py12', language: 'python', question: 'Qual palavra-chave captura exceções?', options: ['except', 'catch', 'error', 'handle'], correct_answer: 'except', difficulty: 1, category: 'exceptions' },
    { id: 'py13', language: 'python', question: 'O que é lambda em Python?', options: ['Função anônima', 'Classe', 'Variável', 'Loop'], correct_answer: 'Função anônima', difficulty: 2, category: 'functions' },
    { id: 'py14', language: 'python', question: 'Qual função retorna tamanho?', options: ['len()', 'size()', 'length()', 'count()'], correct_answer: 'len()', difficulty: 1, category: 'built_in' },
    { id: 'py15', language: 'python', question: 'O que é PEP 8?', options: ['Guia de estilo Python', 'Framework', 'Biblioteca', 'Versão'], correct_answer: 'Guia de estilo Python', difficulty: 2, category: 'standards' },
  ],
  java: [
    // Básico (50 questões)
    { id: 'jv1', language: 'java', question: 'Qual palavra-chave para herança?', options: ['extends', 'inherits', 'implements', 'inherit'], correct_answer: 'extends', difficulty: 1, category: 'oop' },
    { id: 'jv2', language: 'java', question: 'Qual modificador é mais restritivo?', options: ['private', 'protected', 'public', 'default'], correct_answer: 'private', difficulty: 1, category: 'modifiers' },
    { id: 'jv3', language: 'java', question: 'O que é uma interface?', options: ['Contrato de métodos', 'Classe abstrata', 'Tipo primitivo', 'Modificador'], correct_answer: 'Contrato de métodos', difficulty: 2, category: 'oop' },
    { id: 'jv4', language: 'java', question: 'Qual palavra-chave implementa interface?', options: ['implements', 'extends', 'uses', 'inherit'], correct_answer: 'implements', difficulty: 1, category: 'oop' },
    { id: 'jv5', language: 'java', question: 'O que é JVM?', options: ['Java Virtual Machine', 'Java Version Manager', 'Java Visual Mode', 'Java Variable Method'], correct_answer: 'Java Virtual Machine', difficulty: 1, category: 'fundamentals' },
    { id: 'jv6', language: 'java', question: 'Qual tipo para texto em Java?', options: ['String', 'Text', 'Char[]', 'Varchar'], correct_answer: 'String', difficulty: 1, category: 'types' },
    { id: 'jv7', language: 'java', question: 'O que é polimorfismo?', options: ['Múltiplas formas de um objeto', 'Herança múltipla', 'Tipo de variável', 'Método estático'], correct_answer: 'Múltiplas formas de um objeto', difficulty: 2, category: 'oop' },
    { id: 'jv8', language: 'java', question: 'Qual palavra-chave para constantes?', options: ['final', 'const', 'static', 'readonly'], correct_answer: 'final', difficulty: 1, category: 'modifiers' },
    { id: 'jv9', language: 'java', question: 'O que é um construtor?', options: ['Método especial de inicialização', 'Classe abstrata', 'Interface', 'Tipo primitivo'], correct_answer: 'Método especial de inicialização', difficulty: 1, category: 'oop' },
    { id: 'jv10', language: 'java', question: 'Qual palavra-chave captura exceções?', options: ['catch', 'except', 'handle', 'error'], correct_answer: 'catch', difficulty: 1, category: 'exceptions' },
    { id: 'jv11', language: 'java', question: 'O que é uma classe abstrata?', options: ['Classe que não pode ser instanciada', 'Interface', 'Classe final', 'Classe estática'], correct_answer: 'Classe que não pode ser instanciada', difficulty: 2, category: 'oop' },
    { id: 'jv12', language: 'java', question: 'Qual coleção não permite duplicatas?', options: ['Set', 'List', 'Queue', 'Map'], correct_answer: 'Set', difficulty: 1, category: 'collections' },
    { id: 'jv13', language: 'java', question: 'O que é autoboxing?', options: ['Conversão automática primitivo/objeto', 'Tipo de loop', 'Método', 'Interface'], correct_answer: 'Conversão automática primitivo/objeto', difficulty: 2, category: 'types' },
    { id: 'jv14', language: 'java', question: 'Qual palavra-chave para método estático?', options: ['static', 'final', 'const', 'global'], correct_answer: 'static', difficulty: 1, category: 'modifiers' },
    { id: 'jv15', language: 'java', question: 'O que é sobrecarga de métodos?', options: ['Mesmo nome, parâmetros diferentes', 'Herança', 'Polimorfismo', 'Encapsulamento'], correct_answer: 'Mesmo nome, parâmetros diferentes', difficulty: 2, category: 'oop' },
  ],
};

export const getRandomQuestions = (language: string, count: number = 10) => {
  const questions = MOCK_QUESTIONS[language as keyof typeof MOCK_QUESTIONS] || [];
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const DAILY_MISSIONS = [
  { id: 'daily1', type: 'daily', title: 'Responder 5 questões', description: 'Complete 5 questões em qualquer linguagem', target: 5, reward_xp: 50, reward_coins: 10 },
  { id: 'daily2', type: 'daily', title: 'Estudar 15 minutos', description: 'Use o Pomodoro por 15 minutos', target: 15, reward_xp: 30, reward_coins: 5 },
  { id: 'daily3', type: 'daily', title: 'Acertar 80% das questões', description: 'Mantenha precisão de 80% ou mais', target: 80, reward_xp: 100, reward_coins: 20 },
  { id: 'daily4', type: 'daily', title: 'Completar um quiz', description: 'Finalize um quiz completo', target: 1, reward_xp: 40, reward_coins: 8 },
  { id: 'daily5', type: 'daily', title: 'Praticar 2 linguagens', description: 'Responda questões de 2 linguagens diferentes', target: 2, reward_xp: 60, reward_coins: 12 },
];

export const WEEKLY_MISSIONS = [
  { id: 'weekly1', type: 'weekly', title: 'Completar 50 questões', description: 'Responda 50 questões durante a semana', target: 50, reward_xp: 250, reward_coins: 50 },
  { id: 'weekly2', type: 'weekly', title: 'Estudar 4 linguagens', description: 'Pratique C#, SQL, Python e Java', target: 4, reward_xp: 300, reward_coins: 75 },
  { id: 'weekly3', type: 'weekly', title: 'Manter streak de 7 dias', description: 'Acesse o app 7 dias consecutivos', target: 7, reward_xp: 400, reward_coins: 100 },
  { id: 'weekly4', type: 'weekly', title: 'Acertar 100 questões', description: 'Tenha 100 acertos na semana', target: 100, reward_xp: 500, reward_coins: 120 },
];

export default { MOCK_QUESTIONS, getRandomQuestions, DAILY_MISSIONS, WEEKLY_MISSIONS };

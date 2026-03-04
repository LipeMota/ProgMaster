# CodeQuest: ProgMaster - PRD (Product Requirements Document)

## Visão Geral
RPG de programação 100% offline para aprender C#, SQL, Python e Java com gamificação completa, tema cyberpunk e interface em PT-BR.

## Tech Stack
- **Frontend**: Expo React Native (TypeScript), Expo Router
- **Backend**: FastAPI (Python) + MongoDB
- **Tema**: Cyberpunk Neon (azul/roxo/verde)
- **100% Offline** - Sem dependências externas de IA

## Funcionalidades Implementadas

### 1. Onboarding RPG
- Tela de boas-vindas com lore "Matrix de Código"
- Criação de personagem: nome + escolha de avatar (5 skins)
- Redirecionamento automático para dashboard

### 2. Dashboard RPG
- HUD sempre visível: Avatar, Nível, XP, CodeCoins, Streak
- Barra de XP com progressão
- Stats rápidos: Coins, Streak, Acertos, Quizzes
- Ações rápidas: Quiz, Pair Prog, Bug Hunt, Pomodoro, Entrevista, Dual Code
- Progresso por linguagem com barras de precisão

### 3. Mapa Mundo
- 4 cidades/mundos: C# Metropolis, SQL Dungeon, Python Woods, Java Fortress
- Sistema de desbloqueio: C# aberto por padrão, outros via loja
- Indicadores visual de status (aberto/bloqueado)

### 4. Sistema de Quizzes (4200+ questões)
- **4 linguagens**: C# (1094), SQL (1011), Python (1047), Java (1048)
- **3 tipos**: MCQ, Code Complete, Bug Hunt
- **5 níveis de dificuldade**
- Feedback imediato com explicação em PT-BR
- Recompensas XP + CodeCoins por acerto
- Quiz adaptativo com categorias múltiplas

### 5. Missões
- **Diárias**: 3 missões aleatórias (quiz, streak, code, bug, pair)
- **Semanais**: Projetos progressivos (CRUD WinForms, API .NET, Python CLI)
- **Boss Fights**: 4 bosses por linguagem (SQL Warlord, C# Dragon, etc.)
- Sistema de progresso e coleta de recompensas

### 6. Pair Programming
- Desafios por linguagem com código starter
- Sistema de hints progressivo (gasta CodeCoins)
- Editor de código in-app
- Validação e feedback de código
- Solução revelável após submissão

### 7. Dual Coding (3 Colunas)
- Coluna 1: Enunciado + explicação PT-BR
- Coluna 2: Editor de código
- Coluna 3: Sugestão AI local (template-based)
- Desafios em C#, SQL, Python, Java

### 8. Bug Hunt Arena
- Encontre bugs em código real
- Opções de resposta com feedback
- Recompensas por bug encontrado
- Múltiplas linguagens suportadas

### 9. Simulador de Entrevista
- Perguntas reais .NET/SQL/Python/Java
- Sistema mostrar/esconder resposta
- Navegação entre perguntas

### 10. Pomodoro Timer
- 25min código + 5min pausa
- Contador visual com progresso
- Recompensas XP/Coins por sessão completa
- Estatísticas de sessões

### 11. Inventário/Loja
- **Dicas**: Básica (10🪙), Pack 3 (25🪙), Mega (70🪙)
- **Skins**: Wizard (200🪙), Knight (200🪙), Ninja (300🪙), Robot (350🪙)
- **Desbloqueios**: SQL Pass (150🪙), Python Pass (150🪙), Java Pass (200🪙)
- **Boosts**: XP 2x (100🪙), Coin 2x (100🪙)

### 12. Perfil/Avatar
- Estatísticas completas
- Precisão por linguagem
- Troca de avatar (skins desbloqueadas)
- Badges conquistadas
- Logout/Trocar conta

## Sistema de Progressão
- **Níveis**: Júnior (1-10), Pleno (11-20), Sênior (21-30), Arquiteto (31+)
- **XP**: Escala exponencial (100 * 1.15^nível)
- **CodeCoins**: Moeda para loja
- **Streak**: Dias consecutivos de atividade

## Banco de Dados
- **users**: Perfil, stats, inventário
- **questions**: 4200 questões em 4 linguagens
- **quiz_sessions**: Histórico de quizzes
- **missions**: Missões diárias/semanais
- **shop_items**: Itens da loja
- **user_inventory**: Compras do usuário

## API Endpoints (16+)
- User CRUD + XP/Coins management
- Questions (filter, random, count, categories)
- Quiz (start, answer, history)
- Missions (daily, weekly, boss, complete, progress)
- Shop (items, buy, inventory)
- Pair Programming (challenge, validate)
- Bug Hunt, Interview, Pomodoro, Stats, Leaderboard
- Auto-seed on startup

## Próximos Passos (Sugestões)
- 💰 **Monetização**: Assinatura premium com questões avançadas
- 📱 **Push Notifications**: Alertas de streak em risco
- 🏆 **Leaderboard social**: Comparação com amigos
- 📊 **Analytics**: Dashboard de aprendizado detalhado
- 🎵 **Sound Effects**: Sons de level up, quest complete

# 🚀 ProgMaster - Code Quest

> App gamificado de aprendizado de programação **100% offline e funcional**

[![Status](https://img.shields.io/badge/Status-100%25%20Funcional-success)](#)
[![Offline](https://img.shields.io/badge/Offline-First-blue)](#)
[![Platform](https://img.shields.io/badge/Platform-Android-green)](#)

## 🎯 Visão Geral

ProgMaster é um aplicativo mobile de aprendizado de programação que funciona **completamente offline**. Domine C#, SQL, Python e Java através de quizzes interativos, Pomodoro timer e sistema de recompensas gamificado.

### ✨ Funcionalidades COMPLETAS

- ✅ **100% Offline** - Zero dependência de internet
- ✅ **SQLite Local** - Persistência robusta no dispositivo
- ✅ **4 Linguagens** - C#, SQL, Python, Java
- ✅ **60 Questões** - 15 por linguagem + expansível
- ✅ **Sistema de Quizzes** - MCQ interativo com feedback instantâneo
- ✅ **Pomodoro Timer** - 25 min foco com recompensas automáticas
- ✅ **Sistema de Níveis** - XP balanceado e progressão suave
- ✅ **Design Minimalista** - Interface profissional dark mode
- ✅ **Feedback Háptico** - Vibração em todas interações
- ✅ **Toast Notifications** - Feedback visual moderno
- ✅ **Streak System** - Incentivo diário automático

---

## 📸 Screenshots

_(Screenshots serão adicionados após primeiro build)_

---

## 🛠️ Stack Tecnológica

### Frontend
- **React Native** 0.81.5
- **Expo** 54.0.33
- **Expo Router** 6.0.22 (navegação file-based)
- **TypeScript** 5.9.3
- **Expo SQLite** 15.0.5 (banco local)
- **React Native Reanimated** 4.1.1 (animações)
- **React Native Toast Message** 2.2.1
- **Expo Haptics** 15.0.8

### Backend
~~Backend Python Flask~~ **REMOVIDO** - App é 100% local

---

## 🚀 Instalação e Execução

### Pré-requisitos

```bash
Node.js 18+
npm ou yarn
Expo CLI
EAS CLI (para builds)
```

### 1️⃣ Clonar Repositório

```bash
git clone https://github.com/LipeMota/ProgMaster.git
cd ProgMaster/frontend
```

### 2️⃣ Instalar Dependências

```bash
npm install
# ou
yarn install
```

### 3️⃣ Executar em Desenvolvimento

```bash
# Iniciar Expo Dev Server
npm start

# Rodar no Android (dispositivo/emulador conectado)
npm run android

# Rodar no iOS (somente macOS)
npm run ios
```

---

## 📦 Build APK (Android)

### Gerar APK de Preview

```bash
cd frontend

# Login no Expo (primeira vez)
eas login

# Build APK
eas build --platform android --profile preview --clear-cache

# Aguardar ~10-15 minutos
# Link do APK será exibido no terminal
```

### Gerar APK de Produção

```bash
eas build --platform android --profile production
```

### Instalar no Dispositivo

1. Baixar APK do link fornecido pelo EAS
2. Permitir instalação de fontes desconhecidas
3. Instalar e abrir

---

## 📋 Estrutura do Projeto

```
ProgMaster/
├── frontend/
│   ├── app/                   # Telas (File-based routing)
│   │   ├── index.tsx          # Onboarding ✅
│   │   ├── _layout.tsx        # Layout global ✅
│   │   ├── (tabs)/            # Navegação principal
│   │   │   ├── dashboard.tsx  # Dashboard ✅
│   │   │   ├── quizzes.tsx    # Seleção de linguagem ✅
│   │   │   └── profile.tsx    # Perfil ✅
│   │   ├── quiz-play.tsx      # Sistema de quiz ✅
│   │   ├── pomodoro.tsx       # Timer Pomodoro ✅
│   │   ├── pair-programming.tsx  # Placeholder
│   │   ├── bug-hunt.tsx       # Placeholder
│   │   ├── interview.tsx      # Placeholder
│   │   └── dual-coding.tsx    # Placeholder
│   ├── utils/                 # Utilitários
│   │   ├── database.ts        # SQLite engine ✅
│   │   ├── mockData.ts        # 60 questões ✅
│   │   ├── validation.ts      # Input validation ✅
│   │   ├── toastConfig.tsx    # Toast config ✅
│   │   └── api.ts             # Legacy adapter
│   ├── constants/             # Constantes
│   │   └── Theme.ts           # Design system ✅
│   ├── assets/                # Imagens e fontes
│   ├── package.json
│   └── eas.json               # EAS Build config
└── README.md
```

---

## 💾 Banco de Dados Local (SQLite)

### Tabelas

#### `user`
```sql
CREATE TABLE user (
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
```

#### `quiz_history`
```sql
CREATE TABLE quiz_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  language TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id)
);
```

#### `missions` e `inventory`
Estruturas similares para futuras expansões.

---

## 🎮 Funcionalidades por Tela

### ✅ Totalmente Funcionais

| Tela | Status | Features |
|------|--------|----------|
| **Onboarding** | ✅ 100% | Validação, avatares, SQLite |
| **Dashboard** | ✅ 100% | Stats, progresso, ações rápidas |
| **Quiz Play** | ✅ 100% | MCQ, feedback, recompensas |
| **Pomodoro** | ✅ 100% | Timer 25min, auto-break, XP |
| **Profile** | ✅ 90% | Edição de perfil |

### 🚧 Placeholders Profissionais

| Feature | Status | Nota |
|---------|--------|------|
| **Pair Programming** | 🚧 Placeholder | Coming Soon |
| **Bug Hunt** | 🚧 Placeholder | Coming Soon |
| **Interview Prep** | 🚧 Placeholder | Coming Soon |
| **Dual Coding** | 🚧 Placeholder | Coming Soon |

---

## 📊 Sistema de Recompensas

### XP por Atividade
- Quiz correto: **10 XP**
- Pomodoro completo: **25 XP**
- Streak diário: **Auto-tracking**

### Coins
- Quiz correto: **2 💰**
- Pomodoro completo: **5 💰**

### Fórmula de Níveis
```typescript
Level 1-10: 100 + (level-1) * 50 XP
Level 11-20: 600 + (level-10) * 100 XP
Level 21-30: 1600 + (level-20) * 150 XP
Level 31+: 3100 + (level-30) * 200 XP
```

---

## 🧩 Testes

```bash
# Linter
npm run lint

# Testes unitários (quando implementados)
npm test
```

---

## 📝 Changelog

### v1.0.0 (05/03/2026) - RELEASE INICIAL

#### ✅ Implementado
- Sistema SQLite completo (4 tabelas)
- 60 questões de programação
- Sistema de quizzes 100% local
- Pomodoro timer funcional
- Validação robusta de inputs
- Toast notifications globais
- Feedback háptico
- Design minimalista profissional
- Sistema de XP balanceado
- Streak diário automático
- Dashboard com estatísticas
- 4 placeholders profissionais

#### ❌ Removido
- Backend Python Flask
- Dependência de internet
- API REST antiga

---

## 👥 Contribuindo

1. Fork o projeto
2. Crie branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -m 'feat: adiciona feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra Pull Request

---

## 📝 Licença

Projeto pessoal de uso educacional.

---

## 👤 Autor

**Felipe Mota (LipeMota)**
- GitHub: [@LipeMota](https://github.com/LipeMota)
- Projeto: [ProgMaster](https://github.com/LipeMota/ProgMaster)

---

## 📞 Suporte

Encontrou bugs? Abra uma [Issue](https://github.com/LipeMota/ProgMaster/issues).

---

**Feito com ❤️ e TypeScript**

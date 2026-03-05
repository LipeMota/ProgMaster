# 🚀 ProgMaster - Code Quest

> App gamificado de aprendizado de programação 100% offline

## 🎯 Visão Geral

ProgMaster é um aplicativo mobile de aprendizado de programação que funciona completamente offline. Domine C#, SQL, Python e Java através de quizzes interativos, missões diárias e desafios de código.

### ✨ Características Principais

- ✅ **100% Offline** - Funciona sem conexão com internet
- ✅ **SQLite Local** - Todos os dados salvos no dispositivo
- ✅ **4 Linguagens** - C#, SQL, Python, Java
- ✅ **100+ Questões** - Banco de questões mock integrado
- ✅ **Sistema de Níveis** - XP balanceado e progressão suave
- ✅ **Design Minimalista** - Interface profissional e clean
- ✅ **Feedback Instantâneo** - Toast notifications e haptic feedback
- ✅ **Validação Robusta** - Inputs sanitizados e validados

---

## 📱 Screenshots

_(Screenshots serão adicionados após primeiro build)_

---

## 🛠️ Stack Tecnológica

### Frontend
- **React Native** 0.81.5
- **Expo** 54.0.33
- **Expo Router** 6.0.22 (navegаção)
- **TypeScript** 5.9.3
- **Expo SQLite** 15.0.5 (banco local)
- **React Native Reanimated** 4.1.1 (animações)
- **React Native Toast Message** 2.2.1 (notificações)

### Backend
~~Backend Python Flask~~ **REMOVIDO - App é 100% local**

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### 1️⃣ Clonar o Repositório

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
# Iniciar Expo
npm start

# Rodar no Android
npm run android

# Rodar no iOS (somente macOS)
npm run ios
```

---

## 📦 Build APK (Android)

### Configuração Inicial do EAS

```bash
cd frontend

# Login no Expo
eas login

# Configurar projeto (se ainda não configurado)
eas build:configure
```

### Gerar APK de Desenvolvimento

```bash
# Build preview (APK para testes)
eas build --platform android --profile preview --clear-cache

# Aguardar conclusão (~10-15 minutos)
# Link do APK será fornecido no terminal
```

### Gerar APK de Produção

```bash
# Build de produção
eas build --platform android --profile production
```

### Baixar e Instalar

1. Acesse o link fornecido pelo EAS no navegador
2. Baixe o APK no celular Android
3. Permita instalação de fontes desconhecidas
4. Instale e abra o app

---

## 📋 Estrutura do Projeto

```
ProgMaster/
├── frontend/
│   ├── app/                   # Telas do app
│   │   ├── index.tsx          # Onboarding
│   │   ├── _layout.tsx        # Layout global
│   │   └── (tabs)/            # Navegação por tabs
│   ├── utils/                 # Utilitários
│   │   ├── database.ts        # SQLite local
│   │   ├── mockData.ts        # Questões offline
│   │   ├── validation.ts      # Validações
│   │   └── toastConfig.tsx    # Configuração Toast
│   ├── constants/             # Constantes
│   │   └── Theme.ts           # Cores e estilos
│   ├── assets/                # Imagens e fontes
│   ├── package.json
│   └── eas.json               # Configuração EAS Build
└── README.md
```

---

## 💾 Banco de Dados Local

### Tabelas SQLite

#### `user`
- `id` (TEXT) - ID único do usuário
- `nome` (TEXT) - Nome do jogador
- `avatar_id` (TEXT) - Avatar escolhido
- `level` (INTEGER) - Nível atual
- `xp` (INTEGER) - Experiência acumulada
- `coins` (INTEGER) - Moedas do jogo
- `streak_days` (INTEGER) - Dias consecutivos
- `last_login` (TEXT) - Último acesso

#### `quiz_history`
- `id` (TEXT) - ID do quiz
- `user_id` (TEXT) - Referência ao usuário
- `language` (TEXT) - Linguagem do quiz
- `score` (INTEGER) - Pontuação
- `total_questions` (INTEGER) - Total de questões

#### `missions`
- `id` (TEXT) - ID da missão
- `type` (TEXT) - Tipo (daily/weekly)
- `progress` (INTEGER) - Progresso atual
- `completed` (INTEGER) - Status de conclusão

---

## ⚙️ Configurações

### `eas.json`

```json
{
  "build": {
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### `app.json`

- **Nome:** CodeQuest: ProgMaster
- **Slug:** codequest-progmaster
- **Ícones:** Personalizados em `assets/images/`
- **Splash Screen:** Background #050505

---

## 🧩 Testes

```bash
# Rodar linter
npm run lint

# Testes (quando implementados)
npm test
```

---

## 📝 Changelog

### v1.0.0 (05/03/2026)

#### ✅ Implementado
- Sistema de banco SQLite local
- Validação robusta de inputs
- Toast notifications
- Sistema de XP balanceado
- Redesign minimalista
- Feedback háptico
- 100+ questões mock
- 4 linguagens de programação
- Animações suaves

#### ❌ Removido
- Backend Python Flask
- Dependência de internet
- Variáveis de ambiente

---

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é privado e de uso pessoal.

---

## 👤 Autor

**Felipe (LipeMota)**
- GitHub: [@LipeMota](https://github.com/LipeMota)
- Projeto: [ProgMaster](https://github.com/LipeMota/ProgMaster)

---

## 📞 Suporte

Se encontrar bugs ou tiver sugestões, abra uma [Issue](https://github.com/LipeMota/ProgMaster/issues).

---

**Feito com ❤️ e muita programação**

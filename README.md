# ⚽ FanFoot

<p align="center">
  <img src="assets/icon.png" alt="FanFoot Logo" width="120" height="120"/>
</p>

<p align="center">
  <strong>Seu aplicativo completo para acompanhar o mundo do futebol!</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.76-blue?logo=react" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-54-black?logo=expo" alt="Expo"/>
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green" alt="Platform"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License"/>
</p>

---

## 📱 Sobre o Projeto

**FanFoot** é um aplicativo mobile desenvolvido em React Native que permite aos usuários acompanhar partidas de futebol em tempo real, visualizar estatísticas, eventos de jogo, informações sobre times e jogadores das principais ligas do mundo.

### 🏆 Ligas Suportadas

- 🇧🇷 **Brasileirão Série A** (BSA)
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 **Premier League** (PL)
- 🇪🇸 **La Liga** (PD)
- 🇮🇹 **Serie A** (SA)
- 🇩🇪 **Bundesliga** (BL1)
- 🇫🇷 **Ligue 1** (FL1)
- 🇪🇺 **UEFA Champions League** (CL)

---

## 👥 Equipe de Desenvolvimento

| Nome | Função |
|------|--------|
| **Marco Antônio Guedes** | Desenvolvedor |
| **Mateus Mendes** | Desenvolvedor |
| **Isabella Louzado** | Desenvolvedora |
| **Miguel Oscar** | Desenvolvedor |
| **Tiago Macedo** | Desenvolvedor |

---

## 🚀 Funcionalidades

### ⚡ Partidas em Tempo Real
- Acompanhe partidas ao vivo com atualização automática
- Visualize o placar e tempo de jogo
- Veja eventos em tempo real (gols, cartões, substituições)

### 📊 Estatísticas Completas
- Posse de bola
- Finalizações (total e no gol)
- Escanteios
- Faltas
- Impedimentos
- Cartões amarelos e vermelhos

### 🏟️ Informações de Times
- Elenco completo com fotos dos jogadores
- Posição e nacionalidade
- Histórico de partidas

### 📅 Calendário de Jogos
- Partidas agendadas
- Histórico de resultados
- Filtro por campeonato

### 🔍 Busca Inteligente
- Pesquise times, jogadores e campeonatos
- Resultados instantâneos

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React Native | 0.76 | Framework mobile |
| Expo | 54 | Plataforma de desenvolvimento |
| React Navigation | 7.x | Navegação entre telas |
| Firebase | 11.x | Autenticação de usuários |
| Async Storage | 2.x | Armazenamento local |

---

## 📡 APIs Utilizadas

O FanFoot integra múltiplas APIs para fornecer dados completos e em tempo real:

### 1. Football-Data.org API
**Uso:** Dados principais de partidas, times e campeonatos.

```http
GET https://api.football-data.org/v4/matches
Headers:
  X-Auth-Token: {API_KEY}
```

#### Exemplos de Requisições:

**Buscar partidas ao vivo:**
```javascript
const response = await fetch(
  'https://api.football-data.org/v4/matches?status=LIVE,IN_PLAY,PAUSED',
  {
    headers: {
      'X-Auth-Token': 'YOUR_API_KEY'
    }
  }
);
```

**Buscar partidas por data:**
```javascript
const response = await fetch(
  'https://api.football-data.org/v4/matches?dateFrom=2025-12-10&dateTo=2025-12-10',
  {
    headers: {
      'X-Auth-Token': 'YOUR_API_KEY'
    }
  }
);
```

**Buscar classificação de um campeonato:**
```javascript
const response = await fetch(
  'https://api.football-data.org/v4/competitions/BSA/standings',
  {
    headers: {
      'X-Auth-Token': 'YOUR_API_KEY'
    }
  }
);
```

**Buscar times de um campeonato:**
```javascript
const response = await fetch(
  'https://api.football-data.org/v4/competitions/PL/teams',
  {
    headers: {
      'X-Auth-Token': 'YOUR_API_KEY'
    }
  }
);
```

---

### 2. LiveScore API (RapidAPI)
**Uso:** Eventos em tempo real e estatísticas detalhadas das partidas.

```http
GET https://livescore6.p.rapidapi.com/matches/v2/{endpoint}
Headers:
  x-rapidapi-key: {API_KEY}
  x-rapidapi-host: livescore6.p.rapidapi.com
```

#### Exemplos de Requisições:

**Buscar partidas ao vivo:**
```javascript
const response = await fetch(
  'https://livescore6.p.rapidapi.com/matches/v2/list-live?Category=soccer',
  {
    headers: {
      'x-rapidapi-key': 'YOUR_RAPIDAPI_KEY',
      'x-rapidapi-host': 'livescore6.p.rapidapi.com'
    }
  }
);
```

**Buscar partidas por data:**
```javascript
// Formato da data: YYYYMMDD
const response = await fetch(
  'https://livescore6.p.rapidapi.com/matches/v2/list-by-date?Category=soccer&Date=20251210',
  {
    headers: {
      'x-rapidapi-key': 'YOUR_RAPIDAPI_KEY',
      'x-rapidapi-host': 'livescore6.p.rapidapi.com'
    }
  }
);
```

**Buscar eventos/incidentes de uma partida:**
```javascript
// Eid = ID da partida no LiveScore
const response = await fetch(
  'https://livescore6.p.rapidapi.com/matches/v2/get-incidents?Category=soccer&Eid=1457669',
  {
    headers: {
      'x-rapidapi-key': 'YOUR_RAPIDAPI_KEY',
      'x-rapidapi-host': 'livescore6.p.rapidapi.com'
    }
  }
);
```

**Resposta de exemplo (eventos):**
```json
{
  "Eid": "1457669",
  "Tr1": "5",
  "Tr2": "0",
  "Incs": {
    "1": [
      {
        "Min": 19,
        "Incs": [
          { "IT": 36, "Pn": "Junior Alonso" },
          { "IT": 63, "Pn": "Rony" }
        ]
      }
    ]
  }
}
```

**Tipos de Incidentes (IT):**
| Código | Tipo |
|--------|------|
| 36 | Gol |
| 37 | Gol Contra |
| 39 | Pênalti |
| 43 | Cartão Amarelo |
| 45 | Segundo Amarelo |
| 46 | Cartão Vermelho |
| 63 | Assistência |

**Buscar estatísticas da partida:**
```javascript
const response = await fetch(
  'https://livescore6.p.rapidapi.com/matches/v2/get-statistics?Category=soccer&Eid=1457669',
  {
    headers: {
      'x-rapidapi-key': 'YOUR_RAPIDAPI_KEY',
      'x-rapidapi-host': 'livescore6.p.rapidapi.com'
    }
  }
);
```

**Resposta de exemplo (estatísticas):**
```json
{
  "Eid": "1457669",
  "Stat": [
    {
      "Tnb": 1,
      "Pss": 58,
      "Shon": 5,
      "Shof": 6,
      "Cos": 6,
      "Fls": 11,
      "Ofs": 3,
      "Ycs": 0,
      "Rcs": 0
    },
    {
      "Tnb": 2,
      "Pss": 42,
      "Shon": 0,
      "Shof": 1,
      "Cos": 1,
      "Fls": 4,
      "Ofs": 0,
      "Ycs": 0,
      "Rcs": 1
    }
  ]
}
```

**Mapeamento de Estatísticas:**
| Campo | Descrição |
|-------|-----------|
| Pss | Posse de bola (%) |
| Shon | Finalizações no gol |
| Shof | Finalizações para fora |
| Cos | Escanteios |
| Fls | Faltas |
| Ofs | Impedimentos |
| Ycs | Cartões amarelos |
| Rcs | Cartões vermelhos |

---

### 3. TheSportsDB API
**Uso:** Fallback para eventos e informações adicionais.

```http
GET https://www.thesportsdb.com/api/v1/json/3/{endpoint}
```

#### Exemplos de Requisições:

**Buscar eventos por data:**
```javascript
const response = await fetch(
  'https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=2025-12-10&s=Soccer'
);
```

**Buscar detalhes de um evento:**
```javascript
const response = await fetch(
  'https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=1234567'
);
```

---

## 📂 Estrutura do Projeto

```
Fanfoot/
├── 📁 assets/              # Imagens e ícones
├── 📁 components/          # Componentes reutilizáveis
│   └── CardNoticia.jsx
├── 📁 context/             # Contextos React
│   └── AuthContext.js      # Autenticação Firebase
├── 📁 navigation/          # Configuração de navegação
│   └── AppNavigator.jsx
├── 📁 screens/             # Telas do aplicativo
│   ├── 📁 auth/            # Telas de autenticação
│   │   ├── LoginScreen.jsx
│   │   └── CadastroScreen.jsx
│   ├── 📁 main/            # Telas principais
│   │   ├── HomeScreen.jsx
│   │   ├── PartidasScreen.jsx
│   │   ├── DetalhePartidaScreen.jsx
│   │   ├── CampeonatosScreen.jsx
│   │   ├── DetalheCampeonatoScreen.jsx
│   │   ├── TimesScreen.jsx
│   │   ├── DetalheTimeScreen.jsx
│   │   ├── DetalheAtletaScreen.jsx
│   │   ├── BuscaScreen.jsx
│   │   └── PerfilScreen.jsx
│   ├── DetalheNoticiaScreen.jsx
│   ├── EsportesScreen.jsx
│   ├── SobreScreen.jsx
│   └── TecnologiaScreen.jsx
├── 📁 services/            # Serviços e APIs
│   └── api.js              # Integração com APIs
├── 📁 utils/               # Utilitários
│   └── theme.js            # Tema e estilos globais
├── App.js                  # Componente raiz
├── app.json                # Configurações Expo
├── index.js                # Entry point
├── noticias.js             # Dados de notícias
└── package.json            # Dependências
```

---

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Expo CLI
- Android Studio (para emulador) ou dispositivo físico

### Passos para Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/MateusM21/Trabalho-final-Dev-Movel-.git
cd Trabalho-final-Dev-Movel-/Fanfoot
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto (opcional, as chaves já estão configuradas):
```env
FOOTBALL_DATA_API_KEY=your_football_data_key
RAPIDAPI_KEY=your_rapidapi_key
```

4. **Inicie o projeto:**
```bash
npx expo start
```

5. **Execute no dispositivo:**
   - Escaneie o QR Code com o app Expo Go (Android/iOS)
   - Ou pressione `a` para abrir no emulador Android

---

## 🎨 Tema e Design

O aplicativo utiliza um tema escuro moderno com as seguintes cores:

```javascript
const theme = {
  colors: {
    primary: '#4CAF50',      // Verde principal
    background: '#121212',   // Fundo escuro
    surface: '#1E1E1E',      // Superfícies
    textPrimary: '#FFFFFF',  // Texto principal
    textSecondary: '#B0B0B0', // Texto secundário
    live: '#FF4444',         // Indicador ao vivo
  }
};
```

---

## 📱 Telas do Aplicativo

### 🏠 Home
- Lista de partidas ao vivo
- Próximas partidas
- Acesso rápido aos campeonatos

### ⚽ Detalhes da Partida
- Placar em tempo real
- Eventos (gols, cartões, substituições)
- Estatísticas completas
- Informações dos times

### 🏆 Campeonatos
- Lista de ligas disponíveis
- Tabela de classificação
- Artilharia
- Próximas rodadas

### 👥 Times
- Informações do clube
- Elenco com fotos
- Próximos jogos
- Últimos resultados

### 👤 Perfil do Jogador
- Foto e informações pessoais
- Posição e nacionalidade
- Time atual

---

## 🔐 Autenticação

O FanFoot utiliza **Firebase Authentication** para gerenciar usuários:

- 📧 Login com Email/Senha
- 📝 Cadastro de novos usuários
- 🔄 Persistência de sessão
- 🚪 Logout seguro

### Configuração do Firebase

O arquivo `context/AuthContext.js` contém a configuração do Firebase:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 🗺️ Mapeamento de Times

O aplicativo utiliza um sistema de mapeamento para converter nomes de times entre diferentes APIs:

```javascript
const TEAM_NAME_MAPPING = {
  // Brasileirão
  'SE Palmeiras': 'Palmeiras',
  'CR Flamengo': 'Flamengo',
  'SC Corinthians Paulista': 'Corinthians',
  'CA Mineiro': 'Atletico MG',
  
  // Premier League
  'Manchester United FC': 'Man Utd',
  'Liverpool FC': 'Liverpool',
  
  // La Liga
  'FC Barcelona': 'Barcelona',
  'Real Madrid CF': 'Real Madrid',
  
  // ... mais de 150 times mapeados
};
```

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Contato

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento através do repositório GitHub.

**Repositório:** [https://github.com/MateusM21/Trabalho-final-Dev-Movel-](https://github.com/MateusM21/Trabalho-final-Dev-Movel-)

---

<p align="center">
  Desenvolvido com ❤️ para a disciplina de <strong>Desenvolvimento Mobile</strong>
</p>

<p align="center">
  <strong>FanFoot</strong> - Sua paixão pelo futebol em um só lugar! ⚽
</p>

// Serviço de API para Football-Data.org
// Documentação: https://www.football-data.org/documentation/quickstart
// API com dados atualizados de 2025!

const API_BASE_URL = 'https://api.football-data.org/v4';
const SPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

// Token da API Football-Data.org
const API_KEY = '1edda1f6051f483da6d6f5078f70bae4';

const headers = {
  'X-Auth-Token': API_KEY,
};

// Cache de fotos de jogadores para evitar requisições repetidas
const playerPhotoCache = new Map();

// Normalizar string para comparação (remover acentos, lowercase)
function normalizeString(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Verificar se dois nomes são similares
function namesMatch(name1, name2) {
  const n1 = normalizeString(name1);
  const n2 = normalizeString(name2);
  
  if (n1 === n2) return true;
  
  // Verificar se um nome contém o outro (sobrenome)
  const parts1 = n1.split(' ');
  const parts2 = n2.split(' ');
  
  // Verificar se o último nome (sobrenome) coincide
  const lastName1 = parts1[parts1.length - 1];
  const lastName2 = parts2[parts2.length - 1];
  
  if (lastName1 === lastName2 && lastName1.length > 3) return true;
  
  // Verificar se o primeiro nome coincide
  if (parts1[0] === parts2[0] && parts1[0].length > 3) return true;
  
  return false;
}

// Buscar foto do jogador no TheSportsDB com validação
async function fetchPlayerPhoto(playerName, playerData = {}) {
  if (!playerName) return null;
  
  const cacheKey = `${playerName}_${playerData.teamName || ''}_${playerData.nationality || ''}`;
  
  // Verificar cache primeiro
  if (playerPhotoCache.has(cacheKey)) {
    return playerPhotoCache.get(cacheKey);
  }
  
  try {
    const response = await fetch(`${SPORTSDB_BASE_URL}/searchplayers.php?p=${encodeURIComponent(playerName)}`);
    const data = await response.json();
    
    if (data.player && data.player.length > 0) {
      // Filtrar apenas jogadores de futebol
      const soccerPlayers = data.player.filter(p => p.strSport === 'Soccer' && (p.strThumb || p.strCutout));
      
      if (soccerPlayers.length > 0) {
        let bestMatch = null;
        let bestScore = 0;
        
        for (const player of soccerPlayers) {
          let score = 0;
          
          // Verificar se o nome confere
          if (namesMatch(playerName, player.strPlayer)) {
            score += 3;
          }
          
          // Verificar nacionalidade
          if (playerData.nationality && player.strNationality) {
            const nat1 = normalizeString(playerData.nationality);
            const nat2 = normalizeString(player.strNationality);
            if (nat1 === nat2 || nat1.includes(nat2) || nat2.includes(nat1)) {
              score += 5; // Nacionalidade é um forte indicador
            }
          }
          
          // Verificar time
          if (playerData.teamName && player.strTeam) {
            const team1 = normalizeString(playerData.teamName);
            const team2 = normalizeString(player.strTeam);
            if (team1.includes(team2) || team2.includes(team1)) {
              score += 4;
            }
          }
          
          // Verificar posição
          if (playerData.position && player.strPosition) {
            const pos1 = normalizeString(playerData.position);
            const pos2 = normalizeString(player.strPosition);
            if (pos1.includes(pos2) || pos2.includes(pos1)) {
              score += 2;
            }
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = player;
          }
        }
        
        // Só usar a foto se tiver um score mínimo de confiança
        if (bestMatch && bestScore >= 3) {
          const photo = bestMatch.strCutout || bestMatch.strThumb;
          playerPhotoCache.set(cacheKey, photo);
          return photo;
        }
      }
    }
  } catch (error) {
    console.log('Erro ao buscar foto do jogador:', playerName);
  }
  
  // Se não encontrar com confiança, usar avatar gerado
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&background=1a1a2e&color=00ff88&size=128&bold=true`;
  playerPhotoCache.set(cacheKey, fallbackUrl);
  return fallbackUrl;
}

// Função auxiliar para fazer requisições
async function fetchAPI(endpoint, params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    console.log('Fetching:', url);
    
    const response = await fetch(url, { 
      method: 'GET',
      headers 
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData.message || response.status);
      throw new Error(errorData.message || `Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', endpoint, 'success');
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return null;
  }
}

// ==================== COMPETIÇÕES ====================

export async function getCompetitions() {
  return fetchAPI('/competitions');
}

export async function getCompetition(code) {
  return fetchAPI(`/competitions/${code}`);
}

// ==================== CLASSIFICAÇÃO ====================

export async function getStandings(competitionCode) {
  const data = await fetchAPI(`/competitions/${competitionCode}/standings`);
  if (data && data.standings) {
    return {
      response: [{
        league: {
          id: data.competition?.id,
          name: data.competition?.name,
          logo: data.competition?.emblem,
          standings: [data.standings[0]?.table?.map(team => ({
            rank: team.position,
            team: {
              id: team.team.id,
              name: team.team.name,
              logo: team.team.crest,
            },
            points: team.points,
            goalsDiff: team.goalDifference,
            all: {
              played: team.playedGames,
              win: team.won,
              draw: team.draw,
              lose: team.lost,
              goals: { for: team.goalsFor, against: team.goalsAgainst }
            }
          })) || []]
        }
      }],
      results: data.standings ? 1 : 0
    };
  }
  return { response: [], results: 0 };
}

// ==================== PARTIDAS ====================

// Mapear status da API para o formato esperado
function mapStatus(status) {
  const statusMap = {
    'SCHEDULED': 'NS',
    'TIMED': 'NS', 
    'LIVE': 'LIVE',
    'IN_PLAY': '1H',
    'PAUSED': 'HT',
    'FINISHED': 'FT',
    'POSTPONED': 'PST',
    'SUSPENDED': 'SUSP',
    'CANCELLED': 'CANC',
  };
  return statusMap[status] || status;
}

// Formatar resposta de partidas para o padrão esperado pelo app
function formatMatchesResponse(data) {
  if (!data || !data.matches) {
    return { response: [], results: 0 };
  }
  
  return {
    response: data.matches.map(match => ({
      fixture: {
        id: match.id,
        date: match.utcDate,
        status: {
          short: mapStatus(match.status),
          elapsed: match.minute || null,
        },
        venue: {
          name: match.venue || null,
        }
      },
      league: {
        id: match.competition?.id,
        name: match.competition?.name,
        logo: match.competition?.emblem,
        round: `Rodada ${match.matchday}`,
      },
      teams: {
        home: {
          id: match.homeTeam?.id,
          name: match.homeTeam?.name,
          logo: match.homeTeam?.crest,
          winner: match.score?.winner === 'HOME_TEAM',
        },
        away: {
          id: match.awayTeam?.id,
          name: match.awayTeam?.name,
          logo: match.awayTeam?.crest,
          winner: match.score?.winner === 'AWAY_TEAM',
        }
      },
      goals: {
        home: match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? null,
        away: match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? null,
      },
      score: match.score,
    })),
    results: data.matches.length
  };
}

export async function getLiveMatches() {
  const data = await fetchAPI('/matches', { status: 'LIVE,IN_PLAY,PAUSED' });
  return formatMatchesResponse(data);
}

// Buscar próximas partidas de todas as competições
export async function getUpcomingMatches(limit = 10) {
  // Buscar partidas dos próximos 3 dias
  const today = new Date();
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = threeDaysLater.toISOString().split('T')[0];
  
  const data = await fetchAPI('/matches', { dateFrom, dateTo, status: 'SCHEDULED,TIMED' });
  if (data && data.matches) {
    // Ordenar por data mais próxima
    data.matches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    data.matches = data.matches.slice(0, limit);
  }
  return formatMatchesResponse(data);
}

export async function getFixturesByDate(date) {
  const data = await fetchAPI('/matches', { dateFrom: date, dateTo: date });
  return formatMatchesResponse(data);
}

export async function getFixtures(competitionCode) {
  const data = await fetchAPI(`/competitions/${competitionCode}/matches`);
  return formatMatchesResponse(data);
}

// Alias para compatibilidade
export async function getMatches(competitionCode, filters = {}) {
  const data = await fetchAPI(`/competitions/${competitionCode}/matches`, filters);
  return formatMatchesResponse(data);
}

export async function getNextFixtures(competitionCode, limit = 10) {
  const data = await fetchAPI(`/competitions/${competitionCode}/matches`, { status: 'SCHEDULED' });
  if (data && data.matches) {
    data.matches = data.matches.slice(0, limit);
  }
  return formatMatchesResponse(data);
}

// ==================== ARTILHEIROS ====================

export async function getTopScorers(competitionCode, limit = 20) {
  const data = await fetchAPI(`/competitions/${competitionCode}/scorers`, { limit });
  if (data && data.scorers) {
    // Buscar fotos dos jogadores em paralelo com validação
    const scorersWithPhotos = await Promise.all(
      data.scorers.slice(0, limit).map(async (scorer) => {
        // Passar dados para validação da foto
        const playerData = {
          teamName: scorer.team?.name,
          nationality: scorer.player?.nationality,
          position: scorer.player?.position,
        };
        const photo = await fetchPlayerPhoto(scorer.player?.name, playerData);
        return {
          player: {
            id: scorer.player?.id,
            name: scorer.player?.name,
            firstName: scorer.player?.firstName,
            lastName: scorer.player?.lastName,
            nationality: scorer.player?.nationality,
            dateOfBirth: scorer.player?.dateOfBirth,
            section: scorer.player?.section,
            position: scorer.player?.position,
            shirtNumber: scorer.player?.shirtNumber,
            photo: photo,
          },
          statistics: [{
            team: {
              id: scorer.team?.id,
              name: scorer.team?.name,
              logo: scorer.team?.crest,
            },
            goals: {
              total: scorer.goals,
            },
            assists: scorer.assists || 0,
            penalties: scorer.penalties || 0,
          }]
        };
      })
    );
    
    return {
      response: scorersWithPhotos,
      results: scorersWithPhotos.length
    };
  }
  return { response: [], results: 0 };
}

// ==================== TIMES ====================

// Buscar todos os times de todas as competições disponíveis
export async function getAllTeams() {
  const competitions = ['PL', 'BSA', 'BL1', 'SA', 'PD', 'FL1', 'CL'];
  const allTeams = [];
  const teamIds = new Set(); // Evitar duplicatas
  
  for (const code of competitions) {
    try {
      const data = await fetchAPI(`/competitions/${code}/teams`);
      if (data && data.teams) {
        data.teams.forEach(team => {
          if (!teamIds.has(team.id)) {
            teamIds.add(team.id);
            allTeams.push({
              team: {
                id: team.id,
                name: team.name,
                code: team.tla,
                country: team.area?.name,
                logo: team.crest,
                founded: team.founded,
              },
              venue: {
                name: team.venue,
              }
            });
          }
        });
      }
    } catch (err) {
      console.log(`Erro ao buscar times de ${code}:`, err);
    }
  }
  
  // Ordenar por nome
  allTeams.sort((a, b) => a.team.name.localeCompare(b.team.name));
  
  return { response: allTeams, results: allTeams.length };
}

export async function getTeamsByCompetition(competitionCode) {
  const data = await fetchAPI(`/competitions/${competitionCode}/teams`);
  if (data && data.teams) {
    return {
      response: data.teams.map(team => ({
        team: {
          id: team.id,
          name: team.name,
          code: team.tla,
          country: team.area?.name,
          logo: team.crest,
          founded: team.founded,
        },
        venue: {
          name: team.venue,
        }
      })),
      results: data.teams.length
    };
  }
  return { response: [], results: 0 };
}

export async function getTeam(teamId) {
  const data = await fetchAPI(`/teams/${teamId}`);
  if (data) {
    return {
      response: [{
        team: {
          id: data.id,
          name: data.name,
          code: data.tla,
          country: data.area?.name,
          logo: data.crest,
          founded: data.founded,
        },
        venue: {
          name: data.venue,
        }
      }],
      results: 1
    };
  }
  return { response: [], results: 0 };
}

export async function getTeamFixtures(teamId, limit = 10) {
  const data = await fetchAPI(`/teams/${teamId}/matches`, { status: 'SCHEDULED', limit });
  return formatMatchesResponse(data);
}

export async function getTeamLastFixtures(teamId, limit = 10) {
  const data = await fetchAPI(`/teams/${teamId}/matches`, { status: 'FINISHED', limit });
  return formatMatchesResponse(data);
}

export async function getSquad(teamId) {
  const data = await fetchAPI(`/teams/${teamId}`);
  if (data && data.squad) {
    const teamName = data.name; // Nome do time para validação
    
    // Buscar fotos dos jogadores em paralelo com validação
    const playersWithPhotos = await Promise.all(
      data.squad.slice(0, 30).map(async (player) => {
        // Passar dados para validação da foto
        const playerData = {
          teamName: teamName,
          nationality: player.nationality,
          position: player.position,
        };
        const photo = await fetchPlayerPhoto(player.name, playerData);
        return {
          id: player.id,
          name: player.name,
          photo: photo,
          nationality: player.nationality,
          dateOfBirth: player.dateOfBirth,
          position: player.position,
          number: player.shirtNumber,
        };
      })
    );
    
    return {
      response: [{
        players: playersWithPhotos
      }],
      results: playersWithPhotos.length
    };
  }
  return { response: [], results: 0 };
}

// ==================== UTILIDADES ====================

// Formatar data/hora para horário de Brasília
export function formatToBrasilia(dateString, options = {}) {
  const date = new Date(dateString);
  const defaultOptions = {
    timeZone: 'America/Sao_Paulo',
    ...options
  };
  return date.toLocaleString('pt-BR', defaultOptions);
}

// Formatar apenas hora no horário de Brasília
export function formatTimeBrasilia(dateString) {
  return formatToBrasilia(dateString, { hour: '2-digit', minute: '2-digit' });
}

// Formatar apenas data no horário de Brasília
export function formatDateBrasilia(dateString) {
  return formatToBrasilia(dateString, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Formatar data completa no horário de Brasília
export function formatFullDateBrasilia(dateString) {
  return formatToBrasilia(dateString, { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long',
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function isMatchLive(status) {
  return ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT', 'INT'].includes(status);
}

export function isMatchFinished(status) {
  return ['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(status);
}

export function isMatchScheduled(status) {
  return ['NS', 'TBD', 'PST', 'CANC', 'ABD', 'SUSP'].includes(status);
}

export function getMatchStatus(status) {
  const statusMap = {
    'NS': 'Não iniciado',
    'TBD': 'A definir',
    '1H': '1º Tempo',
    'HT': 'Intervalo',
    '2H': '2º Tempo',
    'ET': 'Prorrogação',
    'P': 'Pênaltis',
    'FT': 'Finalizado',
    'AET': 'Após prorrogação',
    'PEN': 'Após pênaltis',
    'BT': 'Intervalo prorrogação',
    'SUSP': 'Suspenso',
    'INT': 'Interrompido',
    'PST': 'Adiado',
    'CANC': 'Cancelado',
    'ABD': 'Abandonado',
    'AWD': 'W.O.',
    'WO': 'W.O.',
    'LIVE': 'Ao vivo',
  };
  return statusMap[status] || status;
}

// ==================== CÓDIGOS DE COMPETIÇÕES ====================
// Football-Data.org usa códigos de texto ao invés de IDs numéricos

export const COMPETITION_CODES = {
  // Brasil
  BRASILEIRAO_A: 'BSA',
  // Europa - Top 5 Ligas
  PREMIER_LEAGUE: 'PL',
  CHAMPIONSHIP: 'ELC',
  LA_LIGA: 'PD',
  SERIE_A: 'SA',
  BUNDESLIGA: 'BL1',
  LIGUE_1: 'FL1',
  // Competições Europeias
  CHAMPIONS_LEAGUE: 'CL',
  // Portugal
  PRIMEIRA_LIGA: 'PPL',
  // Holanda
  EREDIVISIE: 'DED',
  // Copa do Mundo
  WORLD_CUP: 'WC',
  EURO: 'EC',
};

// Estrutura organizada de campeonatos por categoria
// Usando códigos da Football-Data.org
export const CAMPEONATOS_ESTRUTURADOS = {
  continentais: {
    europa: {
      nome: 'Europa',
      competicoes: [
        {
          league: { id: 'CL', code: 'CL', name: 'UEFA Champions League', type: 'Cup', logo: 'https://crests.football-data.org/CL.png' },
          country: { name: 'Europe', code: null, flag: null },
        },
      ],
    },
  },
  nacionais: {
    brasil: {
      nome: 'Brasil',
      flag: 'https://crests.football-data.org/764.svg',
      divisoes: [
        {
          league: { 
            id: 'BSA', 
            code: 'BSA', 
            name: 'Brasileirão Série A', 
            type: 'League', 
            logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/85.png' 
          },
          country: { name: 'Brazil', code: 'BR', flag: 'https://crests.football-data.org/764.svg' },
        },
      ],
    },
    inglaterra: {
      nome: 'Inglaterra',
      flag: 'https://crests.football-data.org/770.svg',
      divisoes: [
        {
          league: { id: 'PL', code: 'PL', name: 'Premier League', type: 'League', logo: 'https://crests.football-data.org/PL.png' },
          country: { name: 'England', code: 'GB', flag: 'https://crests.football-data.org/770.svg' },
        },
        {
          league: { id: 'ELC', code: 'ELC', name: 'Championship', type: 'League', logo: 'https://crests.football-data.org/ELC.png' },
          country: { name: 'England', code: 'GB', flag: 'https://crests.football-data.org/770.svg' },
        },
      ],
    },
    espanha: {
      nome: 'Espanha',
      flag: 'https://crests.football-data.org/760.svg',
      divisoes: [
        {
          league: { id: 'PD', code: 'PD', name: 'La Liga', type: 'League', logo: 'https://crests.football-data.org/PD.png' },
          country: { name: 'Spain', code: 'ES', flag: 'https://crests.football-data.org/760.svg' },
        },
      ],
    },
    italia: {
      nome: 'Itália',
      flag: 'https://crests.football-data.org/784.svg',
      divisoes: [
        {
          league: { id: 'SA', code: 'SA', name: 'Serie A', type: 'League', logo: 'https://crests.football-data.org/SA.png' },
          country: { name: 'Italy', code: 'IT', flag: 'https://crests.football-data.org/784.svg' },
        },
      ],
    },
    alemanha: {
      nome: 'Alemanha',
      flag: 'https://crests.football-data.org/759.svg',
      divisoes: [
        {
          league: { id: 'BL1', code: 'BL1', name: 'Bundesliga', type: 'League', logo: 'https://crests.football-data.org/BL1.png' },
          country: { name: 'Germany', code: 'DE', flag: 'https://crests.football-data.org/759.svg' },
        },
      ],
    },
    franca: {
      nome: 'França',
      flag: 'https://crests.football-data.org/773.svg',
      divisoes: [
        {
          league: { id: 'FL1', code: 'FL1', name: 'Ligue 1', type: 'League', logo: 'https://crests.football-data.org/FL1.png' },
          country: { name: 'France', code: 'FR', flag: 'https://crests.football-data.org/773.svg' },
        },
      ],
    },
    portugal: {
      nome: 'Portugal',
      flag: 'https://crests.football-data.org/765.svg',
      divisoes: [
        {
          league: { id: 'PPL', code: 'PPL', name: 'Primeira Liga', type: 'League', logo: 'https://crests.football-data.org/PPL.png' },
          country: { name: 'Portugal', code: 'PT', flag: 'https://crests.football-data.org/765.svg' },
        },
      ],
    },
    holanda: {
      nome: 'Holanda',
      flag: 'https://crests.football-data.org/8601.svg',
      divisoes: [
        {
          league: { id: 'DED', code: 'DED', name: 'Eredivisie', type: 'League', logo: 'https://crests.football-data.org/DED.png' },
          country: { name: 'Netherlands', code: 'NL', flag: 'https://crests.football-data.org/8601.svg' },
        },
      ],
    },
  },
};

// Times Mock para exibição
export const TIMES_MOCK = [
  { team: { id: 64, name: 'Liverpool FC', code: 'LIV', country: 'England', logo: 'https://crests.football-data.org/64.png', founded: 1892 } },
  { team: { id: 65, name: 'Manchester City FC', code: 'MCI', country: 'England', logo: 'https://crests.football-data.org/65.png', founded: 1880 } },
  { team: { id: 57, name: 'Arsenal FC', code: 'ARS', country: 'England', logo: 'https://crests.football-data.org/57.png', founded: 1886 } },
  { team: { id: 61, name: 'Chelsea FC', code: 'CHE', country: 'England', logo: 'https://crests.football-data.org/61.png', founded: 1905 } },
  { team: { id: 66, name: 'Manchester United FC', code: 'MUN', country: 'England', logo: 'https://crests.football-data.org/66.png', founded: 1878 } },
  { team: { id: 1783, name: 'CR Flamengo', code: 'FLA', country: 'Brazil', logo: 'https://crests.football-data.org/1783.png', founded: 1895 } },
  { team: { id: 1765, name: 'SE Palmeiras', code: 'PAL', country: 'Brazil', logo: 'https://crests.football-data.org/1765.png', founded: 1914 } },
  { team: { id: 86, name: 'Real Madrid CF', code: 'RMA', country: 'Spain', logo: 'https://crests.football-data.org/86.png', founded: 1902 } },
  { team: { id: 81, name: 'FC Barcelona', code: 'BAR', country: 'Spain', logo: 'https://crests.football-data.org/81.png', founded: 1899 } },
  { team: { id: 5, name: 'FC Bayern München', code: 'FCB', country: 'Germany', logo: 'https://crests.football-data.org/5.png', founded: 1900 } },
];

// Atletas Mock (para tela de detalhes de atleta)
export const ATLETAS_MOCK = [
  { player: { id: 1, name: 'Erling Haaland', nationality: 'Norway', age: 24, photo: null, position: 'Attacker', number: 9 } },
  { player: { id: 2, name: 'Mohamed Salah', nationality: 'Egypt', age: 32, photo: null, position: 'Attacker', number: 11 } },
  { player: { id: 3, name: 'Kevin De Bruyne', nationality: 'Belgium', age: 33, photo: null, position: 'Midfielder', number: 17 } },
  { player: { id: 4, name: 'Virgil van Dijk', nationality: 'Netherlands', age: 33, photo: null, position: 'Defender', number: 4 } },
  { player: { id: 5, name: 'Gabriel Jesus', nationality: 'Brazil', age: 27, photo: null, position: 'Attacker', number: 9 } },
];

// Eventos Mock (para tela de detalhes de partida)
export const EVENTOS_MOCK = [
  { time: { elapsed: 23 }, team: { id: 1 }, player: { name: 'Raphael Veiga' }, assist: { name: 'Dudu' }, type: 'Goal', detail: 'Normal Goal' },
  { time: { elapsed: 45 }, team: { id: 2 }, player: { name: 'Gabriel Barbosa' }, assist: { name: 'Arrascaeta' }, type: 'Goal', detail: 'Normal Goal' },
  { time: { elapsed: 67 }, team: { id: 1 }, player: { name: 'Endrick' }, assist: { name: null }, type: 'Goal', detail: 'Normal Goal' },
  { time: { elapsed: 78 }, team: { id: 2 }, player: { name: 'Pedro' }, assist: { name: 'Everton Ribeiro' }, type: 'Goal', detail: 'Penalty' },
];

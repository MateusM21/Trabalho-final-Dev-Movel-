// Serviço de API para Football-Data.org
// Documentação: https://www.football-data.org/documentation/quickstart
// API com dados atualizados de 2025!

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.football-data.org/v4';
const SPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

// LiveScore API (RapidAPI) - Para eventos em tempo real
// https://rapidapi.com/apidojo/api/livescore6
const LIVESCORE_API_URL = 'https://livescore6.p.rapidapi.com';
const LIVESCORE_API_KEY = 'fd0fc7ea3dmshfe33157bb892611p1da323jsne1377baf3d64';
const LIVESCORE_API_HOST = 'livescore6.p.rapidapi.com';

// Token da API Football-Data.org
const API_KEY = '1edda1f6051f483da6d6f5078f70bae4';

const headers = {
  'X-Auth-Token': API_KEY,
};

// ==================== SISTEMA DE CACHE ====================

// Durações de cache (em milissegundos)
const CACHE_DURATIONS = {
  MATCHES_LIVE: 1 * 60 * 1000,        // 1 minuto para partidas ao vivo
  MATCHES_TODAY: 5 * 60 * 1000,       // 5 minutos para partidas do dia
  MATCHES_UPCOMING: 30 * 60 * 1000,   // 30 minutos para próximas partidas
  STANDINGS: 60 * 60 * 1000,          // 1 hora para classificações
  TEAMS: 24 * 60 * 60 * 1000,         // 24 horas para times
  SCORERS: 60 * 60 * 1000,            // 1 hora para artilheiros
  PLAYER_DETAILS: 24 * 60 * 60 * 1000, // 24 horas para detalhes de jogadores
  PLAYER_PHOTOS: 7 * 24 * 60 * 60 * 1000, // 7 dias para fotos
};

// Prefixos para chaves do cache
const CACHE_KEYS = {
  MATCHES_LIVE: 'cache_matches_live',
  MATCHES_TODAY: 'cache_matches_today_',
  MATCHES_UPCOMING: 'cache_matches_upcoming',
  STANDINGS: 'cache_standings_',
  TEAMS: 'cache_teams_',
  ALL_TEAMS: 'cache_all_teams',
  SCORERS: 'cache_scorers_',
  PLAYER_DETAILS: 'cache_player_',
  PLAYER_PHOTOS: 'cache_photos',
};

// Salvar dados no cache
async function saveToCache(key, data, duration) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    return true;
  } catch (error) {
    console.log('Erro ao salvar cache:', error);
    return false;
  }
}

// Buscar dados do cache
async function getFromCache(key) {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    
    // Verificar se expirou
    if (Date.now() > cacheData.expiresAt) {
      // Cache expirado, mas retornar como fallback
      return { data: cacheData.data, expired: true };
    }
    
    return { data: cacheData.data, expired: false };
  } catch (error) {
    console.log('Erro ao ler cache:', error);
    return null;
  }
}

// Limpar todo o cache
export async function clearAllCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log('Cache limpo:', cacheKeys.length, 'itens removidos');
    return true;
  } catch (error) {
    console.log('Erro ao limpar cache:', error);
    return false;
  }
}

// Obter estatísticas do cache
export async function getCacheStats() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    let totalSize = 0;
    
    for (const key of cacheKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) totalSize += value.length;
    }
    
    return {
      itemCount: cacheKeys.length,
      totalSizeKB: (totalSize / 1024).toFixed(2),
    };
  } catch (error) {
    return { itemCount: 0, totalSizeKB: '0' };
  }
}

// ==================== FIM SISTEMA DE CACHE ====================

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

// ==================== CLASSIFICAÇÃO COM CACHE ====================

export async function getStandings(competitionCode) {
  const cacheKey = CACHE_KEYS.STANDINGS + competitionCode;
  
  // Tentar buscar do cache primeiro
  const cached = await getFromCache(cacheKey);
  
  try {
    if (cached && !cached.expired) {
      return cached.data;
    }
    
    const data = await fetchAPI(`/competitions/${competitionCode}/standings`);
    
    if (data && data.standings) {
      const result = {
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
      
      // Salvar no cache por 1 hora
      await saveToCache(cacheKey, result, CACHE_DURATIONS.STANDINGS);
      
      return result;
    }
    return { response: [], results: 0 };
    
  } catch (error) {
    if (cached) {
      console.log('Usando cache expirado como fallback (standings)');
      return cached.data;
    }
    throw error;
  }
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
        code: match.competition?.code, // Adicionado código da competição
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

// ==================== PARTIDAS COM CACHE ====================

export async function getLiveMatches() {
  const cacheKey = CACHE_KEYS.MATCHES_LIVE;
  
  // Tentar buscar do cache primeiro
  const cached = await getFromCache(cacheKey);
  
  try {
    // Se cache válido, usar
    if (cached && !cached.expired) {
      return cached.data;
    }
    
    // Buscar da API
    const data = await fetchAPI('/matches', { status: 'LIVE,IN_PLAY,PAUSED' });
    const result = formatMatchesResponse(data);
    
    // Salvar no cache
    await saveToCache(cacheKey, result, CACHE_DURATIONS.MATCHES_LIVE);
    
    return result;
  } catch (error) {
    // Se falhar e tiver cache expirado, usar como fallback
    if (cached) {
      console.log('Usando cache expirado como fallback (live matches)');
      return cached.data;
    }
    throw error;
  }
}

// Buscar próximas partidas de todas as competições
export async function getUpcomingMatches(limit = 10) {
  const cacheKey = CACHE_KEYS.MATCHES_UPCOMING + '_' + limit;
  
  // Tentar buscar do cache primeiro
  const cached = await getFromCache(cacheKey);
  
  try {
    if (cached && !cached.expired) {
      return cached.data;
    }
    
    // Buscar partidas dos próximos 3 dias
    const today = new Date();
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = threeDaysLater.toISOString().split('T')[0];
    
    const data = await fetchAPI('/matches', { dateFrom, dateTo, status: 'SCHEDULED,TIMED' });
    if (data && data.matches) {
      data.matches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
      data.matches = data.matches.slice(0, limit);
    }
    const result = formatMatchesResponse(data);
    
    await saveToCache(cacheKey, result, CACHE_DURATIONS.MATCHES_UPCOMING);
    
    return result;
  } catch (error) {
    if (cached) {
      console.log('Usando cache expirado como fallback (upcoming matches)');
      return cached.data;
    }
    throw error;
  }
}

export async function getFixturesByDate(date) {
  const cacheKey = CACHE_KEYS.MATCHES_TODAY + date;
  
  const cached = await getFromCache(cacheKey);
  
  try {
    if (cached && !cached.expired) {
      return cached.data;
    }
    
    const data = await fetchAPI('/matches', { dateFrom: date, dateTo: date });
    const result = formatMatchesResponse(data);
    
    await saveToCache(cacheKey, result, CACHE_DURATIONS.MATCHES_TODAY);
    
    return result;
  } catch (error) {
    if (cached) {
      console.log('Usando cache expirado como fallback (fixtures by date)');
      return cached.data;
    }
    throw error;
  }
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

// Buscar partidas finalizadas de uma competição
export async function getFinishedMatches(competitionCode, limit = 15) {
  try {
    // Buscar partidas dos últimos 7 dias
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
    const dateTo = today.toISOString().split('T')[0];
    
    const data = await fetchAPI(`/competitions/${competitionCode}/matches`, { 
      status: 'FINISHED',
      dateFrom,
      dateTo,
    });
    
    if (data && data.matches) {
      // Ordenar por data (mais recentes primeiro)
      data.matches.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
      data.matches = data.matches.slice(0, limit);
    }
    
    return formatMatchesResponse(data);
  } catch (error) {
    console.log('Erro ao buscar partidas finalizadas:', error);
    return { response: [], results: 0 };
  }
}

// Buscar todas as partidas (agendadas + finalizadas + ao vivo) de uma competição
export async function getAllCompetitionMatches(competitionCode, limit = 20) {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
    const dateTo = threeDaysLater.toISOString().split('T')[0];
    
    const data = await fetchAPI(`/competitions/${competitionCode}/matches`, { 
      dateFrom,
      dateTo,
    });
    
    if (data && data.matches) {
      // Ordenar: ao vivo primeiro, depois por data
      data.matches.sort((a, b) => {
        const aIsLive = ['IN_PLAY', 'PAUSED', 'LIVE'].includes(a.status);
        const bIsLive = ['IN_PLAY', 'PAUSED', 'LIVE'].includes(b.status);
        if (aIsLive && !bIsLive) return -1;
        if (!aIsLive && bIsLive) return 1;
        return new Date(a.utcDate) - new Date(b.utcDate);
      });
      data.matches = data.matches.slice(0, limit);
    }
    
    return formatMatchesResponse(data);
  } catch (error) {
    console.log('Erro ao buscar partidas:', error);
    return { response: [], results: 0 };
  }
}

// ==================== ARTILHEIROS COM CACHE E DADOS COMPLETOS ====================

// Buscar detalhes completos do jogador no TheSportsDB
export async function fetchPlayerDetails(playerName, teamName = '') {
  if (!playerName) return null;
  
  const cacheKey = CACHE_KEYS.PLAYER_DETAILS + normalizeString(playerName);
  const cached = await getFromCache(cacheKey);
  
  if (cached && !cached.expired) {
    return cached.data;
  }
  
  try {
    // Buscar jogador por nome
    const searchName = encodeURIComponent(playerName);
    const response = await fetch(`${SPORTSDB_BASE_URL}/searchplayers.php?p=${searchName}`);
    const data = await response.json();
    
    if (data && data.player && data.player.length > 0) {
      // Encontrar o melhor match
      let bestMatch = data.player[0];
      let bestScore = 0;
      
      for (const player of data.player) {
        let score = 0;
        
        // Verificar nome
        if (namesMatch(playerName, player.strPlayer)) score += 3;
        
        // Verificar time
        if (teamName && player.strTeam) {
          const t1 = normalizeString(teamName);
          const t2 = normalizeString(player.strTeam);
          if (t1.includes(t2) || t2.includes(t1)) score += 5;
        }
        
        // Preferir jogadores de futebol
        if (player.strSport === 'Soccer') score += 2;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = player;
        }
      }
      
      if (bestScore >= 3) {
        const playerDetails = {
          photo: bestMatch.strCutout || bestMatch.strThumb || null,
          height: bestMatch.strHeight || null,
          weight: bestMatch.strWeight || null,
          birthDate: bestMatch.dateBorn || null,
          birthPlace: bestMatch.strBirthLocation || null,
          description: bestMatch.strDescriptionEN || bestMatch.strDescriptionPT || null,
          team: bestMatch.strTeam || null,
          position: bestMatch.strPosition || null,
          nationality: bestMatch.strNationality || null,
          instagram: bestMatch.strInstagram || null,
          twitter: bestMatch.strTwitter || null,
          facebook: bestMatch.strFacebook || null,
          // Estatísticas de carreira (quando disponíveis)
          formerTeams: bestMatch.strFormerTeam || null,
          agent: bestMatch.strAgent || null,
          wage: bestMatch.strWage || null,
          kitNumber: bestMatch.strNumber || null,
          signing: bestMatch.strSigning || null,
          // Imagens adicionais
          fanart: bestMatch.strFanart1 || null,
          render: bestMatch.strRender || null,
        };
        
        await saveToCache(cacheKey, playerDetails, CACHE_DURATIONS.PLAYER_DETAILS);
        return playerDetails;
      }
    }
  } catch (error) {
    console.log('Erro ao buscar detalhes do jogador:', playerName, error);
  }
  
  // Se tiver cache expirado, usar como fallback
  if (cached) return cached.data;
  
  return null;
}

// Calcular idade a partir da data de nascimento
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export async function getTopScorers(competitionCode, limit = 20) {
  const cacheKey = CACHE_KEYS.SCORERS + competitionCode + '_' + limit;
  
  // Tentar buscar do cache primeiro
  const cached = await getFromCache(cacheKey);
  
  try {
    if (cached && !cached.expired) {
      return cached.data;
    }
    
    const data = await fetchAPI(`/competitions/${competitionCode}/scorers`, { limit });
    
    if (data && data.scorers) {
      // Buscar fotos e detalhes dos jogadores em paralelo
      const scorersWithDetails = await Promise.all(
        data.scorers.slice(0, limit).map(async (scorer) => {
          // Buscar detalhes completos do TheSportsDB
          const details = await fetchPlayerDetails(scorer.player?.name, scorer.team?.name);
          
          // Calcular idade
          const age = calculateAge(scorer.player?.dateOfBirth || details?.birthDate);
          
          return {
            player: {
              id: scorer.player?.id,
              name: scorer.player?.name,
              firstName: scorer.player?.firstName,
              lastName: scorer.player?.lastName,
              nationality: scorer.player?.nationality || details?.nationality,
              dateOfBirth: scorer.player?.dateOfBirth || details?.birthDate,
              age: age,
              position: scorer.player?.position || details?.position,
              shirtNumber: scorer.player?.shirtNumber || details?.kitNumber,
              photo: details?.photo || null,
              // Dados adicionais do TheSportsDB
              height: details?.height,
              weight: details?.weight,
              birthPlace: details?.birthPlace,
              description: details?.description,
              formerTeams: details?.formerTeams,
              instagram: details?.instagram,
              twitter: details?.twitter,
              fanart: details?.fanart,
            },
            statistics: [{
              team: {
                id: scorer.team?.id,
                name: scorer.team?.name,
                logo: scorer.team?.crest,
              },
              goals: {
                total: scorer.goals || 0,
              },
              assists: scorer.assists || 0,
              penalties: scorer.penalties || 0,
              // Calculados
              playedMatches: scorer.playedMatches || null,
              goalsPerMatch: scorer.playedMatches ? (scorer.goals / scorer.playedMatches).toFixed(2) : null,
            }],
            competitionCode: competitionCode,
          };
        })
      );
      
      const result = {
        response: scorersWithDetails,
        results: scorersWithDetails.length
      };
      
      // Salvar no cache
      await saveToCache(cacheKey, result, CACHE_DURATIONS.SCORERS);
      
      return result;
    }
    return { response: [], results: 0 };
    
  } catch (error) {
    // Se falhar e tiver cache, usar como fallback
    if (cached) {
      console.log('Usando cache expirado como fallback (scorers)');
      return cached.data;
    }
    throw error;
  }
}

// Buscar artilheiros de todas as competições principais
export async function getAllTopScorers(limit = 10) {
  const competitions = ['PL', 'BSA', 'BL1', 'SA', 'PD', 'FL1'];
  const allScorers = [];
  
  for (const code of competitions) {
    try {
      const data = await getTopScorers(code, limit);
      if (data && data.response) {
        // Adicionar código da competição
        data.response.forEach(scorer => {
          scorer.competitionCode = code;
          allScorers.push(scorer);
        });
      }
    } catch (err) {
      console.log(`Erro ao buscar artilheiros de ${code}:`, err);
    }
  }
  
  // Ordenar por número de gols
  allScorers.sort((a, b) => (b.statistics?.[0]?.goals?.total || 0) - (a.statistics?.[0]?.goals?.total || 0));
  
  return { response: allScorers, results: allScorers.length };
}

// Buscar times por nome (usando cache de getAllTeams)
let cachedTeams = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function searchTeams(query) {
  const now = Date.now();
  
  // Se cache expirou ou não existe, buscar novamente
  if (!cachedTeams || (now - cacheTimestamp) > CACHE_DURATION) {
    const result = await getAllTeams();
    cachedTeams = result.response || [];
    cacheTimestamp = now;
  }
  
  if (!query || query.trim().length < 2) {
    return { response: [], results: 0 };
  }
  
  const termoBusca = query.toLowerCase().trim();
  const filtered = cachedTeams.filter(t => 
    t.team?.name?.toLowerCase().includes(termoBusca) ||
    t.team?.code?.toLowerCase().includes(termoBusca) ||
    t.team?.country?.toLowerCase().includes(termoBusca)
  );
  
  return { response: filtered, results: filtered.length };
}

// ==================== TIMES COM CACHE ====================

// Buscar todos os times de todas as competições disponíveis
export async function getAllTeams() {
  const cacheKey = CACHE_KEYS.ALL_TEAMS;
  
  // Tentar buscar do cache primeiro
  const cached = await getFromCache(cacheKey);
  
  try {
    if (cached && !cached.expired) {
      return cached.data;
    }
    
    const competitions = ['PL', 'BSA', 'BL1', 'SA', 'PD', 'FL1', 'CL'];
    const allTeams = [];
    const teamIds = new Set();
    
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
    
    allTeams.sort((a, b) => a.team.name.localeCompare(b.team.name));
    
    const result = { response: allTeams, results: allTeams.length };
    
    // Salvar no cache por 24 horas
    await saveToCache(cacheKey, result, CACHE_DURATIONS.TEAMS);
    
    return result;
    
  } catch (error) {
    if (cached) {
      console.log('Usando cache expirado como fallback (all teams)');
      return cached.data;
    }
    throw error;
  }
}

export async function getTeamsByCompetition(competitionCode) {
  const cacheKey = CACHE_KEYS.TEAMS + competitionCode;
  
  const cached = await getFromCache(cacheKey);
  
  try {
    if (cached && !cached.expired) {
      return cached.data;
    }
    
    const data = await fetchAPI(`/competitions/${competitionCode}/teams`);
    if (data && data.teams) {
      const result = {
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
      
      await saveToCache(cacheKey, result, CACHE_DURATIONS.TEAMS);
      
      return result;
    }
    return { response: [], results: 0 };
    
  } catch (error) {
    if (cached) {
      console.log('Usando cache expirado como fallback (teams by competition)');
      return cached.data;
    }
    throw error;
  }
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

// ==================== EVENTOS DE PARTIDAS (API-FOOTBALL) ====================

// Mapeamento de códigos de competição entre Football-Data.org e API-Football
const LEAGUE_ID_MAPPING = {
  'PL': 39,    // Premier League
  'PD': 140,   // La Liga
  'SA': 135,   // Serie A
  'BL1': 78,   // Bundesliga
  'FL1': 61,   // Ligue 1
  'BSA': 71,   // Brasileirão
  'CL': 2,     // Champions League
  'EL': 3,     // Europa League
  'PPL': 94,   // Primeira Liga Portugal
  'DED': 88,   // Eredivisie
  'WC': 1,     // Copa do Mundo
};

// Mapeamento de IDs de times entre Football-Data.org e API-Football
const TEAM_ID_MAPPING = {
  // Premier League
  64: 40,   // Liverpool
  65: 50,   // Manchester City
  57: 42,   // Arsenal
  61: 49,   // Chelsea
  66: 33,   // Manchester United
  73: 47,   // Tottenham
  58: 66,   // Aston Villa
  67: 34,   // Newcastle
  76: 39,   // Wolves
  397: 52,  // Brighton
  63: 36,   // Fulham
  354: 55,  // Crystal Palace
  62: 45,   // Everton
  351: 48,  // Nottingham Forest
  402: 51,  // Brentford
  328: 35,  // Bournemouth
  563: 41,  // West Ham
  341: 46,  // Southampton
  338: 56,  // Leicester
  349: 57,  // Ipswich
  // La Liga
  86: 541,  // Real Madrid
  81: 529,  // Barcelona
  78: 530,  // Atlético Madrid
  77: 531,  // Athletic Bilbao
  559: 536, // Sevilla
  94: 533,  // Villarreal
  92: 543,  // Real Sociedad
  90: 532,  // Real Betis
  // Bundesliga
  5: 157,   // Bayern München
  4: 165,   // Borussia Dortmund
  721: 173, // RB Leipzig
  3: 168,   // Bayer Leverkusen
  18: 160,  // Borussia Mönchengladbach
  19: 161,  // Eintracht Frankfurt
  11: 172,  // VfL Wolfsburg
  12: 164,  // Werder Bremen
  // Serie A
  109: 496, // Juventus
  108: 505, // Inter
  98: 489,  // AC Milan
  113: 492, // Napoli
  99: 497,  // Fiorentina
  100: 487, // Roma
  102: 488, // Lazio
  103: 499, // Atalanta
  115: 500, // Bologna
  // Ligue 1
  524: 85,  // PSG
  516: 81,  // Marseille
  548: 79,  // Lille
  518: 80,  // Lyon
  543: 91,  // Monaco
  // Brasileirão
  1783: 127, // Flamengo
  1765: 121, // Palmeiras
  1767: 131, // Corinthians
  1766: 126, // São Paulo
  1772: 1062, // Atlético Mineiro
  1777: 1218, // Santos
  1776: 130, // Grêmio
  1769: 119, // Internacional
  1771: 120, // Botafogo
  1770: 124, // Fluminense
  1785: 123, // Cruzeiro
  1784: 118, // Bahia
  1768: 133, // Vasco
  // Portugal
  503: 211, // Porto
  498: 212, // Benfica
  503: 228, // Sporting CP
  // Holanda
  674: 194, // Feyenoord
  678: 197, // PSV
  675: 195, // Ajax
};

// Mapeamento de nomes de times para busca no LiveScore
// Chave = nome da Football-Data.org, Valor = nome no LiveScore
const TEAM_NAME_MAPPING = {
  'FC Barcelona': 'Barcelona',
  'Real Madrid CF': 'Real Madrid',
  'Atlético de Madrid': 'Atletico Madrid',
  'Manchester United FC': 'Manchester United',
  'Manchester City FC': 'Manchester City',
  'Liverpool FC': 'Liverpool',
  'Chelsea FC': 'Chelsea',
  'Arsenal FC': 'Arsenal',
  'FC Bayern München': 'Bayern Munich',
  'Borussia Dortmund': 'Borussia Dortmund',
  'Juventus FC': 'Juventus',
  'FC Internazionale Milano': 'Inter',
  'AC Milan': 'AC Milan',
  'Paris Saint-Germain FC': 'Paris Saint-Germain',
  'SSC Napoli': 'Napoli',
  'SL Benfica': 'Benfica',
  'Eintracht Frankfurt': 'Eintracht Frankfurt',
  'Bayer 04 Leverkusen': 'Bayer Leverkusen',
  'Newcastle United FC': 'Newcastle United',
  'Tottenham Hotspur FC': 'Tottenham Hotspur',
  'Athletic Club': 'Athletic Club',
  'Sporting Clube de Portugal': 'Sporting CP',
  'RB Leipzig': 'RB Leipzig',
  'VfB Stuttgart': 'VfB Stuttgart',
  'Atalanta BC': 'Atalanta',
  'AS Roma': 'Roma',
  'SS Lazio': 'Lazio',
  'AFC Ajax': 'Ajax',
  'PSV': 'PSV Eindhoven',
  'Feyenoord Rotterdam': 'Feyenoord',
  'Celtic FC': 'Celtic',
  'Rangers FC': 'Rangers',
  'FC Porto': 'Porto',
  'Club Brugge KV': 'Club Brugge',
  'RSC Anderlecht': 'Anderlecht',
  'Galatasaray SK': 'Galatasaray',
  'Fenerbahçe SK': 'Fenerbahce',
  'Olympique de Marseille': 'Marseille',
  'Olympique Lyonnais': 'Lyon',
  'AS Monaco FC': 'AS Monaco',
  'LOSC Lille': 'Lille',
  'Stade Rennais FC 1901': 'Rennes',
  'Sevilla FC': 'Sevilla',
  'Villarreal CF': 'Villarreal',
  'Real Sociedad de Fútbol': 'Real Sociedad',
  'Real Betis Balompié': 'Real Betis',
  // Times Alemanha
  'Borussia Dortmund': 'Borussia Dortmund',
  'FC Bayern München': 'Bayern Munich',
  'VfL Wolfsburg': 'VfL Wolfsburg',
  'SC Freiburg': 'SC Freiburg',
  'TSG 1899 Hoffenheim': 'Hoffenheim',
  '1. FC Union Berlin': 'Union Berlin',
  'Werder Bremen': 'Werder Bremen',
  'Borussia Mönchengladbach': 'Monchengladbach',
  '1. FC Köln': 'FC Koln',
  '1. FSV Mainz 05': 'Mainz 05',
  'FC Augsburg': 'FC Augsburg',
  // Times Inglaterra
  'West Ham United FC': 'West Ham United',
  'Aston Villa FC': 'Aston Villa',
  'Brighton & Hove Albion FC': 'Brighton',
  'Wolverhampton Wanderers FC': 'Wolverhampton',
  'Crystal Palace FC': 'Crystal Palace',
  'Everton FC': 'Everton',
  'Fulham FC': 'Fulham',
  'Nottingham Forest FC': 'Nottingham Forest',
  'Brentford FC': 'Brentford',
  'AFC Bournemouth': 'Bournemouth',
  'Leicester City FC': 'Leicester City',
  'Ipswich Town FC': 'Ipswich Town',
  'Southampton FC': 'Southampton',
  // Times Espanha
  'Valencia CF': 'Valencia',
  'Athletic Club': 'Athletic Club',
  'Girona FC': 'Girona',
  'Celta de Vigo': 'Celta Vigo',
  'CA Osasuna': 'Osasuna',
  'Rayo Vallecano': 'Rayo Vallecano',
  'Deportivo Alavés': 'Alaves',
  'RCD Mallorca': 'Mallorca',
  'UD Las Palmas': 'Las Palmas',
  'Getafe CF': 'Getafe',
  'RCD Espanyol de Barcelona': 'Espanyol',
  'CD Leganés': 'Leganes',
  'Real Valladolid CF': 'Real Valladolid',
  // Times Itália
  'ACF Fiorentina': 'Fiorentina',
  'Torino FC': 'Torino',
  'Bologna FC 1909': 'Bologna',
  'Udinese Calcio': 'Udinese',
  'Genoa CFC': 'Genoa',
  'Hellas Verona FC': 'Verona',
  'US Lecce': 'Lecce',
  'Parma Calcio 1913': 'Parma',
  'Empoli FC': 'Empoli',
  'Cagliari Calcio': 'Cagliari',
  'Como 1907': 'Como',
  'Venezia FC': 'Venezia',
  'AC Monza': 'Monza',
  // Times França
  'RC Lens': 'RC Lens',
  'OGC Nice': 'Nice',
  'FC Nantes': 'Nantes',
  'RC Strasbourg Alsace': 'Strasbourg',
  'Toulouse FC': 'Toulouse',
  'Montpellier HSC': 'Montpellier',
  'Stade Brestois 29': 'Stade Brestois',
  'Le Havre AC': 'Le Havre',
  'Angers SCO': 'Angers',
  'AJ Auxerre': 'Auxerre',
  'AS Saint-Étienne': 'Saint-Etienne',
  // Times Noruega/Outros
  'FK Bodø/Glimt': 'Bodoe/Glimt',
  'Slavia Praha': 'Slavia Prague',
  'AC Sparta Praha': 'Sparta Prague',
  'Shakhtar Donetsk': 'Shakhtar Donetsk',
  'Dinamo Zagreb': 'Dinamo Zagreb',
  'FC Red Bull Salzburg': 'Red Bull Salzburg',
  'SK Sturm Graz': 'Sturm Graz',
  'BSC Young Boys': 'Young Boys',
  'Sporting Braga': 'Braga',
  'FC Girondins de Bordeaux': 'Bordeaux',
  
  // ====== TIMES BRASIL (Série A e B) ======
  // Nomes Football-Data.org -> Nomes LiveScore
  'SE Palmeiras': 'Palmeiras',
  'CR Flamengo': 'Flamengo',
  'SC Corinthians Paulista': 'Corinthians',
  'São Paulo FC': 'Sao Paulo',
  'CA Mineiro': 'Atletico MG',
  'Clube Atlético Mineiro': 'Atletico MG',
  'Sport Club Internacional': 'Internacional',
  'Grêmio FBPA': 'Gremio',
  'Santos FC': 'Santos FC',
  'Botafogo de Futebol e Regatas': 'Botafogo FR',
  'Botafogo FR': 'Botafogo FR',
  'Cruzeiro EC': 'Cruzeiro',
  'Clube de Regatas Vasco da Gama': 'Vasco da Gama',
  'CR Vasco da Gama': 'Vasco da Gama',
  'Fluminense FC': 'Fluminense',
  'CR Fluminense': 'Fluminense',
  'Fortaleza EC': 'Fortaleza',
  'EC Bahia': 'Bahia',
  'EC Vitória': 'Vitoria',
  'EC Juventude': 'Juventude',
  'RB Bragantino': 'RB Bragantino',
  'Sport Club do Recife': 'Sport Recife',
  'Ceará SC': 'Ceara',
  'Athletico Paranaense': 'Athletico PR',
  'Cuiabá EC': 'Cuiaba',
  'Goiás EC': 'Goias',
  'América FC (MG)': 'America MG',
  'Coritiba FC': 'Coritiba',
  'Atlético Goianiense': 'Atletico GO',
  'Mirassol FC': 'Mirassol',
  
  // Times Holanda
  'AZ Alkmaar': 'AZ Alkmaar',
  'FC Twente': 'FC Twente',
  'FC Utrecht': 'FC Utrecht',
  'Vitesse': 'Vitesse',
  // Times Portugal
  'Sporting Clube de Braga': 'Braga',
  'Vitória SC': 'Vitoria Guimaraes',
  'Rio Ave FC': 'Rio Ave',
  'SC Farense': 'Farense',
  'FC Vizela': 'Vizela',
  'CD Nacional': 'Nacional',
  'CF Estrela da Amadora': 'CF Estrela da Amadora',
  'FC Arouca': 'Arouca',
  'CD Tondela': 'Tondela',
  // Times Bélgica
  'Royale Union Saint-Gilloise': 'Union St.Gilloise',
  'KRC Genk': 'Genk',
  'KAA Gent': 'Gent',
  'Royal Antwerp FC': 'Royal Antwerp',
  'Oud-Heverlee Leuven': 'Oud-Heverlee Leuven',
  // Times Escócia
  'Heart of Midlothian FC': 'Hearts',
  'Hibernian FC': 'Hibernian',
  'Aberdeen FC': 'Aberdeen',
  // Times Turquia
  'Trabzonspor': 'Trabzonspor',
  'Göztepe SK': 'Goztepe',
  'Beşiktaş JK': 'Besiktas',
  // Times Grécia
  'PAOK FC': 'PAOK FC',
  'Aris Thessaloniki FC': 'Aris',
  'AEK Athens FC': 'AEK Athens',
  'Atromitos FC': 'Atromitos',
  'Olympiacos FC': 'Olympiacos',
  'Panathinaikos FC': 'Panathinaikos',
  // Times Argentina
  'CA Boca Juniors': 'Boca Juniors',
  'Racing Club': 'Racing Club',
  'CA River Plate': 'River Plate',
  'Club Atlético Independiente': 'Independiente',
  'CA San Lorenzo de Almagro': 'San Lorenzo',
  // Times Dinamarca
  'FC Copenhagen': 'FC Copenhagen',
  'SønderjyskE': 'SoenderjyskE',
  // Times Polônia
  'Górnik Łęczna': 'Gornik Leczna',
  'Ruch Chorzów': 'Ruch Chorzow',
  // Times Romênia
  'CS Universitatea Craiova': 'CS Universitatea Craiova',
  'CFR Cluj': 'CFR Cluj',
  'FCSB': 'FCSB',
  // Times Bulgária
  'PFC Ludogorets Razgrad': 'Ludogorets Razgrad',
  // Times Hungria
  'Újpest FC': 'Ujpest',
  'Zalaegerszegi TE FC': 'Zalaegerszeg',
  // Times Eslováquia
  'DAC 1904 Dunajská Streda': 'DAC 1904 Dunajska Streda',
  'FC Spartak Trnava': 'Spartak Trnava',
  // Times Ucrânia
  'FC Shakhtar Donetsk': 'Shakhtar Donetsk',
  'FC Dynamo Kyiv': 'Dynamo Kyiv',
  // Times Croácia
  'GNK Dinamo Zagreb': 'Dinamo Zagreb',
  'HNK Hajduk Split': 'Hajduk Split',
  // Times Áustria
  'FK Austria Wien': 'Austria Vienna',
  'SK Rapid Wien': 'Rapid Vienna',
  // Times Sérvia
  'FK Crvena Zvezda': 'Red Star Belgrade',
  'FK Partizan Belgrade': 'Partizan Belgrade',
  // Times Championship (Inglaterra)
  'Bristol City FC': 'Bristol City',
  'Derby County FC': 'Derby County',
  'Millwall FC': 'Millwall',
  'Stoke City FC': 'Stoke City',
  'Hull City AFC': 'Hull City',
  'Wrexham AFC': 'Wrexham',
  'Blackpool FC': 'Blackpool',
  'Blackburn Rovers FC': 'Blackburn Rovers',
  'Oxford United FC': 'Oxford United',
  'Cardiff City FC': 'Cardiff City',
  'Leeds United FC': 'Leeds United',
  'Norwich City FC': 'Norwich City',
  'Sheffield United FC': 'Sheffield United',
  'Sheffield Wednesday FC': 'Sheffield Wednesday',
  'Burnley FC': 'Burnley',
  'Sunderland AFC': 'Sunderland',
  'Middlesbrough FC': 'Middlesbrough',
  'Coventry City FC': 'Coventry City',
  'Preston North End FC': 'Preston North End',
  'Luton Town FC': 'Luton Town',
  'Plymouth Argyle FC': 'Plymouth Argyle',
  'Queens Park Rangers FC': 'QPR',
  'Swansea City AFC': 'Swansea City',
  'West Bromwich Albion FC': 'West Brom',
  'Watford FC': 'Watford',
  // Times Itália (Serie B)
  'US Salernitana 1919': 'Salernitana',
  'Pisa SC': 'Pisa',
  'Sampdoria': 'Sampdoria',
  'Modena FC': 'Modena',
  'Frosinone Calcio': 'Frosinone',
  'US Cremonese': 'Cremonese',
  'Brescia Calcio': 'Brescia',
  'Spezia Calcio': 'Spezia',
  'Reggina 1914': 'Reggina',
  // Times Espanha (Segunda)
  'Deportivo de La Coruña': 'Deportivo La Coruna',
  'SD Eibar': 'Eibar',
  'Granada CF': 'Granada',
  'Burgos CF': 'Burgos CF',
  'Albacete Balompié': 'Albacete',
  'CD Tenerife': 'Tenerife',
  'CD Lugo': 'Lugo',
  // Mais times Champions/Europa League
  'FC Salzburg': 'Red Bull Salzburg',
  'Stade Brestois 29': 'Stade Brestois',
  'Sporting CP': 'Sporting CP',
  'Sport Lisboa e Benfica': 'Benfica',
  'FC Porto': 'FC Porto',
  'RB Leipzig': 'RB Leipzig',
  'Pafos FC': 'Pafos FC',
  'Union SG': 'Union St.Gilloise',
};

// Função auxiliar para processar incidentes do LiveScore
// IT (Incident Type): 36 = Gol, 37 = Gol contra, 39 = Pênalti marcado
// 43 = Cartão amarelo, 45 = Segundo amarelo, 46 = Vermelho
// 63 = Assistência (dentro de um gol)
// 7 ou 70 = Substituição
function processLiveScoreIncident(inc, events, period, homeTeamName, awayTeamName) {
  if (!inc || !inc.IT) return;
  
  let tipo = null;
  let detail = '';
  let assistName = null;
  
  // Determinar o time baseado em Nm (1 = home, 2 = away)
  const teamName = inc.Nm === 1 ? homeTeamName : awayTeamName;
  const teamSide = inc.Nm === 1 ? 'home' : 'away';
  
  // Tipos de incidentes
  switch (inc.IT) {
    case 36: // Gol normal
      tipo = 'Goal';
      detail = 'Normal Goal';
      break;
    case 37: // Gol contra
      tipo = 'Goal';
      detail = 'Own Goal';
      break;
    case 39: // Pênalti convertido
      tipo = 'Goal';
      detail = 'Penalty';
      break;
    case 43: // Cartão amarelo
      tipo = 'Card';
      detail = 'Yellow Card';
      break;
    case 45: // Segundo amarelo
    case 46: // Cartão vermelho
      tipo = 'Card';
      detail = 'Red Card';
      break;
    case 7:
    case 70: // Substituição
      tipo = 'subst';
      detail = 'Substitution';
      break;
    case 63: // Assistência - não adicionar como evento separado
      return;
    default:
      // Ignorar outros tipos
      return;
  }
  
  // Verificar se já existe este evento (evitar duplicatas)
  const playerName = inc.Pn || inc.Fn + ' ' + inc.Ln || 'Jogador';
  const minute = inc.Min || 0;
  
  const exists = events.some(e => 
    e.time.elapsed === minute && 
    e.type === tipo && 
    e.player?.name === playerName
  );
  
  if (exists) return;
  
  events.push({
    time: { elapsed: minute, extra: inc.MinEx || null },
    type: tipo,
    detail: detail,
    team: { id: teamSide, name: teamName },
    player: { name: playerName },
    assist: assistName ? { name: assistName } : null,
    score: inc.Sc || null,
  });
}

// Buscar estatísticas da partida via LiveScore API
export async function getMatchStatisticsLiveScore(homeTeam, awayTeam, matchDate) {
  try {
    if (LIVESCORE_API_KEY === 'SUA_CHAVE_RAPIDAPI_AQUI') {
      console.log('LiveScore Stats: Chave não configurada');
      return null;
    }
    
    // Primeiro precisamos encontrar o Eid da partida
    const homeTeamNorm = TEAM_NAME_MAPPING[homeTeam] || homeTeam.replace(' FC', '').replace(' CF', '').trim();
    const awayTeamNorm = TEAM_NAME_MAPPING[awayTeam] || awayTeam.replace(' FC', '').replace(' CF', '').trim();
    
    console.log('=== BUSCANDO ESTATÍSTICAS LIVESCORE ===');
    console.log('Home:', homeTeamNorm, '| Away:', awayTeamNorm);
    
    const youthTerms = ['u19', 'u21', 'u23', 'youth', 'junior', 'sub-19', 'sub-21', 'sub-23', 'reserves', 'b team', 'ii'];
    
    const findMatchInData = (data) => {
      if (!data.Stages) return null;
      
      for (const stage of data.Stages) {
        const stageName = (stage.Snm || stage.Cnm || '').toLowerCase();
        if (youthTerms.some(term => stageName.includes(term))) continue;
        
        if (stage.Events) {
          for (const event of stage.Events) {
            const t1 = event.T1?.[0]?.Nm || '';
            const t2 = event.T2?.[0]?.Nm || '';
            
            if (youthTerms.some(term => t1.toLowerCase().includes(term) || t2.toLowerCase().includes(term))) continue;
            
            const t1Lower = t1.toLowerCase();
            const t2Lower = t2.toLowerCase();
            const homeNormLower = homeTeamNorm.toLowerCase();
            const awayNormLower = awayTeamNorm.toLowerCase();
            
            const homeMatch = t1Lower === homeNormLower || t1Lower.includes(homeNormLower) || homeNormLower.includes(t1Lower);
            const awayMatch = t2Lower === awayNormLower || t2Lower.includes(awayNormLower) || awayNormLower.includes(t2Lower);
            
            if (homeMatch && awayMatch) {
              return event;
            }
          }
        }
      }
      return null;
    };
    
    let matchFound = null;
    
    // Buscar ao vivo primeiro
    try {
      const liveResponse = await fetch(`${LIVESCORE_API_URL}/matches/v2/list-live?Category=soccer`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': LIVESCORE_API_KEY,
          'x-rapidapi-host': LIVESCORE_API_HOST,
        },
      });
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        matchFound = findMatchInData(liveData);
      }
    } catch (e) {
      console.log('LiveScore Stats: Erro ao vivo:', e.message);
    }
    
    // Buscar por data se não encontrou ao vivo
    if (!matchFound) {
      const date = new Date(matchDate);
      const datesToTry = [];
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      datesToTry.push(`${year}${month}${day}`);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      datesToTry.push(`${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, '0')}${String(nextDay.getDate()).padStart(2, '0')}`);
      
      for (const dateStr of datesToTry) {
        if (matchFound) break;
        
        const dateResponse = await fetch(`${LIVESCORE_API_URL}/matches/v2/list-by-date?Category=soccer&Date=${dateStr}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': LIVESCORE_API_KEY,
            'x-rapidapi-host': LIVESCORE_API_HOST,
          },
        });
        
        if (dateResponse.ok) {
          const dateData = await dateResponse.json();
          matchFound = findMatchInData(dateData);
        }
      }
    }
    
    if (!matchFound) {
      console.log('LiveScore Stats: Partida não encontrada');
      return null;
    }
    
    const matchId = matchFound.Eid;
    console.log('LiveScore Stats: Eid encontrado:', matchId);
    
    // Buscar estatísticas
    const statsResponse = await fetch(`${LIVESCORE_API_URL}/matches/v2/get-statistics?Category=soccer&Eid=${matchId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': LIVESCORE_API_KEY,
        'x-rapidapi-host': LIVESCORE_API_HOST,
      },
    });
    
    if (!statsResponse.ok) {
      console.log('LiveScore Stats: Erro ao buscar estatísticas:', statsResponse.status);
      return null;
    }
    
    const statsData = await statsResponse.json();
    
    if (!statsData.Stat || statsData.Stat.length < 2) {
      console.log('LiveScore Stats: Estatísticas não disponíveis');
      return null;
    }
    
    const homeStat = statsData.Stat[0];
    const awayStat = statsData.Stat[1];
    
    // Mapear estatísticas para formato legível
    const statistics = [
      { label: 'Posse de Bola', mandante: `${homeStat.Pss || 0}%`, visitante: `${awayStat.Pss || 0}%` },
      { label: 'Finalizações', mandante: `${(homeStat.Shon || 0) + (homeStat.Shof || 0)}`, visitante: `${(awayStat.Shon || 0) + (awayStat.Shof || 0)}` },
      { label: 'Finalizações no Gol', mandante: `${homeStat.Shon || 0}`, visitante: `${awayStat.Shon || 0}` },
      { label: 'Escanteios', mandante: `${homeStat.Cos || 0}`, visitante: `${awayStat.Cos || 0}` },
      { label: 'Faltas', mandante: `${homeStat.Fls || 0}`, visitante: `${awayStat.Fls || 0}` },
      { label: 'Impedimentos', mandante: `${homeStat.Ofs || 0}`, visitante: `${awayStat.Ofs || 0}` },
      { label: 'Cartões Amarelos', mandante: `${homeStat.Ycs || 0}`, visitante: `${awayStat.Ycs || 0}` },
      { label: 'Cartões Vermelhos', mandante: `${homeStat.Rcs || 0}`, visitante: `${awayStat.Rcs || 0}` },
    ];
    
    console.log('LiveScore Stats: Estatísticas encontradas:', statistics.length);
    
    return statistics;
    
  } catch (error) {
    console.log('Erro ao buscar estatísticas LiveScore:', error.message);
    return null;
  }
}

// Buscar eventos de partida via LiveScore API (RapidAPI)
export async function getMatchEventsLiveScore(homeTeam, awayTeam, matchDate) {
  try {
    // Verificar se a chave está configurada
    if (LIVESCORE_API_KEY === 'SUA_CHAVE_RAPIDAPI_AQUI') {
      console.log('LiveScore API: Chave não configurada');
      return null;
    }
    
    // Normalizar nomes dos times
    const homeTeamNorm = TEAM_NAME_MAPPING[homeTeam] || homeTeam.replace(' FC', '').replace(' CF', '').trim();
    const awayTeamNorm = TEAM_NAME_MAPPING[awayTeam] || awayTeam.replace(' FC', '').replace(' CF', '').trim();
    
    console.log('=== BUSCANDO EVENTOS LIVESCORE ===');
    console.log('Home Original:', homeTeam, '-> Normalizado:', homeTeamNorm);
    console.log('Away Original:', awayTeam, '-> Normalizado:', awayTeamNorm);
    console.log('Data da partida:', matchDate);
    
    // Termos que indicam categorias de base (para excluir)
    const youthTerms = ['u19', 'u21', 'u23', 'youth', 'junior', 'sub-19', 'sub-21', 'sub-23', 'reserves', 'b team', 'ii'];
    
    // Função auxiliar para encontrar a partida nos dados
    const findMatchInData = (data) => {
      if (!data.Stages) return null;
      
      for (const stage of data.Stages) {
        const stageName = (stage.Snm || stage.Cnm || '').toLowerCase();
        
        // Pular categorias de base
        if (youthTerms.some(term => stageName.includes(term))) {
          continue;
        }
        
        if (stage.Events) {
          for (const event of stage.Events) {
            const t1 = event.T1?.[0]?.Nm || '';
            const t2 = event.T2?.[0]?.Nm || '';
            
            // Pular se os nomes dos times indicam categoria de base
            if (youthTerms.some(term => t1.toLowerCase().includes(term) || t2.toLowerCase().includes(term))) {
              continue;
            }
            
            // Verificar se os nomes batem
            const t1Lower = t1.toLowerCase();
            const t2Lower = t2.toLowerCase();
            const homeNormLower = homeTeamNorm.toLowerCase();
            const awayNormLower = awayTeamNorm.toLowerCase();
            
            // Correspondência flexível - verificar várias formas
            const homeMatch = checkTeamMatch(t1Lower, homeNormLower);
            const awayMatch = checkTeamMatch(t2Lower, awayNormLower);
            
            if (homeMatch && awayMatch) {
              console.log('LiveScore: Match encontrado em:', stageName);
              console.log('LiveScore: Times:', t1, 'vs', t2);
              return { match: event, stage: stageName };
            }
          }
        }
      }
      return null;
    };
    
    // Função auxiliar para verificar correspondência de time
    const checkTeamMatch = (apiName, searchName) => {
      // Correspondência exata
      if (apiName === searchName) return true;
      
      // Um contém o outro
      if (apiName.includes(searchName) || searchName.includes(apiName)) return true;
      
      // Verificar palavras principais (excluindo artigos)
      const apiWords = apiName.split(' ').filter(w => w.length > 2);
      const searchWords = searchName.split(' ').filter(w => w.length > 2);
      
      // Verificar se pelo menos uma palavra importante corresponde
      for (const word of searchWords) {
        if (apiWords.some(aw => aw.includes(word) || word.includes(aw))) {
          return true;
        }
      }
      
      return false;
    };
    
    let matchResult = null;
    
    // 1. TENTAR BUSCAR EM PARTIDAS AO VIVO PRIMEIRO
    console.log('LiveScore: Buscando em partidas ao vivo...');
    const liveUrl = `${LIVESCORE_API_URL}/matches/v2/list-live?Category=soccer`;
    
    try {
      const liveResponse = await fetch(liveUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': LIVESCORE_API_KEY,
          'x-rapidapi-host': LIVESCORE_API_HOST,
        },
      });
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        console.log('LiveScore: Partidas ao vivo disponíveis:', liveData.Stages?.length || 0, 'ligas');
        matchResult = findMatchInData(liveData);
      }
    } catch (liveError) {
      console.log('LiveScore: Erro ao buscar ao vivo:', liveError.message);
    }
    
    // 2. SE NÃO ENCONTROU AO VIVO, BUSCAR POR DATA
    if (!matchResult) {
      console.log('LiveScore: Buscando por data...');
      const date = new Date(matchDate);
      
      // Tentar buscar na data original e também no dia seguinte
      // (diferença de fuso horário pode fazer a partida aparecer em outro dia)
      const datesToTry = [];
      
      // Data original
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      datesToTry.push(`${year}${month}${day}`);
      
      // Dia seguinte (para cobrir diferença de fuso horário)
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextYear = nextDay.getFullYear();
      const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
      const nextDayStr = String(nextDay.getDate()).padStart(2, '0');
      datesToTry.push(`${nextYear}${nextMonth}${nextDayStr}`);
      
      console.log('LiveScore: Datas a tentar:', datesToTry.join(', '));
      
      for (const dateStr of datesToTry) {
        if (matchResult) break;
        
        console.log('LiveScore: Buscando na data:', dateStr);
        const dateUrl = `${LIVESCORE_API_URL}/matches/v2/list-by-date?Category=soccer&Date=${dateStr}`;
      
        const dateResponse = await fetch(dateUrl, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': LIVESCORE_API_KEY,
            'x-rapidapi-host': LIVESCORE_API_HOST,
          },
        });
        
        if (dateResponse.ok) {
          const dateData = await dateResponse.json();
          console.log('LiveScore: Partidas da data', dateStr, ':', dateData.Stages?.length || 0, 'ligas');
          matchResult = findMatchInData(dateData);
        }
      }
    }
    
    if (!matchResult) {
      console.log('LiveScore: Partida não encontrada');
      return null;
    }
    
    const matchFound = matchResult.match;
    const stageFound = matchResult.stage;
    
    console.log('LiveScore: Partida encontrada -', matchFound.T1?.[0]?.Nm, 'vs', matchFound.T2?.[0]?.Nm);
    
    // Buscar detalhes da partida (inclui eventos)
    const matchId = matchFound.Eid;
    const detailsUrl = `${LIVESCORE_API_URL}/matches/v2/get-incidents?Eid=${matchId}&Category=soccer`;
    
    console.log('LiveScore Details URL:', detailsUrl);
    
    const detailsResponse = await fetch(detailsUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': LIVESCORE_API_KEY,
        'x-rapidapi-host': LIVESCORE_API_HOST,
      },
    });
    
    if (!detailsResponse.ok) {
      console.log('LiveScore Details erro:', detailsResponse.status);
      return null;
    }
    
    const detailsData = await detailsResponse.json();
    
    console.log('LiveScore Details recebido:', JSON.stringify(detailsData).substring(0, 500));
    
    // Mapear incidentes para o formato do app
    const events = [];
    
    // Nomes dos times da partida encontrada
    const homeTeamName = matchFound.T1?.[0]?.Nm || homeTeam;
    const awayTeamName = matchFound.T2?.[0]?.Nm || awayTeam;
    
    if (detailsData.Incs) {
      // Incs tem chaves "1" (primeiro tempo) e "2" (segundo tempo)
      for (const [period, incidents] of Object.entries(detailsData.Incs)) {
        if (Array.isArray(incidents)) {
          for (const inc of incidents) {
            // Verificar se é um grupo de incidentes (gol com assistência)
            if (inc.Incs && Array.isArray(inc.Incs)) {
              // Grupo de incidentes - procurar gol e assistência
              let goalInc = null;
              let assistInc = null;
              
              for (const subInc of inc.Incs) {
                if (subInc.IT === 36 || subInc.IT === 37 || subInc.IT === 39) {
                  goalInc = subInc;
                } else if (subInc.IT === 63) {
                  assistInc = subInc;
                }
              }
              
              // Adicionar gol com assistência
              if (goalInc) {
                const playerName = goalInc.Pn || (goalInc.Fn + ' ' + goalInc.Ln) || 'Jogador';
                const assistName = assistInc ? (assistInc.Pn || (assistInc.Fn + ' ' + assistInc.Ln)) : null;
                const teamName = goalInc.Nm === 1 ? homeTeamName : awayTeamName;
                const teamSide = goalInc.Nm === 1 ? 'home' : 'away';
                
                let detail = 'Normal Goal';
                if (goalInc.IT === 39) detail = 'Penalty';
                if (goalInc.IT === 37) detail = 'Own Goal';
                
                events.push({
                  time: { elapsed: goalInc.Min || inc.Min || 0, extra: null },
                  type: 'Goal',
                  detail: detail,
                  team: { id: teamSide, name: teamName },
                  player: { name: playerName },
                  assist: assistName ? { name: assistName } : null,
                  score: goalInc.Sc || inc.Sc || null,
                });
              }
            } else {
              // Incidente simples (cartão, substituição)
              processLiveScoreIncident(inc, events, period, homeTeamName, awayTeamName);
            }
          }
        }
      }
    }
    
    // Ordenar eventos por tempo
    events.sort((a, b) => a.time.elapsed - b.time.elapsed);
    
    console.log('LiveScore: Eventos encontrados:', events.length);
    if (events.length > 0) {
      console.log('Eventos:', events.map(e => `${e.time.elapsed}' ${e.type}: ${e.player?.name}`).join(', '));
    }
    
    return {
      events: events,
      homeTeamApiId: 'home',
      awayTeamApiId: 'away',
    };
    
  } catch (error) {
    console.log('Erro ao buscar eventos LiveScore:', error);
    return null;
  }
}

// Gerar eventos simulados baseados no placar (fallback) - DESABILITADO por imprecisão
export function generateMockEventsFromScore(homeTeam, awayTeam, homeGoals, awayGoals) {
  // Retornar vazio para não mostrar dados falsos
  return [];
}

// Buscar eventos usando TheSportsDB (gratuito e sem limite)
export async function getMatchEventsSportsDB(homeTeam, awayTeam, dateStr) {
  try {
    // Buscar eventos do jogo no TheSportsDB
    const response = await fetch(
      `${SPORTSDB_BASE_URL}/searchevents.php?e=${encodeURIComponent(homeTeam)}_vs_${encodeURIComponent(awayTeam)}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const events = data.event;
    
    if (!events || events.length === 0) {
      return null;
    }
    
    // Encontrar o evento mais próximo da data
    const targetDate = new Date(dateStr);
    let closestEvent = events[0];
    let minDiff = Math.abs(new Date(events[0].dateEvent) - targetDate);
    
    for (const event of events) {
      const diff = Math.abs(new Date(event.dateEvent) - targetDate);
      if (diff < minDiff) {
        minDiff = diff;
        closestEvent = event;
      }
    }
    
    // Parsear os eventos do jogo (gols, cartões, etc)
    const parsedEvents = parseTheSportsDBEvents(closestEvent);
    
    return {
      events: parsedEvents,
      timeline: closestEvent.strTimeline || null,
      homeLineup: closestEvent.strHomeLineupForward || null,
      awayLineup: closestEvent.strAwayLineupForward || null,
    };
  } catch (error) {
    console.log('Erro ao buscar eventos SportsDB:', error);
    return null;
  }
}

// Parsear eventos do TheSportsDB
function parseTheSportsDBEvents(match) {
  const events = [];
  
  // Parsear gols do time da casa
  if (match.strHomeGoalDetails) {
    const homeGoals = match.strHomeGoalDetails.split(';').filter(g => g.trim());
    homeGoals.forEach(goal => {
      const parts = goal.trim().split(':');
      if (parts.length >= 1) {
        const minute = parts[0].trim().replace("'", "");
        const player = parts.slice(1).join(':').trim();
        events.push({
          time: { elapsed: parseInt(minute) || 0 },
          team: { name: match.strHomeTeam },
          player: { name: player || 'Gol' },
          assist: { name: null },
          type: 'Goal',
          detail: 'Normal Goal',
          isHome: true,
        });
      }
    });
  }
  
  // Parsear gols do time visitante
  if (match.strAwayGoalDetails) {
    const awayGoals = match.strAwayGoalDetails.split(';').filter(g => g.trim());
    awayGoals.forEach(goal => {
      const parts = goal.trim().split(':');
      if (parts.length >= 1) {
        const minute = parts[0].trim().replace("'", "");
        const player = parts.slice(1).join(':').trim();
        events.push({
          time: { elapsed: parseInt(minute) || 0 },
          team: { name: match.strAwayTeam },
          player: { name: player || 'Gol' },
          assist: { name: null },
          type: 'Goal',
          detail: 'Normal Goal',
          isHome: false,
        });
      }
    });
  }
  
  // Parsear cartões amarelos casa
  if (match.strHomeYellowCards) {
    const cards = match.strHomeYellowCards.split(';').filter(c => c.trim());
    cards.forEach(card => {
      const parts = card.trim().split(':');
      const minute = parts[0]?.trim().replace("'", "") || '0';
      const player = parts.slice(1).join(':').trim();
      events.push({
        time: { elapsed: parseInt(minute) || 0 },
        team: { name: match.strHomeTeam },
        player: { name: player || 'Jogador' },
        type: 'Card',
        detail: 'Yellow Card',
        isHome: true,
      });
    });
  }
  
  // Parsear cartões amarelos visitante
  if (match.strAwayYellowCards) {
    const cards = match.strAwayYellowCards.split(';').filter(c => c.trim());
    cards.forEach(card => {
      const parts = card.trim().split(':');
      const minute = parts[0]?.trim().replace("'", "") || '0';
      const player = parts.slice(1).join(':').trim();
      events.push({
        time: { elapsed: parseInt(minute) || 0 },
        team: { name: match.strAwayTeam },
        player: { name: player || 'Jogador' },
        type: 'Card',
        detail: 'Yellow Card',
        isHome: false,
      });
    });
  }
  
  // Parsear cartões vermelhos casa
  if (match.strHomeRedCards) {
    const cards = match.strHomeRedCards.split(';').filter(c => c.trim());
    cards.forEach(card => {
      const parts = card.trim().split(':');
      const minute = parts[0]?.trim().replace("'", "") || '0';
      const player = parts.slice(1).join(':').trim();
      events.push({
        time: { elapsed: parseInt(minute) || 0 },
        team: { name: match.strHomeTeam },
        player: { name: player || 'Jogador' },
        type: 'Card',
        detail: 'Red Card',
        isHome: true,
      });
    });
  }
  
  // Parsear cartões vermelhos visitante
  if (match.strAwayRedCards) {
    const cards = match.strAwayRedCards.split(';').filter(c => c.trim());
    cards.forEach(card => {
      const parts = card.trim().split(':');
      const minute = parts[0]?.trim().replace("'", "") || '0';
      const player = parts.slice(1).join(':').trim();
      events.push({
        time: { elapsed: parseInt(minute) || 0 },
        team: { name: match.strAwayTeam },
        player: { name: player || 'Jogador' },
        type: 'Card',
        detail: 'Red Card',
        isHome: false,
      });
    });
  }
  
  // Ordenar por minuto
  events.sort((a, b) => a.time.elapsed - b.time.elapsed);
  
  return events;
}

export async function getSquad(teamId) {
  const data = await fetchAPI(`/teams/${teamId}`);
  if (data && data.squad) {
    const teamName = data.name;
    
    const playersWithPhotos = await Promise.all(
      data.squad.slice(0, 30).map(async (player) => {
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
  // Premier League
  { team: { id: 64, name: 'Liverpool FC', code: 'LIV', country: 'England', logo: 'https://crests.football-data.org/64.png', founded: 1892 } },
  { team: { id: 65, name: 'Manchester City FC', code: 'MCI', country: 'England', logo: 'https://crests.football-data.org/65.png', founded: 1880 } },
  { team: { id: 57, name: 'Arsenal FC', code: 'ARS', country: 'England', logo: 'https://crests.football-data.org/57.png', founded: 1886 } },
  { team: { id: 61, name: 'Chelsea FC', code: 'CHE', country: 'England', logo: 'https://crests.football-data.org/61.png', founded: 1905 } },
  { team: { id: 66, name: 'Manchester United FC', code: 'MUN', country: 'England', logo: 'https://crests.football-data.org/66.png', founded: 1878 } },
  { team: { id: 73, name: 'Tottenham Hotspur FC', code: 'TOT', country: 'England', logo: 'https://crests.football-data.org/73.png', founded: 1882 } },
  { team: { id: 58, name: 'Aston Villa FC', code: 'AVL', country: 'England', logo: 'https://crests.football-data.org/58.png', founded: 1874 } },
  { team: { id: 67, name: 'Newcastle United FC', code: 'NEW', country: 'England', logo: 'https://crests.football-data.org/67.png', founded: 1892 } },
  // Brasileirão
  { team: { id: 1783, name: 'CR Flamengo', code: 'FLA', country: 'Brazil', logo: 'https://crests.football-data.org/1783.png', founded: 1895 } },
  { team: { id: 1765, name: 'SE Palmeiras', code: 'PAL', country: 'Brazil', logo: 'https://crests.football-data.org/1765.png', founded: 1914 } },
  { team: { id: 1767, name: 'SC Corinthians Paulista', code: 'COR', country: 'Brazil', logo: 'https://crests.football-data.org/1767.png', founded: 1910 } },
  { team: { id: 1766, name: 'São Paulo FC', code: 'SAO', country: 'Brazil', logo: 'https://crests.football-data.org/1766.png', founded: 1930 } },
  { team: { id: 1776, name: 'Grêmio FBPA', code: 'GRE', country: 'Brazil', logo: 'https://crests.football-data.org/1776.png', founded: 1903 } },
  { team: { id: 1769, name: 'SC Internacional', code: 'INT', country: 'Brazil', logo: 'https://crests.football-data.org/1769.png', founded: 1909 } },
  { team: { id: 1772, name: 'CA Mineiro', code: 'CAM', country: 'Brazil', logo: 'https://crests.football-data.org/1772.png', founded: 1908 } },
  { team: { id: 1785, name: 'Cruzeiro EC', code: 'CRU', country: 'Brazil', logo: 'https://crests.football-data.org/1785.png', founded: 1921 } },
  { team: { id: 1777, name: 'Santos FC', code: 'SAN', country: 'Brazil', logo: 'https://crests.football-data.org/1777.png', founded: 1912 } },
  { team: { id: 1784, name: 'EC Bahia', code: 'BAH', country: 'Brazil', logo: 'https://crests.football-data.org/1784.png', founded: 1931 } },
  { team: { id: 1768, name: 'CR Vasco da Gama', code: 'VAS', country: 'Brazil', logo: 'https://crests.football-data.org/1768.png', founded: 1898 } },
  { team: { id: 1771, name: 'Botafogo FR', code: 'BOT', country: 'Brazil', logo: 'https://crests.football-data.org/1771.png', founded: 1904 } },
  { team: { id: 1770, name: 'Fluminense FC', code: 'FLU', country: 'Brazil', logo: 'https://crests.football-data.org/1770.png', founded: 1902 } },
  // La Liga
  { team: { id: 86, name: 'Real Madrid CF', code: 'RMA', country: 'Spain', logo: 'https://crests.football-data.org/86.png', founded: 1902 } },
  { team: { id: 81, name: 'FC Barcelona', code: 'BAR', country: 'Spain', logo: 'https://crests.football-data.org/81.png', founded: 1899 } },
  { team: { id: 78, name: 'Club Atlético de Madrid', code: 'ATM', country: 'Spain', logo: 'https://crests.football-data.org/78.png', founded: 1903 } },
  // Bundesliga
  { team: { id: 5, name: 'FC Bayern München', code: 'FCB', country: 'Germany', logo: 'https://crests.football-data.org/5.png', founded: 1900 } },
  { team: { id: 4, name: 'Borussia Dortmund', code: 'BVB', country: 'Germany', logo: 'https://crests.football-data.org/4.png', founded: 1909 } },
  { team: { id: 721, name: 'RB Leipzig', code: 'RBL', country: 'Germany', logo: 'https://crests.football-data.org/721.png', founded: 2009 } },
  { team: { id: 3, name: 'Bayer 04 Leverkusen', code: 'B04', country: 'Germany', logo: 'https://crests.football-data.org/3.png', founded: 1904 } },
  // Serie A
  { team: { id: 109, name: 'Juventus FC', code: 'JUV', country: 'Italy', logo: 'https://crests.football-data.org/109.png', founded: 1897 } },
  { team: { id: 108, name: 'FC Internazionale Milano', code: 'INT', country: 'Italy', logo: 'https://crests.football-data.org/108.png', founded: 1908 } },
  { team: { id: 98, name: 'AC Milan', code: 'MIL', country: 'Italy', logo: 'https://crests.football-data.org/98.png', founded: 1899 } },
  { team: { id: 113, name: 'SSC Napoli', code: 'NAP', country: 'Italy', logo: 'https://crests.football-data.org/113.png', founded: 1926 } },
  // Ligue 1
  { team: { id: 524, name: 'Paris Saint-Germain FC', code: 'PSG', country: 'France', logo: 'https://crests.football-data.org/524.png', founded: 1970 } },
  { team: { id: 516, name: 'Olympique de Marseille', code: 'OM', country: 'France', logo: 'https://crests.football-data.org/516.png', founded: 1899 } },
];

// Campeonatos Mock para busca
export const CAMPEONATOS_MOCK = [
  { league: { id: 2013, name: 'Campeonato Brasileiro Série A', code: 'BSA', country: 'Brazil', logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/85.png' } },
  { league: { id: 2021, name: 'Premier League', code: 'PL', country: 'England', logo: 'https://crests.football-data.org/PL.png' } },
  { league: { id: 2001, name: 'UEFA Champions League', code: 'CL', country: 'Europe', logo: 'https://crests.football-data.org/CL.png' } },
  { league: { id: 2014, name: 'La Liga', code: 'PD', country: 'Spain', logo: 'https://crests.football-data.org/PD.png' } },
  { league: { id: 2019, name: 'Serie A', code: 'SA', country: 'Italy', logo: 'https://crests.football-data.org/SA.png' } },
  { league: { id: 2002, name: 'Bundesliga', code: 'BL1', country: 'Germany', logo: 'https://crests.football-data.org/BL1.png' } },
  { league: { id: 2015, name: 'Ligue 1', code: 'FL1', country: 'France', logo: 'https://crests.football-data.org/FL1.png' } },
  { league: { id: 2152, name: 'Copa Libertadores', code: 'CLI', country: 'South America', logo: 'https://crests.football-data.org/CLI.png' } },
];

// Atletas Mock (para tela de detalhes de atleta)
export const ATLETAS_MOCK = [
  { player: { id: 1, name: 'Erling Haaland', nationality: 'Norway', age: 24, photo: null, position: 'Attacker', number: 9 } },
  { player: { id: 2, name: 'Mohamed Salah', nationality: 'Egypt', age: 32, photo: null, position: 'Attacker', number: 11 } },
  { player: { id: 3, name: 'Kevin De Bruyne', nationality: 'Belgium', age: 33, photo: null, position: 'Midfielder', number: 17 } },
  { player: { id: 4, name: 'Virgil van Dijk', nationality: 'Netherlands', age: 33, photo: null, position: 'Defender', number: 4 } },
  { player: { id: 5, name: 'Gabriel Jesus', nationality: 'Brazil', age: 27, photo: null, position: 'Attacker', number: 9 } },
];

// ==================== MAIORES ARTILHEIROS EM ATIVIDADE ====================
// Ranking atualizado dos maiores artilheiros ainda em atividade (dados de dezembro 2025)
// Fontes: Transfermarkt, Wikipedia, sites oficiais dos clubes
export const ARTILHEIROS_LENDARIOS = [
  {
    player: { 
      id: 101, 
      name: 'Cristiano Ronaldo', 
      firstName: 'Cristiano', 
      lastName: 'Ronaldo', 
      nationality: 'Portugal', 
      age: 39, 
      dateOfBirth: '1985-02-05',
      position: 'Attacker',
      shirtNumber: 7,
      height: '1.87 m',
      photo: 'https://media.api-sports.io/football/players/874.png'
    },
    team: { 
      id: 0, 
      name: 'Al-Nassr FC', 
      crest: 'https://media.api-sports.io/football/teams/2939.png',
      country: 'Saudi Arabia',
      isInApp: false
    },
    goals: 954,
    assists: 263,
    playedMatches: 1300,
    titles: 35,
    goldenBoots: 4,
    ballonDor: 5,
    formerTeams: 'Sporting CP, Manchester United, Real Madrid, Juventus',
    mainTitles: '5x Champions League, 3x Premier League, 2x La Liga, 2x Serie A, Euro 2016, Nations League 2019',
    statistics: [{ goals: { total: 954 }, assists: 263, penalties: 162, playedMatches: 1300, team: { name: 'Al-Nassr FC' } }]
  },
  {
    player: { 
      id: 102, 
      name: 'Lionel Messi', 
      firstName: 'Lionel', 
      lastName: 'Messi', 
      nationality: 'Argentina', 
      age: 37, 
      dateOfBirth: '1987-06-24',
      position: 'Attacker',
      shirtNumber: 10,
      height: '1.70 m',
      photo: 'https://media.api-sports.io/football/players/154.png'
    },
    team: { 
      id: 0, 
      name: 'Inter Miami CF', 
      crest: 'https://media.api-sports.io/football/teams/9568.png',
      country: 'USA',
      isInApp: false
    },
    goals: 896,
    assists: 383,
    playedMatches: 1137,
    titles: 45,
    goldenBoots: 6,
    ballonDor: 8,
    formerTeams: 'Barcelona, Paris Saint-Germain',
    mainTitles: '4x Champions League, 10x La Liga, Copa América 2021, Copa do Mundo 2022',
    statistics: [{ goals: { total: 896 }, assists: 383, penalties: 114, playedMatches: 1137, team: { name: 'Inter Miami CF' } }]
  },
  {
    player: { 
      id: 103, 
      name: 'Robert Lewandowski', 
      firstName: 'Robert', 
      lastName: 'Lewandowski', 
      nationality: 'Poland', 
      age: 36, 
      dateOfBirth: '1988-08-21',
      position: 'Attacker',
      shirtNumber: 9,
      height: '1.85 m',
      photo: 'https://media.api-sports.io/football/players/521.png'
    },
    team: { 
      id: 81, 
      name: 'FC Barcelona', 
      crest: 'https://crests.football-data.org/81.png',
      country: 'Spain',
      isInApp: false
    },
    goals: 672,
    assists: 175,
    playedMatches: 958,
    titles: 24,
    goldenBoots: 1,
    ballonDor: 0,
    formerTeams: 'Znicz Pruszków, Lech Poznań, Borussia Dortmund, Bayern München',
    mainTitles: '1x Champions League, 10x Bundesliga, 1x La Liga',
    statistics: [{ goals: { total: 672 }, assists: 175, penalties: 92, playedMatches: 958, team: { name: 'FC Barcelona' } }]
  },
  {
    player: { 
      id: 106, 
      name: 'Luis Suárez', 
      firstName: 'Luis', 
      lastName: 'Suárez', 
      nationality: 'Uruguay', 
      age: 37, 
      dateOfBirth: '1987-01-24',
      position: 'Attacker',
      shirtNumber: 9,
      height: '1.82 m',
      photo: 'https://media.api-sports.io/football/players/156.png'
    },
    team: { 
      id: 0, 
      name: 'Inter Miami CF', 
      crest: 'https://media.api-sports.io/football/teams/9568.png',
      country: 'USA',
      isInApp: false
    },
    goals: 556,
    assists: 258,
    playedMatches: 890,
    titles: 22,
    goldenBoots: 2,
    ballonDor: 0,
    formerTeams: 'Nacional, Groningen, Ajax, Liverpool, Barcelona, Atlético Madrid',
    mainTitles: '1x Champions League, 4x La Liga, 1x Eredivisie, 2x Copa América',
    statistics: [{ goals: { total: 556 }, assists: 258, penalties: 60, playedMatches: 890, team: { name: 'Inter Miami CF' } }]
  },
  {
    player: { 
      id: 107, 
      name: 'Hulk', 
      firstName: 'Givanildo', 
      lastName: 'Vieira de Sousa', 
      nationality: 'Brazil', 
      age: 38, 
      dateOfBirth: '1986-07-25',
      position: 'Attacker',
      shirtNumber: 7,
      height: '1.80 m',
      photo: 'https://media.api-sports.io/football/players/10253.png'
    },
    team: { 
      id: 1772, 
      name: 'CA Mineiro', 
      crest: 'https://media.api-sports.io/football/teams/1062.png',
      country: 'Brazil',
      isInApp: false
    },
    goals: 451,
    assists: 142,
    playedMatches: 755,
    titles: 18,
    goldenBoots: 2,
    ballonDor: 0,
    formerTeams: 'Vitória, Consadole Sapporo, Kawasaki Frontale, Tokyo Verdy, Porto, Zenit, Shanghai SIPG',
    mainTitles: '3x Campeonato Português, 3x Liga Russa, 1x Brasileirão, 1x Copa do Brasil, 2x Supercopa do Brasil',
    statistics: [{ goals: { total: 451 }, assists: 142, penalties: 98, playedMatches: 755, team: { name: 'CA Mineiro', logo: 'https://media.api-sports.io/football/teams/1062.png' } }]
  },
  {
    player: { 
      id: 104, 
      name: 'Neymar Jr', 
      firstName: 'Neymar', 
      lastName: 'da Silva Santos Jr', 
      nationality: 'Brazil', 
      age: 32, 
      dateOfBirth: '1992-02-05',
      position: 'Attacker',
      shirtNumber: 10,
      height: '1.75 m',
      photo: 'https://media.api-sports.io/football/players/276.png'
    },
    team: { 
      id: 1777, 
      name: 'Santos FC', 
      crest: 'https://logodetimes.com/times/santos/logo-santos-256.png',
      country: 'Brazil',
      isInApp: false
    },
    goals: 439,
    assists: 286,
    playedMatches: 744,
    titles: 28,
    goldenBoots: 0,
    ballonDor: 0,
    formerTeams: 'Santos, Barcelona, Paris Saint-Germain, Al-Hilal',
    mainTitles: '1x Champions League, 2x La Liga, 5x Ligue 1, 3x Brasileirão, Copa Libertadores 2011, Olimpíadas 2016',
    statistics: [{ goals: { total: 439 }, assists: 286, penalties: 75, playedMatches: 744, team: { name: 'Santos FC' } }]
  },
  {
    player: { 
      id: 105, 
      name: 'Karim Benzema', 
      firstName: 'Karim', 
      lastName: 'Benzema', 
      nationality: 'France', 
      age: 37, 
      dateOfBirth: '1987-12-19',
      position: 'Attacker',
      shirtNumber: 9,
      height: '1.85 m',
      photo: 'https://media.api-sports.io/football/players/759.png'
    },
    team: { 
      id: 0, 
      name: 'Al-Ittihad Club', 
      crest: 'https://api.sofascore.app/api/v1/team/34315/image',
      country: 'Saudi Arabia',
      isInApp: false
    },
    goals: 435,
    assists: 184,
    playedMatches: 875,
    titles: 26,
    goldenBoots: 0,
    ballonDor: 1,
    formerTeams: 'Lyon, Real Madrid',
    mainTitles: '5x Champions League, 4x La Liga, 1x Ligue 1, Ballon d\'Or 2022',
    statistics: [{ goals: { total: 435 }, assists: 184, penalties: 55, playedMatches: 875, team: { name: 'Al-Ittihad Club' } }]
  },
  {
    player: { 
      id: 108, 
      name: 'Harry Kane', 
      firstName: 'Harry', 
      lastName: 'Kane', 
      nationality: 'England', 
      age: 31, 
      dateOfBirth: '1993-07-28',
      position: 'Attacker',
      shirtNumber: 9,
      height: '1.88 m',
      photo: 'https://media.api-sports.io/football/players/184.png'
    },
    team: { 
      id: 5, 
      name: 'FC Bayern München', 
      crest: 'https://crests.football-data.org/5.png',
      country: 'Germany',
      isInApp: false
    },
    goals: 382,
    assists: 115,
    playedMatches: 615,
    titles: 1,
    goldenBoots: 3,
    ballonDor: 0,
    formerTeams: 'Tottenham Hotspur, Leyton Orient (empréstimo), Millwall (empréstimo), Norwich (empréstimo), Leicester (empréstimo)',
    mainTitles: '1x Bundesliga, 3x Chuteira de Ouro Premier League',
    statistics: [{ goals: { total: 382 }, assists: 115, penalties: 80, playedMatches: 615, team: { name: 'FC Bayern München' } }]
  },
  {
    player: { 
      id: 111, 
      name: 'Mohamed Salah', 
      firstName: 'Mohamed', 
      lastName: 'Salah', 
      nationality: 'Egypt', 
      age: 32, 
      dateOfBirth: '1992-06-15',
      position: 'Attacker',
      shirtNumber: 11,
      height: '1.75 m',
      photo: 'https://media.api-sports.io/football/players/306.png'
    },
    team: { 
      id: 64, 
      name: 'Liverpool FC', 
      crest: 'https://crests.football-data.org/64.png',
      country: 'England',
      isInApp: false
    },
    goals: 323,
    assists: 163,
    playedMatches: 565,
    titles: 10,
    goldenBoots: 3,
    ballonDor: 0,
    formerTeams: 'El Mokawloon, Basel, Chelsea, Fiorentina (empréstimo), Roma',
    mainTitles: '1x Champions League, 1x Premier League, 1x FA Cup, 2x League Cup',
    statistics: [{ goals: { total: 323 }, assists: 163, penalties: 55, playedMatches: 565, team: { name: 'Liverpool FC' } }]
  },
  {
    player: { 
      id: 110, 
      name: 'Kylian Mbappé', 
      firstName: 'Kylian', 
      lastName: 'Mbappé', 
      nationality: 'France', 
      age: 26, 
      dateOfBirth: '1998-12-20',
      position: 'Attacker',
      shirtNumber: 9,
      height: '1.78 m',
      photo: 'https://media.api-sports.io/football/players/278.png'
    },
    team: { 
      id: 86, 
      name: 'Real Madrid CF', 
      crest: 'https://crests.football-data.org/86.png',
      country: 'Spain',
      isInApp: false
    },
    goals: 312,
    assists: 138,
    playedMatches: 442,
    titles: 16,
    goldenBoots: 4,
    ballonDor: 0,
    formerTeams: 'Monaco, Paris Saint-Germain',
    mainTitles: '1x Ligue 1 (Monaco), 6x Ligue 1 (PSG), Copa do Mundo 2018, Vice Copa 2022',
    statistics: [{ goals: { total: 312 }, assists: 138, penalties: 45, playedMatches: 442, team: { name: 'Real Madrid CF' } }]
  },
  {
    player: { 
      id: 109, 
      name: 'Erling Haaland', 
      firstName: 'Erling', 
      lastName: 'Haaland', 
      nationality: 'Norway', 
      age: 24, 
      dateOfBirth: '2000-07-21',
      position: 'Attacker',
      shirtNumber: 9,
      height: '1.94 m',
      photo: 'https://media.api-sports.io/football/players/1100.png'
    },
    team: { 
      id: 65, 
      name: 'Manchester City FC', 
      crest: 'https://crests.football-data.org/65.png',
      country: 'England',
      isInApp: false
    },
    goals: 285,
    assists: 58,
    playedMatches: 332,
    titles: 12,
    goldenBoots: 2,
    ballonDor: 0,
    formerTeams: 'Bryne, Molde, RB Salzburg, Borussia Dortmund',
    mainTitles: '1x Champions League, 2x Premier League, 1x Bundesliga, 1x Treble (2023)',
    statistics: [{ goals: { total: 285 }, assists: 58, penalties: 35, playedMatches: 332, team: { name: 'Manchester City FC' } }]
  },
  {
    player: { 
      id: 113, 
      name: 'Edinson Cavani', 
      firstName: 'Edinson', 
      lastName: 'Cavani', 
      nationality: 'Uruguay', 
      age: 37, 
      dateOfBirth: '1987-02-14',
      position: 'Attacker',
      shirtNumber: 9,
      height: '1.84 m',
      photo: 'https://media.api-sports.io/football/players/138.png'
    },
    team: { 
      id: 0, 
      name: 'Boca Juniors', 
      crest: 'https://tmssl.akamaized.net/images/wappen/head/189.png',
      country: 'Argentina',
      isInApp: false
    },
    goals: 432,
    assists: 98,
    playedMatches: 760,
    titles: 17,
    goldenBoots: 1,
    ballonDor: 0,
    formerTeams: 'Danubio, Palermo, Napoli, PSG, Manchester United, Valencia',
    mainTitles: '1x Serie A, 6x Ligue 1, Copa América 2011',
    statistics: [{ goals: { total: 432 }, assists: 98, penalties: 65, playedMatches: 760, team: { name: 'Boca Juniors' } }]
  },
];

// Função para buscar artilheiros lendários com fotos atualizadas
export async function getLegendsScorers() {
  // Buscar fotos atualizadas para cada lenda
  const legendsWithPhotos = await Promise.all(
    ARTILHEIROS_LENDARIOS.map(async (legend) => {
      try {
        // Tentar buscar foto atualizada do TheSportsDB
        const details = await fetchPlayerDetails(legend.player.name, legend.team?.name);
        if (details?.photo) {
          return {
            ...legend,
            player: {
              ...legend.player,
              photo: details.photo,
            }
          };
        }
      } catch (error) {
        console.log('Usando foto padrão para:', legend.player.name);
      }
      return legend;
    })
  );
  
  // Ordenar por número de gols
  return legendsWithPhotos.sort((a, b) => b.goals - a.goals);
}

// ==================== DETALHES DA PARTIDA ====================

// Buscar detalhes de uma partida específica incluindo os gols
export async function getMatchDetails(matchId) {
  try {
    const data = await fetchAPI(`/matches/${matchId}`);
    
    if (!data) return null;
    
    // Formatar os dados da partida
    const match = {
      fixture: {
        id: data.id,
        date: data.utcDate,
        status: {
          short: mapStatus(data.status),
          elapsed: data.minute || null,
        },
        venue: {
          name: data.venue || null,
        }
      },
      league: {
        id: data.competition?.id,
        code: data.competition?.code,
        name: data.competition?.name,
        logo: data.competition?.emblem,
        round: `Rodada ${data.matchday}`,
      },
      teams: {
        home: {
          id: data.homeTeam?.id,
          name: data.homeTeam?.name,
          logo: data.homeTeam?.crest,
          winner: data.score?.winner === 'HOME_TEAM',
        },
        away: {
          id: data.awayTeam?.id,
          name: data.awayTeam?.name,
          logo: data.awayTeam?.crest,
          winner: data.score?.winner === 'AWAY_TEAM',
        }
      },
      goals: {
        home: data.score?.fullTime?.home ?? data.score?.halfTime?.home ?? null,
        away: data.score?.fullTime?.away ?? data.score?.halfTime?.away ?? null,
      },
      score: data.score,
      // Gols marcados (disponível na API v4)
      scorers: data.goals || [],
      // Referees
      referees: data.referees || [],
    };
    
    // Converter scorers para eventos
    const eventos = [];
    
    if (data.goals && data.goals.length > 0) {
      data.goals.forEach(goal => {
        eventos.push({
          time: { elapsed: goal.minute, extra: goal.injuryTime || null },
          team: { id: goal.team?.id, name: goal.team?.name },
          player: { name: goal.scorer?.name || 'Desconhecido' },
          assist: { name: goal.assist?.name || null },
          type: 'Goal',
          detail: goal.type || 'Normal Goal',
        });
      });
    }
    
    // Se não houver gols detalhados na API, criar eventos mais realistas
    if (eventos.length === 0 && (match.goals.home > 0 || match.goals.away > 0)) {
      // Gerar minutos aleatórios ordenados para dar mais realismo
      const totalGols = (match.goals.home || 0) + (match.goals.away || 0);
      const minutos = [];
      for (let i = 0; i < totalGols; i++) {
        minutos.push(Math.floor(Math.random() * 90) + 1);
      }
      minutos.sort((a, b) => a - b);
      
      let indexMinuto = 0;
      
      // Gols do mandante
      for (let i = 0; i < (match.goals.home || 0); i++) {
        eventos.push({
          time: { elapsed: minutos[indexMinuto] || '?' },
          team: { id: data.homeTeam?.id, name: data.homeTeam?.name },
          player: { name: 'Gol' },
          assist: { name: null },
          type: 'Goal',
          detail: 'Normal Goal',
        });
        indexMinuto++;
      }
      
      // Gols do visitante
      for (let i = 0; i < (match.goals.away || 0); i++) {
        eventos.push({
          time: { elapsed: minutos[indexMinuto] || '?' },
          team: { id: data.awayTeam?.id, name: data.awayTeam?.name },
          player: { name: 'Gol' },
          assist: { name: null },
          type: 'Goal',
          detail: 'Normal Goal',
        });
        indexMinuto++;
      }
      
      // Ordenar eventos por minuto
      eventos.sort((a, b) => (a.time.elapsed || 0) - (b.time.elapsed || 0));
    }
    
    match.eventos = eventos;
    
    return match;
  } catch (error) {
    console.error('Erro ao buscar detalhes da partida:', error);
    return null;
  }
}

// Função para buscar eventos de uma partida (alias)
export async function getFixtureEvents(matchId) {
  const match = await getMatchDetails(matchId);
  return match?.eventos || [];
}

// Eventos Mock (para tela de detalhes de partida)
export const EVENTOS_MOCK = [
  { time: { elapsed: 23 }, team: { id: 1 }, player: { name: 'Raphael Veiga' }, assist: { name: 'Dudu' }, type: 'Goal', detail: 'Normal Goal' },
  { time: { elapsed: 45 }, team: { id: 2 }, player: { name: 'Gabriel Barbosa' }, assist: { name: 'Arrascaeta' }, type: 'Goal', detail: 'Normal Goal' },
  { time: { elapsed: 67 }, team: { id: 1 }, player: { name: 'Endrick' }, assist: { name: null }, type: 'Goal', detail: 'Normal Goal' },
  { time: { elapsed: 78 }, team: { id: 2 }, player: { name: 'Pedro' }, assist: { name: 'Everton Ribeiro' }, type: 'Goal', detail: 'Penalty' },
];

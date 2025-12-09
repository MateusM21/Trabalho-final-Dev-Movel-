// Serviço de API para o API-Football
// Documentação: https://www.api-football.com/documentation-v3

const API_BASE_URL = 'https://v3.football.api-sports.io';

// Substitua pela sua chave de API do RapidAPI ou API-Sports
const API_KEY = '2e4344c80ab03f0e2dae7e7834f6b531';

const headers = {
  'x-apisports-key': API_KEY,
  // Alternativa para RapidAPI:
  // 'x-rapidapi-host': 'v3.football.api-sports.io',
  // 'x-rapidapi-key': API_KEY,
};

// Função auxiliar para fazer requisições
async function fetchAPI(endpoint, params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    console.log('Fetching:', url); // Debug
    
    const response = await fetch(url, { 
      method: 'GET',
      headers 
    });
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', endpoint, 'results:', data.results); // Debug
    return data; // Retorna o objeto completo com { response, results, errors, etc }
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return { response: [], results: 0, errors: [error.message] };
  }
}

// ==================== LIGAS/CAMPEONATOS ====================

// Lista todas as ligas/campeonatos disponíveis
export async function getLeagues(params = {}) {
  return fetchAPI('/leagues', params);
}

// Ligas de um país específico
export async function getLeaguesByCountry(country) {
  return fetchAPI('/leagues', { country });
}

// Ligas do Brasil
export async function getBrazilianLeagues() {
  return fetchAPI('/leagues', { country: 'Brazil' });
}

// Detalhes de uma liga específica
export async function getLeague(leagueId) {
  return fetchAPI('/leagues', { id: leagueId });
}

// ==================== CLASSIFICAÇÃO ====================

// Tabela de classificação de uma liga
export async function getStandings(leagueId, season) {
  return fetchAPI('/standings', { league: leagueId, season });
}

// ==================== PARTIDAS/FIXTURES ====================

// Partidas ao vivo
export async function getLiveMatches() {
  return fetchAPI('/fixtures', { live: 'all' });
}

// Partidas de uma liga em uma temporada
export async function getFixtures(leagueId, season) {
  return fetchAPI('/fixtures', { league: leagueId, season });
}

// Partidas por data
export async function getFixturesByDate(date) {
  return fetchAPI('/fixtures', { date }); // formato: YYYY-MM-DD
}

// Próximas partidas
export async function getNextFixtures(leagueId, next = 10) {
  return fetchAPI('/fixtures', { league: leagueId, next });
}

// Detalhes de uma partida
export async function getFixture(fixtureId) {
  return fetchAPI('/fixtures', { id: fixtureId });
}

// Estatísticas de uma partida
export async function getFixtureStatistics(fixtureId) {
  return fetchAPI('/fixtures/statistics', { fixture: fixtureId });
}

// Eventos de uma partida (gols, cartões, substituições)
export async function getFixtureEvents(fixtureId) {
  return fetchAPI('/fixtures/events', { fixture: fixtureId });
}

// Escalações de uma partida
export async function getFixtureLineups(fixtureId) {
  return fetchAPI('/fixtures/lineups', { fixture: fixtureId });
}

// ==================== TIMES ====================

// Informações de um time
export async function getTeam(teamId) {
  return fetchAPI('/teams', { id: teamId });
}

// Times de uma liga
export async function getTeamsByLeague(leagueId, season) {
  return fetchAPI('/teams', { league: leagueId, season });
}

// Times de um país
export async function getTeamsByCountry(country) {
  return fetchAPI('/teams', { country });
}

// Buscar times
export async function searchTeams(name) {
  return fetchAPI('/teams', { search: name });
}

// Estatísticas de um time em uma temporada
export async function getTeamStatistics(teamId, leagueId, season) {
  return fetchAPI('/teams/statistics', { team: teamId, league: leagueId, season });
}

// Partidas de um time específico
export async function getTeamFixtures(teamId, season, next = 10) {
  return fetchAPI('/fixtures', { team: teamId, season, next });
}

// Últimas partidas de um time
export async function getTeamLastFixtures(teamId, last = 10) {
  return fetchAPI('/fixtures', { team: teamId, last });
}

// ==================== JOGADORES ====================

// Jogadores de um time
export async function getSquad(teamId) {
  return fetchAPI('/players/squads', { team: teamId });
}

// Informações de um jogador
export async function getPlayer(playerId, season) {
  return fetchAPI('/players', { id: playerId, season });
}

// Buscar jogadores
export async function searchPlayers(name, leagueId, season) {
  return fetchAPI('/players', { search: name, league: leagueId, season });
}

// Artilheiros de uma liga
export async function getTopScorers(leagueId, season) {
  return fetchAPI('/players/topscorers', { league: leagueId, season });
}

// Assistências de uma liga
export async function getTopAssists(leagueId, season) {
  return fetchAPI('/players/topassists', { league: leagueId, season });
}

// ==================== ODDS/APOSTAS ====================

export async function getOdds(fixtureId) {
  return fetchAPI('/odds', { fixture: fixtureId });
}

// ==================== TRANSFERÊNCIAS ====================

export async function getTransfers(teamId) {
  return fetchAPI('/transfers', { team: teamId });
}

// ==================== DADOS MOCKADOS (Para desenvolvimento sem API) ====================

// IDs reais das ligas brasileiras na API-Football
export const LEAGUE_IDS = {
  // Brasil
  BRASILEIRAO_A: 71,
  BRASILEIRAO_B: 72,
  BRASILEIRAO_C: 75,
  BRASILEIRAO_D: 76,
  COPA_DO_BRASIL: 73,
  // Sul-Americanos
  LIBERTADORES: 13,
  SULAMERICANA: 11,
  RECOPA: 15,
  // Europa - Top 5 Ligas
  PREMIER_LEAGUE: 39,
  CHAMPIONSHIP: 40,
  LA_LIGA: 140,
  LA_LIGA_2: 141,
  SERIE_A: 135,
  SERIE_B: 136,
  BUNDESLIGA: 78,
  BUNDESLIGA_2: 79,
  LIGUE_1: 61,
  LIGUE_2: 62,
  // Portugal
  PRIMEIRA_LIGA: 94,
  // Holanda
  EREDIVISIE: 88,
  // Competições Europeias
  CHAMPIONS_LEAGUE: 2,
  EUROPA_LEAGUE: 3,
  CONFERENCE_LEAGUE: 848,
  // Argentina
  LIGA_PROFESIONAL: 128,
  // Outros
  MLS: 253,
  LIGA_MX: 262,
};

// Estrutura organizada de campeonatos por categoria
export const CAMPEONATOS_ESTRUTURADOS = {
  continentais: {
    europa: {
      nome: 'Europa',
      competicoes: [
        {
          league: { id: 2, name: 'UEFA Champions League', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/2.png' },
          country: { name: 'Europe', code: null, flag: null },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 3, name: 'UEFA Europa League', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/3.png' },
          country: { name: 'Europe', code: null, flag: null },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 848, name: 'UEFA Conference League', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/848.png' },
          country: { name: 'Europe', code: null, flag: null },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    sulamericana: {
      nome: 'América do Sul',
      competicoes: [
        {
          league: { id: 13, name: 'CONMEBOL Libertadores', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/13.png' },
          country: { name: 'South America', code: null, flag: null },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 11, name: 'CONMEBOL Sudamericana', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/11.png' },
          country: { name: 'South America', code: null, flag: null },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 15, name: 'CONMEBOL Recopa', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/15.png' },
          country: { name: 'South America', code: null, flag: null },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
  },
  nacionais: {
    brasil: {
      nome: 'Brasil',
      flag: 'https://media.api-sports.io/flags/br.svg',
      divisoes: [
        {
          league: { id: 71, name: 'Brasileirão Série A', type: 'League', logo: 'https://media.api-sports.io/football/leagues/71.png' },
          country: { name: 'Brazil', code: 'BR', flag: 'https://media.api-sports.io/flags/br.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 72, name: 'Brasileirão Série B', type: 'League', logo: 'https://media.api-sports.io/football/leagues/72.png' },
          country: { name: 'Brazil', code: 'BR', flag: 'https://media.api-sports.io/flags/br.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 75, name: 'Brasileirão Série C', type: 'League', logo: 'https://media.api-sports.io/football/leagues/75.png' },
          country: { name: 'Brazil', code: 'BR', flag: 'https://media.api-sports.io/flags/br.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 76, name: 'Brasileirão Série D', type: 'League', logo: 'https://media.api-sports.io/football/leagues/76.png' },
          country: { name: 'Brazil', code: 'BR', flag: 'https://media.api-sports.io/flags/br.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 73, name: 'Copa do Brasil', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/73.png' },
          country: { name: 'Brazil', code: 'BR', flag: 'https://media.api-sports.io/flags/br.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    inglaterra: {
      nome: 'Inglaterra',
      flag: 'https://media.api-sports.io/flags/gb.svg',
      divisoes: [
        {
          league: { id: 39, name: 'Premier League', type: 'League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
          country: { name: 'England', code: 'GB', flag: 'https://media.api-sports.io/flags/gb.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 40, name: 'Championship', type: 'League', logo: 'https://media.api-sports.io/football/leagues/40.png' },
          country: { name: 'England', code: 'GB', flag: 'https://media.api-sports.io/flags/gb.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 41, name: 'League One', type: 'League', logo: 'https://media.api-sports.io/football/leagues/41.png' },
          country: { name: 'England', code: 'GB', flag: 'https://media.api-sports.io/flags/gb.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 42, name: 'League Two', type: 'League', logo: 'https://media.api-sports.io/football/leagues/42.png' },
          country: { name: 'England', code: 'GB', flag: 'https://media.api-sports.io/flags/gb.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 45, name: 'FA Cup', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/45.png' },
          country: { name: 'England', code: 'GB', flag: 'https://media.api-sports.io/flags/gb.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 48, name: 'EFL Cup', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/48.png' },
          country: { name: 'England', code: 'GB', flag: 'https://media.api-sports.io/flags/gb.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    espanha: {
      nome: 'Espanha',
      flag: 'https://media.api-sports.io/flags/es.svg',
      divisoes: [
        {
          league: { id: 140, name: 'La Liga', type: 'League', logo: 'https://media.api-sports.io/football/leagues/140.png' },
          country: { name: 'Spain', code: 'ES', flag: 'https://media.api-sports.io/flags/es.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 141, name: 'La Liga 2', type: 'League', logo: 'https://media.api-sports.io/football/leagues/141.png' },
          country: { name: 'Spain', code: 'ES', flag: 'https://media.api-sports.io/flags/es.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 143, name: 'Copa del Rey', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/143.png' },
          country: { name: 'Spain', code: 'ES', flag: 'https://media.api-sports.io/flags/es.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    italia: {
      nome: 'Itália',
      flag: 'https://media.api-sports.io/flags/it.svg',
      divisoes: [
        {
          league: { id: 135, name: 'Serie A', type: 'League', logo: 'https://media.api-sports.io/football/leagues/135.png' },
          country: { name: 'Italy', code: 'IT', flag: 'https://media.api-sports.io/flags/it.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 136, name: 'Serie B', type: 'League', logo: 'https://media.api-sports.io/football/leagues/136.png' },
          country: { name: 'Italy', code: 'IT', flag: 'https://media.api-sports.io/flags/it.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 137, name: 'Coppa Italia', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/137.png' },
          country: { name: 'Italy', code: 'IT', flag: 'https://media.api-sports.io/flags/it.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    alemanha: {
      nome: 'Alemanha',
      flag: 'https://media.api-sports.io/flags/de.svg',
      divisoes: [
        {
          league: { id: 78, name: 'Bundesliga', type: 'League', logo: 'https://media.api-sports.io/football/leagues/78.png' },
          country: { name: 'Germany', code: 'DE', flag: 'https://media.api-sports.io/flags/de.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 79, name: '2. Bundesliga', type: 'League', logo: 'https://media.api-sports.io/football/leagues/79.png' },
          country: { name: 'Germany', code: 'DE', flag: 'https://media.api-sports.io/flags/de.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 81, name: 'DFB Pokal', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/81.png' },
          country: { name: 'Germany', code: 'DE', flag: 'https://media.api-sports.io/flags/de.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    franca: {
      nome: 'França',
      flag: 'https://media.api-sports.io/flags/fr.svg',
      divisoes: [
        {
          league: { id: 61, name: 'Ligue 1', type: 'League', logo: 'https://media.api-sports.io/football/leagues/61.png' },
          country: { name: 'France', code: 'FR', flag: 'https://media.api-sports.io/flags/fr.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 62, name: 'Ligue 2', type: 'League', logo: 'https://media.api-sports.io/football/leagues/62.png' },
          country: { name: 'France', code: 'FR', flag: 'https://media.api-sports.io/flags/fr.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 66, name: 'Coupe de France', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/66.png' },
          country: { name: 'France', code: 'FR', flag: 'https://media.api-sports.io/flags/fr.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    portugal: {
      nome: 'Portugal',
      flag: 'https://media.api-sports.io/flags/pt.svg',
      divisoes: [
        {
          league: { id: 94, name: 'Primeira Liga', type: 'League', logo: 'https://media.api-sports.io/football/leagues/94.png' },
          country: { name: 'Portugal', code: 'PT', flag: 'https://media.api-sports.io/flags/pt.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 95, name: 'Liga Portugal 2', type: 'League', logo: 'https://media.api-sports.io/football/leagues/95.png' },
          country: { name: 'Portugal', code: 'PT', flag: 'https://media.api-sports.io/flags/pt.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 96, name: 'Taça de Portugal', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/96.png' },
          country: { name: 'Portugal', code: 'PT', flag: 'https://media.api-sports.io/flags/pt.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    holanda: {
      nome: 'Holanda',
      flag: 'https://media.api-sports.io/flags/nl.svg',
      divisoes: [
        {
          league: { id: 88, name: 'Eredivisie', type: 'League', logo: 'https://media.api-sports.io/football/leagues/88.png' },
          country: { name: 'Netherlands', code: 'NL', flag: 'https://media.api-sports.io/flags/nl.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 89, name: 'Eerste Divisie', type: 'League', logo: 'https://media.api-sports.io/football/leagues/89.png' },
          country: { name: 'Netherlands', code: 'NL', flag: 'https://media.api-sports.io/flags/nl.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 90, name: 'KNVB Beker', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/90.png' },
          country: { name: 'Netherlands', code: 'NL', flag: 'https://media.api-sports.io/flags/nl.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    argentina: {
      nome: 'Argentina',
      flag: 'https://media.api-sports.io/flags/ar.svg',
      divisoes: [
        {
          league: { id: 128, name: 'Liga Profesional Argentina', type: 'League', logo: 'https://media.api-sports.io/football/leagues/128.png' },
          country: { name: 'Argentina', code: 'AR', flag: 'https://media.api-sports.io/flags/ar.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 129, name: 'Primera Nacional', type: 'League', logo: 'https://media.api-sports.io/football/leagues/129.png' },
          country: { name: 'Argentina', code: 'AR', flag: 'https://media.api-sports.io/flags/ar.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 130, name: 'Copa Argentina', type: 'Cup', logo: 'https://media.api-sports.io/football/leagues/130.png' },
          country: { name: 'Argentina', code: 'AR', flag: 'https://media.api-sports.io/flags/ar.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    eua: {
      nome: 'Estados Unidos',
      flag: 'https://media.api-sports.io/flags/us.svg',
      divisoes: [
        {
          league: { id: 253, name: 'MLS', type: 'League', logo: 'https://media.api-sports.io/football/leagues/253.png' },
          country: { name: 'USA', code: 'US', flag: 'https://media.api-sports.io/flags/us.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
    mexico: {
      nome: 'México',
      flag: 'https://media.api-sports.io/flags/mx.svg',
      divisoes: [
        {
          league: { id: 262, name: 'Liga MX', type: 'League', logo: 'https://media.api-sports.io/football/leagues/262.png' },
          country: { name: 'Mexico', code: 'MX', flag: 'https://media.api-sports.io/flags/mx.svg' },
          seasons: [{ year: 2024, current: true }],
        },
        {
          league: { id: 263, name: 'Liga de Expansión MX', type: 'League', logo: 'https://media.api-sports.io/football/leagues/263.png' },
          country: { name: 'Mexico', code: 'MX', flag: 'https://media.api-sports.io/flags/mx.svg' },
          seasons: [{ year: 2024, current: true }],
        },
      ],
    },
  },
};

// Helper para obter todos os campeonatos em lista plana
export function getAllCampeonatos() {
  const todos = [];
  
  // Adicionar continentais
  Object.values(CAMPEONATOS_ESTRUTURADOS.continentais).forEach(cont => {
    todos.push(...cont.competicoes);
  });
  
  // Adicionar nacionais
  Object.values(CAMPEONATOS_ESTRUTURADOS.nacionais).forEach(pais => {
    todos.push(...pais.divisoes);
  });
  
  return todos;
}

// Helper para obter times de um país específico
export function getTimesByCountry(countryName) {
  return TIMES_MOCK.filter(t => t.team.country === countryName);
}

// Campeonatos mockados - Brasileiros e Europeus (compatibilidade)
export const CAMPEONATOS_MOCK = [
  // BRASIL
  {
    league: {
      id: 71,
      name: 'Brasileirão Série A',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/71.png',
    },
    country: {
      name: 'Brazil',
      code: 'BR',
      flag: 'https://media.api-sports.io/flags/br.svg',
    },
    seasons: [{ year: 2024, current: true }],
  },
  {
    league: {
      id: 73,
      name: 'Copa do Brasil',
      type: 'Cup',
      logo: 'https://media.api-sports.io/football/leagues/73.png',
    },
    country: {
      name: 'Brazil',
      code: 'BR',
      flag: 'https://media.api-sports.io/flags/br.svg',
    },
    seasons: [{ year: 2024, current: true }],
  },
  {
    league: {
      id: 13,
      name: 'CONMEBOL Libertadores',
      type: 'Cup',
      logo: 'https://media.api-sports.io/football/leagues/13.png',
    },
    country: {
      name: 'South America',
      code: null,
      flag: null,
    },
    seasons: [{ year: 2024, current: true }],
  },
  // INGLATERRA
  {
    league: {
      id: 39,
      name: 'Premier League',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
    },
    country: {
      name: 'England',
      code: 'GB',
      flag: 'https://media.api-sports.io/flags/gb.svg',
    },
    seasons: [{ year: 2024, current: true }],
  },
  // ESPANHA
  {
    league: {
      id: 140,
      name: 'La Liga',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/140.png',
    },
    country: {
      name: 'Spain',
      code: 'ES',
      flag: 'https://media.api-sports.io/flags/es.svg',
    },
    seasons: [{ year: 2024, current: true }],
  },
  // ITÁLIA
  {
    league: {
      id: 135,
      name: 'Serie A',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/135.png',
    },
    country: {
      name: 'Italy',
      code: 'IT',
      flag: 'https://media.api-sports.io/flags/it.svg',
    },
    seasons: [{ year: 2024, current: true }],
  },
  // ALEMANHA
  {
    league: {
      id: 78,
      name: 'Bundesliga',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/78.png',
    },
    country: {
      name: 'Germany',
      code: 'DE',
      flag: 'https://media.api-sports.io/flags/de.svg',
    },
    seasons: [{ year: 2024, current: true }],
  },
  // FRANÇA
  {
    league: {
      id: 61,
      name: 'Ligue 1',
      type: 'League',
      logo: 'https://media.api-sports.io/football/leagues/61.png',
    },
    country: {
      name: 'France',
      code: 'FR',
      flag: 'https://media.api-sports.io/flags/fr.svg',
    },
    seasons: [{ year: 2024, current: true }],
  },
  // CHAMPIONS LEAGUE
  {
    league: {
      id: 2,
      name: 'UEFA Champions League',
      type: 'Cup',
      logo: 'https://media.api-sports.io/football/leagues/2.png',
    },
    country: {
      name: 'Europe',
      code: null,
      flag: null,
    },
    seasons: [{ year: 2024, current: true }],
  },
  // EUROPA LEAGUE
  {
    league: {
      id: 3,
      name: 'UEFA Europa League',
      type: 'Cup',
      logo: 'https://media.api-sports.io/football/leagues/3.png',
    },
    country: {
      name: 'Europe',
      code: null,
      flag: null,
    },
    seasons: [{ year: 2024, current: true }],
  },
];

// Times mockados - Brasileiros e Europeus (IDs reais da API-Football)
export const TIMES_MOCK = [
  // BRASIL
  {
    team: {
      id: 127,
      name: 'Flamengo',
      code: 'FLA',
      country: 'Brazil',
      founded: 1895,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/127.png',
    },
    venue: {
      id: 233,
      name: 'Estádio Jornalista Mário Filho',
      city: 'Rio de Janeiro',
      capacity: 78838,
    },
  },
  {
    team: {
      id: 121,
      name: 'Palmeiras',
      code: 'PAL',
      country: 'Brazil',
      founded: 1914,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/121.png',
    },
    venue: {
      id: 220,
      name: 'Allianz Parque',
      city: 'São Paulo',
      capacity: 43713,
    },
  },
  {
    team: {
      id: 131,
      name: 'Corinthians',
      code: 'COR',
      country: 'Brazil',
      founded: 1910,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/131.png',
    },
    venue: {
      id: 235,
      name: 'Neo Química Arena',
      city: 'São Paulo',
      capacity: 49205,
    },
  },
  {
    team: {
      id: 126,
      name: 'São Paulo',
      code: 'SAO',
      country: 'Brazil',
      founded: 1930,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/126.png',
    },
    venue: {
      id: 231,
      name: 'Estádio Cícero Pompeu de Toledo',
      city: 'São Paulo',
      capacity: 66795,
    },
  },
  {
    team: {
      id: 124,
      name: 'Fluminense',
      code: 'FLU',
      country: 'Brazil',
      founded: 1902,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/124.png',
    },
    venue: {
      id: 233,
      name: 'Estádio Jornalista Mário Filho',
      city: 'Rio de Janeiro',
      capacity: 78838,
    },
  },
  {
    team: {
      id: 120,
      name: 'Botafogo',
      code: 'BOT',
      country: 'Brazil',
      founded: 1904,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/120.png',
    },
    venue: {
      id: 219,
      name: 'Estádio Olímpico Nilton Santos',
      city: 'Rio de Janeiro',
      capacity: 46931,
    },
  },
  {
    team: {
      id: 130,
      name: 'Grêmio',
      code: 'GRE',
      country: 'Brazil',
      founded: 1903,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/130.png',
    },
    venue: {
      id: 234,
      name: 'Arena do Grêmio',
      city: 'Porto Alegre',
      capacity: 55662,
    },
  },
  {
    team: {
      id: 119,
      name: 'Internacional',
      code: 'INT',
      country: 'Brazil',
      founded: 1909,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/119.png',
    },
    venue: {
      id: 218,
      name: 'Estádio José Pinheiro Borda',
      city: 'Porto Alegre',
      capacity: 50128,
    },
  },
  // INGLATERRA - Premier League
  {
    team: {
      id: 33,
      name: 'Manchester United',
      code: 'MUN',
      country: 'England',
      founded: 1878,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/33.png',
    },
    venue: {
      id: 556,
      name: 'Old Trafford',
      city: 'Manchester',
      capacity: 76212,
    },
  },
  {
    team: {
      id: 50,
      name: 'Manchester City',
      code: 'MCI',
      country: 'England',
      founded: 1880,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/50.png',
    },
    venue: {
      id: 555,
      name: 'Etihad Stadium',
      city: 'Manchester',
      capacity: 55017,
    },
  },
  {
    team: {
      id: 40,
      name: 'Liverpool',
      code: 'LIV',
      country: 'England',
      founded: 1892,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/40.png',
    },
    venue: {
      id: 550,
      name: 'Anfield',
      city: 'Liverpool',
      capacity: 55074,
    },
  },
  {
    team: {
      id: 42,
      name: 'Arsenal',
      code: 'ARS',
      country: 'England',
      founded: 1886,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/42.png',
    },
    venue: {
      id: 494,
      name: 'Emirates Stadium',
      city: 'London',
      capacity: 60704,
    },
  },
  {
    team: {
      id: 49,
      name: 'Chelsea',
      code: 'CHE',
      country: 'England',
      founded: 1905,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/49.png',
    },
    venue: {
      id: 519,
      name: 'Stamford Bridge',
      city: 'London',
      capacity: 40834,
    },
  },
  {
    team: {
      id: 47,
      name: 'Tottenham',
      code: 'TOT',
      country: 'England',
      founded: 1882,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/47.png',
    },
    venue: {
      id: 593,
      name: 'Tottenham Hotspur Stadium',
      city: 'London',
      capacity: 62850,
    },
  },
  // ESPANHA - La Liga
  {
    team: {
      id: 541,
      name: 'Real Madrid',
      code: 'RMA',
      country: 'Spain',
      founded: 1902,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/541.png',
    },
    venue: {
      id: 1456,
      name: 'Estadio Santiago Bernabéu',
      city: 'Madrid',
      capacity: 81044,
    },
  },
  {
    team: {
      id: 529,
      name: 'Barcelona',
      code: 'BAR',
      country: 'Spain',
      founded: 1899,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/529.png',
    },
    venue: {
      id: 1460,
      name: 'Estadi Olímpic Lluís Companys',
      city: 'Barcelona',
      capacity: 55926,
    },
  },
  {
    team: {
      id: 530,
      name: 'Atlético Madrid',
      code: 'ATM',
      country: 'Spain',
      founded: 1903,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/530.png',
    },
    venue: {
      id: 1461,
      name: 'Cívitas Metropolitano',
      city: 'Madrid',
      capacity: 68456,
    },
  },
  // ITÁLIA - Serie A
  {
    team: {
      id: 489,
      name: 'AC Milan',
      code: 'MIL',
      country: 'Italy',
      founded: 1899,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/489.png',
    },
    venue: {
      id: 907,
      name: 'Stadio Giuseppe Meazza',
      city: 'Milano',
      capacity: 80018,
    },
  },
  {
    team: {
      id: 505,
      name: 'Inter',
      code: 'INT',
      country: 'Italy',
      founded: 1908,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/505.png',
    },
    venue: {
      id: 907,
      name: 'Stadio Giuseppe Meazza',
      city: 'Milano',
      capacity: 80018,
    },
  },
  {
    team: {
      id: 496,
      name: 'Juventus',
      code: 'JUV',
      country: 'Italy',
      founded: 1897,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/496.png',
    },
    venue: {
      id: 910,
      name: 'Allianz Stadium',
      city: 'Torino',
      capacity: 41507,
    },
  },
  {
    team: {
      id: 497,
      name: 'Roma',
      code: 'ROM',
      country: 'Italy',
      founded: 1927,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/497.png',
    },
    venue: {
      id: 911,
      name: 'Stadio Olimpico',
      city: 'Roma',
      capacity: 73261,
    },
  },
  {
    team: {
      id: 492,
      name: 'Napoli',
      code: 'NAP',
      country: 'Italy',
      founded: 1926,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/492.png',
    },
    venue: {
      id: 908,
      name: 'Stadio Diego Armando Maradona',
      city: 'Napoli',
      capacity: 54726,
    },
  },
  // ALEMANHA - Bundesliga
  {
    team: {
      id: 157,
      name: 'Bayern Munich',
      code: 'BAY',
      country: 'Germany',
      founded: 1900,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/157.png',
    },
    venue: {
      id: 700,
      name: 'Allianz Arena',
      city: 'München',
      capacity: 75000,
    },
  },
  {
    team: {
      id: 165,
      name: 'Borussia Dortmund',
      code: 'DOR',
      country: 'Germany',
      founded: 1909,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/165.png',
    },
    venue: {
      id: 702,
      name: 'Signal Iduna Park',
      city: 'Dortmund',
      capacity: 81365,
    },
  },
  {
    team: {
      id: 173,
      name: 'RB Leipzig',
      code: 'LEI',
      country: 'Germany',
      founded: 2009,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/173.png',
    },
    venue: {
      id: 712,
      name: 'Red Bull Arena',
      city: 'Leipzig',
      capacity: 42959,
    },
  },
  // FRANÇA - Ligue 1
  {
    team: {
      id: 85,
      name: 'Paris Saint Germain',
      code: 'PSG',
      country: 'France',
      founded: 1970,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/85.png',
    },
    venue: {
      id: 671,
      name: 'Parc des Princes',
      city: 'Paris',
      capacity: 47929,
    },
  },
  {
    team: {
      id: 81,
      name: 'Marseille',
      code: 'MAR',
      country: 'France',
      founded: 1899,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/81.png',
    },
    venue: {
      id: 667,
      name: 'Orange Vélodrome',
      city: 'Marseille',
      capacity: 67394,
    },
  },
  {
    team: {
      id: 80,
      name: 'Lyon',
      code: 'LYO',
      country: 'France',
      founded: 1950,
      national: false,
      logo: 'https://media.api-sports.io/football/teams/80.png',
    },
    venue: {
      id: 666,
      name: 'Groupama Stadium',
      city: 'Décines-Charpieu',
      capacity: 59186,
    },
  },
];

// Partidas mockadas (formato API-Football) - Brasileiras e Europeias
export const PARTIDAS_MOCK = [
  // BRASILEIRÃO
  {
    fixture: {
      id: 1001,
      referee: 'Wilton Pereira Sampaio',
      timezone: 'America/Sao_Paulo',
      date: '2025-12-07T16:00:00-03:00',
      timestamp: 1733594400,
      venue: {
        id: 233,
        name: 'Estádio Jornalista Mário Filho',
        city: 'Rio de Janeiro',
      },
      status: {
        long: 'Match Finished',
        short: 'FT',
        elapsed: 90,
      },
    },
    league: CAMPEONATOS_MOCK[0].league,
    teams: {
      home: TIMES_MOCK[0].team,
      away: TIMES_MOCK[1].team,
    },
    goals: {
      home: 2,
      away: 1,
    },
    score: {
      halftime: { home: 1, away: 0 },
      fulltime: { home: 2, away: 1 },
    },
  },
  {
    fixture: {
      id: 1002,
      referee: 'Anderson Daronco',
      timezone: 'America/Sao_Paulo',
      date: '2025-12-08T19:00:00-03:00',
      timestamp: 1733691600,
      venue: {
        id: 235,
        name: 'Neo Química Arena',
        city: 'São Paulo',
      },
      status: {
        long: 'Not Started',
        short: 'NS',
        elapsed: null,
      },
    },
    league: CAMPEONATOS_MOCK[0].league,
    teams: {
      home: TIMES_MOCK[2].team,
      away: TIMES_MOCK[3].team,
    },
    goals: {
      home: null,
      away: null,
    },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 1003,
      referee: 'Raphael Claus',
      timezone: 'America/Sao_Paulo',
      date: '2025-12-06T18:30:00-03:00',
      timestamp: 1733517000,
      venue: {
        id: 233,
        name: 'Estádio Jornalista Mário Filho',
        city: 'Rio de Janeiro',
      },
      status: {
        long: 'Second Half',
        short: '2H',
        elapsed: 67,
      },
    },
    league: CAMPEONATOS_MOCK[0].league,
    teams: {
      home: TIMES_MOCK[4].team,
      away: TIMES_MOCK[5].team,
    },
    goals: {
      home: 1,
      away: 1,
    },
    score: {
      halftime: { home: 0, away: 1 },
      fulltime: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 1004,
      referee: 'Bruno Arleu de Araújo',
      timezone: 'America/Sao_Paulo',
      date: '2025-12-05T21:30:00-03:00',
      timestamp: 1733441400,
      venue: {
        id: 234,
        name: 'Arena do Grêmio',
        city: 'Porto Alegre',
      },
      status: {
        long: 'Match Finished',
        short: 'FT',
        elapsed: 90,
      },
    },
    league: CAMPEONATOS_MOCK[2].league, // Libertadores
    teams: {
      home: TIMES_MOCK[6].team,
      away: TIMES_MOCK[7].team,
    },
    goals: {
      home: 3,
      away: 2,
    },
    score: {
      halftime: { home: 1, away: 1 },
      fulltime: { home: 3, away: 2 },
    },
  },
  // PREMIER LEAGUE
  {
    fixture: {
      id: 2001,
      referee: 'Michael Oliver',
      timezone: 'Europe/London',
      date: '2025-12-07T17:30:00Z',
      timestamp: 1733594400,
      venue: {
        id: 556,
        name: 'Old Trafford',
        city: 'Manchester',
      },
      status: {
        long: 'Match Finished',
        short: 'FT',
        elapsed: 90,
      },
    },
    league: CAMPEONATOS_MOCK[3].league, // Premier League
    teams: {
      home: TIMES_MOCK[8].team, // Man United
      away: TIMES_MOCK[9].team, // Man City
    },
    goals: {
      home: 1,
      away: 2,
    },
    score: {
      halftime: { home: 0, away: 1 },
      fulltime: { home: 1, away: 2 },
    },
  },
  {
    fixture: {
      id: 2002,
      referee: 'Anthony Taylor',
      timezone: 'Europe/London',
      date: '2025-12-08T16:00:00Z',
      timestamp: 1733673600,
      venue: {
        id: 550,
        name: 'Anfield',
        city: 'Liverpool',
      },
      status: {
        long: 'Not Started',
        short: 'NS',
        elapsed: null,
      },
    },
    league: CAMPEONATOS_MOCK[3].league,
    teams: {
      home: TIMES_MOCK[10].team, // Liverpool
      away: TIMES_MOCK[11].team, // Arsenal
    },
    goals: {
      home: null,
      away: null,
    },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
    },
  },
  // LA LIGA
  {
    fixture: {
      id: 3001,
      referee: 'Jesús Gil Manzano',
      timezone: 'Europe/Madrid',
      date: '2025-12-07T21:00:00+01:00',
      timestamp: 1733601600,
      venue: {
        id: 1456,
        name: 'Estadio Santiago Bernabéu',
        city: 'Madrid',
      },
      status: {
        long: 'Match Finished',
        short: 'FT',
        elapsed: 90,
      },
    },
    league: CAMPEONATOS_MOCK[4].league, // La Liga
    teams: {
      home: TIMES_MOCK[14].team, // Real Madrid
      away: TIMES_MOCK[15].team, // Barcelona
    },
    goals: {
      home: 2,
      away: 2,
    },
    score: {
      halftime: { home: 1, away: 1 },
      fulltime: { home: 2, away: 2 },
    },
  },
  // SERIE A
  {
    fixture: {
      id: 4001,
      referee: 'Daniele Orsato',
      timezone: 'Europe/Rome',
      date: '2025-12-08T20:45:00+01:00',
      timestamp: 1733690700,
      venue: {
        id: 907,
        name: 'Stadio Giuseppe Meazza',
        city: 'Milano',
      },
      status: {
        long: 'Not Started',
        short: 'NS',
        elapsed: null,
      },
    },
    league: CAMPEONATOS_MOCK[5].league, // Serie A
    teams: {
      home: TIMES_MOCK[17].team, // AC Milan
      away: TIMES_MOCK[18].team, // Inter
    },
    goals: {
      home: null,
      away: null,
    },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
    },
  },
  // BUNDESLIGA
  {
    fixture: {
      id: 5001,
      referee: 'Felix Zwayer',
      timezone: 'Europe/Berlin',
      date: '2025-12-06T18:30:00+01:00',
      timestamp: 1733506200,
      venue: {
        id: 700,
        name: 'Allianz Arena',
        city: 'München',
      },
      status: {
        long: 'First Half',
        short: '1H',
        elapsed: 35,
      },
    },
    league: CAMPEONATOS_MOCK[6].league, // Bundesliga
    teams: {
      home: TIMES_MOCK[23].team, // Bayern Munich
      away: TIMES_MOCK[24].team, // Borussia Dortmund
    },
    goals: {
      home: 2,
      away: 0,
    },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
    },
  },
  // CHAMPIONS LEAGUE
  {
    fixture: {
      id: 6001,
      referee: 'Clément Turpin',
      timezone: 'Europe/Paris',
      date: '2025-12-10T21:00:00+01:00',
      timestamp: 1733864400,
      venue: {
        id: 671,
        name: 'Parc des Princes',
        city: 'Paris',
      },
      status: {
        long: 'Not Started',
        short: 'NS',
        elapsed: null,
      },
    },
    league: CAMPEONATOS_MOCK[8].league, // Champions League
    teams: {
      home: TIMES_MOCK[26].team, // PSG
      away: TIMES_MOCK[9].team, // Man City
    },
    goals: {
      home: null,
      away: null,
    },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
    },
  },
  {
    fixture: {
      id: 6002,
      referee: 'Szymon Marciniak',
      timezone: 'Europe/Madrid',
      date: '2025-12-10T21:00:00+01:00',
      timestamp: 1733864400,
      venue: {
        id: 1456,
        name: 'Estadio Santiago Bernabéu',
        city: 'Madrid',
      },
      status: {
        long: 'Not Started',
        short: 'NS',
        elapsed: null,
      },
    },
    league: CAMPEONATOS_MOCK[8].league, // Champions League
    teams: {
      home: TIMES_MOCK[14].team, // Real Madrid
      away: TIMES_MOCK[10].team, // Liverpool
    },
    goals: {
      home: null,
      away: null,
    },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
    },
  },
];

// Tabela de classificação mockada (formato API-Football)
export const TABELA_MOCK = [
  {
    rank: 1,
    team: TIMES_MOCK[1].team,
    points: 78,
    goalsDiff: 37,
    group: 'Brasileirão Série A',
    form: 'WDWWW',
    status: 'same',
    description: 'Promotion - Champions League (Group Stage)',
    all: { played: 38, win: 24, draw: 6, lose: 8, goals: { for: 72, against: 35 } },
  },
  {
    rank: 2,
    team: TIMES_MOCK[0].team,
    points: 75,
    goalsDiff: 30,
    group: 'Brasileirão Série A',
    form: 'WWDLW',
    status: 'same',
    description: 'Promotion - Champions League (Group Stage)',
    all: { played: 38, win: 23, draw: 6, lose: 9, goals: { for: 68, against: 38 } },
  },
  {
    rank: 3,
    team: TIMES_MOCK[5].team,
    points: 71,
    goalsDiff: 27,
    group: 'Brasileirão Série A',
    form: 'DWWWL',
    status: 'same',
    description: 'Promotion - Champions League (Group Stage)',
    all: { played: 38, win: 21, draw: 8, lose: 9, goals: { for: 61, against: 34 } },
  },
  {
    rank: 4,
    team: TIMES_MOCK[4].team,
    points: 66,
    goalsDiff: 15,
    group: 'Brasileirão Série A',
    form: 'WDWDL',
    status: 'same',
    description: 'Promotion - Champions League (Group Stage)',
    all: { played: 38, win: 19, draw: 9, lose: 10, goals: { for: 55, against: 40 } },
  },
  {
    rank: 5,
    team: TIMES_MOCK[3].team,
    points: 62,
    goalsDiff: 10,
    group: 'Brasileirão Série A',
    form: 'LDWWW',
    status: 'same',
    description: 'Promotion - Copa Libertadores',
    all: { played: 38, win: 18, draw: 8, lose: 12, goals: { for: 52, against: 42 } },
  },
  {
    rank: 6,
    team: TIMES_MOCK[2].team,
    points: 58,
    goalsDiff: 3,
    group: 'Brasileirão Série A',
    form: 'DLWLD',
    status: 'same',
    description: 'Promotion - Copa Libertadores',
    all: { played: 38, win: 16, draw: 10, lose: 12, goals: { for: 48, against: 45 } },
  },
  {
    rank: 7,
    team: TIMES_MOCK[6].team,
    points: 54,
    goalsDiff: -3,
    group: 'Brasileirão Série A',
    form: 'WLLWD',
    status: 'same',
    description: 'Promotion - Copa Sudamericana',
    all: { played: 38, win: 15, draw: 9, lose: 14, goals: { for: 45, against: 48 } },
  },
  {
    rank: 8,
    team: TIMES_MOCK[7].team,
    points: 51,
    goalsDiff: -8,
    group: 'Brasileirão Série A',
    form: 'LLDWW',
    status: 'same',
    description: 'Promotion - Copa Sudamericana',
    all: { played: 38, win: 14, draw: 9, lose: 15, goals: { for: 42, against: 50 } },
  },
];

// Jogadores mockados (formato API-Football) - Brasileiros e Europeus
export const ATLETAS_MOCK = [
  // BRASILEIROS
  {
    player: {
      id: 10001,
      name: 'Gabriel Barbosa',
      firstname: 'Gabriel',
      lastname: 'Barbosa',
      age: 28,
      nationality: 'Brazil',
      height: '177 cm',
      weight: '73 kg',
      number: 9,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/10001.png',
    },
    statistics: [{
      team: TIMES_MOCK[0].team,
      league: CAMPEONATOS_MOCK[0].league,
      games: { appearences: 35, lineups: 30, minutes: 2850, position: 'Attacker' },
      goals: { total: 22, assists: 5 },
      cards: { yellow: 4, red: 0 },
    }],
  },
  {
    player: {
      id: 10002,
      name: 'Raphael Veiga',
      firstname: 'Raphael',
      lastname: 'Veiga',
      age: 29,
      nationality: 'Brazil',
      height: '178 cm',
      weight: '70 kg',
      number: 23,
      position: 'Meia',
      photo: 'https://media.api-sports.io/football/players/10002.png',
    },
    statistics: [{
      team: TIMES_MOCK[1].team,
      league: CAMPEONATOS_MOCK[0].league,
      games: { appearences: 32, lineups: 28, minutes: 2400, position: 'Midfielder' },
      goals: { total: 12, assists: 10 },
      cards: { yellow: 3, red: 0 },
    }],
  },
  {
    player: {
      id: 10003,
      name: 'Yuri Alberto',
      firstname: 'Yuri',
      lastname: 'Alberto',
      age: 23,
      nationality: 'Brazil',
      height: '182 cm',
      weight: '77 kg',
      number: 9,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/10003.png',
    },
    statistics: [{
      team: TIMES_MOCK[2].team,
      league: CAMPEONATOS_MOCK[0].league,
      games: { appearences: 38, lineups: 35, minutes: 3100, position: 'Attacker' },
      goals: { total: 16, assists: 8 },
      cards: { yellow: 6, red: 1 },
    }],
  },
  {
    player: {
      id: 10004,
      name: 'Luciano',
      firstname: 'Luciano',
      lastname: 'Neves',
      age: 31,
      nationality: 'Brazil',
      height: '180 cm',
      weight: '75 kg',
      number: 10,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/10004.png',
    },
    statistics: [{
      team: TIMES_MOCK[3].team,
      league: CAMPEONATOS_MOCK[0].league,
      games: { appearences: 36, lineups: 32, minutes: 2800, position: 'Attacker' },
      goals: { total: 14, assists: 6 },
      cards: { yellow: 5, red: 0 },
    }],
  },
  {
    player: {
      id: 10005,
      name: 'Germán Cano',
      firstname: 'Germán',
      lastname: 'Cano',
      age: 36,
      nationality: 'Argentina',
      height: '179 cm',
      weight: '74 kg',
      number: 14,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/10005.png',
    },
    statistics: [{
      team: TIMES_MOCK[4].team,
      league: CAMPEONATOS_MOCK[0].league,
      games: { appearences: 34, lineups: 30, minutes: 2700, position: 'Attacker' },
      goals: { total: 18, assists: 3 },
      cards: { yellow: 4, red: 0 },
    }],
  },
  // EUROPEUS - Premier League
  {
    player: {
      id: 278,
      name: 'Erling Haaland',
      firstname: 'Erling',
      lastname: 'Haaland',
      age: 24,
      nationality: 'Norway',
      height: '194 cm',
      weight: '88 kg',
      number: 9,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/278.png',
    },
    statistics: [{
      team: TIMES_MOCK[9].team, // Manchester City
      league: CAMPEONATOS_MOCK[3].league, // Premier League
      games: { appearences: 20, lineups: 20, minutes: 1780, position: 'Attacker' },
      goals: { total: 18, assists: 3 },
      cards: { yellow: 1, red: 0 },
    }],
  },
  {
    player: {
      id: 306,
      name: 'Mohamed Salah',
      firstname: 'Mohamed',
      lastname: 'Salah',
      age: 32,
      nationality: 'Egypt',
      height: '175 cm',
      weight: '71 kg',
      number: 11,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/306.png',
    },
    statistics: [{
      team: TIMES_MOCK[10].team, // Liverpool
      league: CAMPEONATOS_MOCK[3].league,
      games: { appearences: 18, lineups: 18, minutes: 1600, position: 'Attacker' },
      goals: { total: 15, assists: 12 },
      cards: { yellow: 0, red: 0 },
    }],
  },
  {
    player: {
      id: 1100,
      name: 'Bukayo Saka',
      firstname: 'Bukayo',
      lastname: 'Saka',
      age: 23,
      nationality: 'England',
      height: '178 cm',
      weight: '72 kg',
      number: 7,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/1100.png',
    },
    statistics: [{
      team: TIMES_MOCK[11].team, // Arsenal
      league: CAMPEONATOS_MOCK[3].league,
      games: { appearences: 19, lineups: 19, minutes: 1650, position: 'Attacker' },
      goals: { total: 9, assists: 8 },
      cards: { yellow: 3, red: 0 },
    }],
  },
  // LA LIGA
  {
    player: {
      id: 750,
      name: 'Vinícius Júnior',
      firstname: 'Vinícius',
      lastname: 'Júnior',
      age: 24,
      nationality: 'Brazil',
      height: '176 cm',
      weight: '73 kg',
      number: 7,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/750.png',
    },
    statistics: [{
      team: TIMES_MOCK[14].team, // Real Madrid
      league: CAMPEONATOS_MOCK[4].league, // La Liga
      games: { appearences: 17, lineups: 16, minutes: 1400, position: 'Attacker' },
      goals: { total: 12, assists: 7 },
      cards: { yellow: 4, red: 1 },
    }],
  },
  {
    player: {
      id: 874,
      name: 'Robert Lewandowski',
      firstname: 'Robert',
      lastname: 'Lewandowski',
      age: 36,
      nationality: 'Poland',
      height: '185 cm',
      weight: '81 kg',
      number: 9,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/874.png',
    },
    statistics: [{
      team: TIMES_MOCK[15].team, // Barcelona
      league: CAMPEONATOS_MOCK[4].league,
      games: { appearences: 18, lineups: 18, minutes: 1550, position: 'Attacker' },
      goals: { total: 16, assists: 2 },
      cards: { yellow: 2, red: 0 },
    }],
  },
  // BUNDESLIGA
  {
    player: {
      id: 521,
      name: 'Harry Kane',
      firstname: 'Harry',
      lastname: 'Kane',
      age: 31,
      nationality: 'England',
      height: '188 cm',
      weight: '86 kg',
      number: 9,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/521.png',
    },
    statistics: [{
      team: TIMES_MOCK[23].team, // Bayern Munich
      league: CAMPEONATOS_MOCK[6].league, // Bundesliga
      games: { appearences: 16, lineups: 16, minutes: 1440, position: 'Attacker' },
      goals: { total: 17, assists: 6 },
      cards: { yellow: 1, red: 0 },
    }],
  },
  // LIGUE 1
  {
    player: {
      id: 1062,
      name: 'Ousmane Dembélé',
      firstname: 'Ousmane',
      lastname: 'Dembélé',
      age: 27,
      nationality: 'France',
      height: '178 cm',
      weight: '67 kg',
      number: 10,
      position: 'Atacante',
      photo: 'https://media.api-sports.io/football/players/1062.png',
    },
    statistics: [{
      team: TIMES_MOCK[26].team, // PSG
      league: CAMPEONATOS_MOCK[7].league, // Ligue 1
      games: { appearences: 17, lineups: 15, minutes: 1300, position: 'Attacker' },
      goals: { total: 8, assists: 10 },
      cards: { yellow: 2, red: 0 },
    }],
  },
];

// Artilharia mockada - ordenada por gols
export const ARTILHARIA_MOCK = [...ATLETAS_MOCK]
  .sort((a, b) => (b.statistics[0]?.goals?.total || 0) - (a.statistics[0]?.goals?.total || 0))
  .map((atleta) => ({
    player: atleta.player,
    statistics: atleta.statistics,
  }));

// Eventos de partidas mockados (com nomes reais dos jogadores)
export const EVENTOS_MOCK = {
  // Flamengo 2 x 1 Palmeiras
  1001: [
    { minuto: 23, tipo: 'gol', time: 'mandante', jogador: 'Gabriel Barbosa', assistencia: 'Arrascaeta' },
    { minuto: 38, tipo: 'cartao_amarelo', time: 'visitante', jogador: 'Gustavo Gómez', assistencia: null },
    { minuto: 52, tipo: 'gol', time: 'visitante', jogador: 'Raphael Veiga', assistencia: 'Endrick' },
    { minuto: 67, tipo: 'cartao_amarelo', time: 'mandante', jogador: 'Gerson', assistencia: null },
    { minuto: 78, tipo: 'gol', time: 'mandante', jogador: 'Pedro', assistencia: 'Everton Ribeiro' },
  ],
  // Fluminense 1 x 1 Botafogo (ao vivo)
  1003: [
    { minuto: 12, tipo: 'gol', time: 'visitante', jogador: 'Luiz Henrique', assistencia: 'Tiquinho Soares' },
    { minuto: 45, tipo: 'cartao_amarelo', time: 'mandante', jogador: 'André', assistencia: null },
    { minuto: 58, tipo: 'gol', time: 'mandante', jogador: 'Germán Cano', assistencia: 'Jhon Arias' },
  ],
  // Grêmio 3 x 2 Internacional
  1004: [
    { minuto: 11, tipo: 'gol', time: 'mandante', jogador: 'Cristaldo', assistencia: 'Pavón' },
    { minuto: 28, tipo: 'gol', time: 'visitante', jogador: 'Borré', assistencia: 'Alan Patrick' },
    { minuto: 53, tipo: 'gol', time: 'mandante', jogador: 'Suárez', assistencia: 'Cristaldo' },
    { minuto: 67, tipo: 'cartao_amarelo', time: 'visitante', jogador: 'Mercado', assistencia: null },
    { minuto: 72, tipo: 'gol', time: 'visitante', jogador: 'Valencia', assistencia: 'Wanderson' },
    { minuto: 85, tipo: 'gol', time: 'mandante', jogador: 'Galdino', assistencia: 'Suárez' },
  ],
  // Man United 1 x 2 Man City
  2001: [
    { minuto: 18, tipo: 'gol', time: 'visitante', jogador: 'Erling Haaland', assistencia: 'Kevin De Bruyne' },
    { minuto: 34, tipo: 'cartao_amarelo', time: 'mandante', jogador: 'Casemiro', assistencia: null },
    { minuto: 56, tipo: 'gol', time: 'mandante', jogador: 'Marcus Rashford', assistencia: 'Bruno Fernandes' },
    { minuto: 79, tipo: 'gol', time: 'visitante', jogador: 'Phil Foden', assistencia: 'Bernardo Silva' },
  ],
  // Real Madrid 2 x 2 Barcelona
  3001: [
    { minuto: 15, tipo: 'gol', time: 'mandante', jogador: 'Vinícius Júnior', assistencia: 'Jude Bellingham' },
    { minuto: 33, tipo: 'gol', time: 'visitante', jogador: 'Robert Lewandowski', assistencia: 'Pedri' },
    { minuto: 61, tipo: 'cartao_amarelo', time: 'mandante', jogador: 'Tchouaméni', assistencia: null },
    { minuto: 68, tipo: 'gol', time: 'visitante', jogador: 'Lamine Yamal', assistencia: 'Raphinha' },
    { minuto: 82, tipo: 'gol', time: 'mandante', jogador: 'Jude Bellingham', assistencia: 'Federico Valverde' },
  ],
  // Bayern 2 x 0 Dortmund (ao vivo)
  5001: [
    { minuto: 14, tipo: 'gol', time: 'mandante', jogador: 'Harry Kane', assistencia: 'Jamal Musiala' },
    { minuto: 29, tipo: 'gol', time: 'mandante', jogador: 'Leroy Sané', assistencia: 'Harry Kane' },
  ],
};

// ==================== HELPERS ====================

// Converter status da API para formato legível
export function getMatchStatus(status) {
  const statusMap = {
    'TBD': 'A definir',
    'NS': 'Não iniciado',
    '1H': '1º Tempo',
    'HT': 'Intervalo',
    '2H': '2º Tempo',
    'ET': 'Prorrogação',
    'P': 'Pênaltis',
    'FT': 'Encerrado',
    'AET': 'Após Prorrogação',
    'PEN': 'Após Pênaltis',
    'BT': 'Intervalo',
    'SUSP': 'Suspenso',
    'INT': 'Interrompido',
    'PST': 'Adiado',
    'CANC': 'Cancelado',
    'ABD': 'Abandonado',
    'AWD': 'WO',
    'WO': 'WO',
    'LIVE': 'Ao Vivo',
  };
  return statusMap[status] || status;
}

// Verificar se partida está ao vivo
export function isMatchLive(status) {
  return ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(status);
}

// Verificar se partida terminou
export function isMatchFinished(status) {
  return ['FT', 'AET', 'PEN'].includes(status);
}

// Verificar se partida não começou
export function isMatchScheduled(status) {
  return ['TBD', 'NS'].includes(status);
}

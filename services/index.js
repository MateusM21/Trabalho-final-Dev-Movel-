/**
 * index.js
 * 
 * Exportação centralizada dos serviços do aplicativo.
 * Permite importar funções da API e dados mock de um único lugar.
 * 
 * @example
 * import { getLiveMatches, TIMES_MOCK } from '../services';
 */

// Funções da API
export {
  // Cache
  clearAllCache,
  getCacheStats,
  
  // Competições
  getCompetitions,
  getCompetition,
  getStandings,
  
  // Partidas
  getLiveMatches,
  getUpcomingMatches,
  getFixturesByDate,
  getFixtures,
  getMatches,
  getNextFixtures,
  getFinishedMatches,
  getAllCompetitionMatches,
  getMatchDetails,
  getFixtureEvents,
  
  // Eventos e Estatísticas (LiveScore)
  getMatchEventsLiveScore,
  getMatchStatisticsLiveScore,
  getMatchEventsSportsDB,
  generateMockEventsFromScore,
  
  // Times
  searchTeams,
  getAllTeams,
  getTeamsByCompetition,
  getTeam,
  getTeamFixtures,
  getTeamLastFixtures,
  getSquad,
  
  // Jogadores
  fetchPlayerDetails,
  getTopScorers,
  getAllTopScorers,
  getLegendsScorers,
  
  // Formatação de datas
  formatToBrasilia,
  formatTimeBrasilia,
  formatDateBrasilia,
  formatFullDateBrasilia,
  
  // Status de partidas
  isMatchLive,
  isMatchFinished,
  isMatchScheduled,
  getMatchStatus,
  
  // Constantes
  COMPETITION_CODES,
} from './api';

// Dados Mock
export {
  TIMES_MOCK,
  CAMPEONATOS_MOCK,
  ATLETAS_MOCK,
  EVENTOS_MOCK,
  ARTILHEIROS_LENDARIOS,
  CAMPEONATOS_ESTRUTURADOS,
} from './mockData';

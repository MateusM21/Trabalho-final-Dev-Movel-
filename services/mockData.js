/**
 * mockData.js
 * 
 * Dados mock e constantes do aplicativo.
 * Inclui dados de fallback quando a API não está disponível
 * e constantes como lendas do futebol.
 * 
 * Categorias:
 * - TIMES_MOCK: Times populares para exibição inicial
 * - CAMPEONATOS_MOCK: Campeonatos para busca
 * - ATLETAS_MOCK: Jogadores para tela de detalhes
 * - EVENTOS_MOCK: Eventos de partida de exemplo
 * - ARTILHEIROS_LENDARIOS: Lendas do futebol com estatísticas
 */

/**
 * Times populares para exibição inicial e fallback
 * Inclui times da Premier League, Brasileirão, La Liga, etc.
 */
export const TIMES_MOCK = [
  // Premier League
  { team: { id: 64, name: 'Liverpool FC', code: 'LIV', country: 'England', logo: 'https://crests.football-data.org/64.png', founded: 1892 } },
  { team: { id: 65, name: 'Manchester City FC', code: 'MCI', country: 'England', logo: 'https://crests.football-data.org/65.png', founded: 1880 } },
  { team: { id: 57, name: 'Arsenal FC', code: 'ARS', country: 'England', logo: 'https://crests.football-data.org/57.png', founded: 1886 } },
  { team: { id: 61, name: 'Chelsea FC', code: 'CHE', country: 'England', logo: 'https://crests.football-data.org/61.png', founded: 1905 } },
  { team: { id: 66, name: 'Manchester United FC', code: 'MUN', country: 'England', logo: 'https://crests.football-data.org/66.png', founded: 1878 } },
  { team: { id: 73, name: 'Tottenham Hotspur FC', code: 'TOT', country: 'England', logo: 'https://crests.football-data.org/73.png', founded: 1882 } },
  // Brasileirão
  { team: { id: 1783, name: 'CR Flamengo', code: 'FLA', country: 'Brazil', logo: 'https://crests.football-data.org/1783.png', founded: 1895 } },
  { team: { id: 1765, name: 'SE Palmeiras', code: 'PAL', country: 'Brazil', logo: 'https://crests.football-data.org/1765.png', founded: 1914 } },
  { team: { id: 1767, name: 'SC Corinthians Paulista', code: 'COR', country: 'Brazil', logo: 'https://crests.football-data.org/1767.png', founded: 1910 } },
  { team: { id: 1766, name: 'São Paulo FC', code: 'SAO', country: 'Brazil', logo: 'https://crests.football-data.org/1766.png', founded: 1930 } },
  { team: { id: 1776, name: 'Grêmio FBPA', code: 'GRE', country: 'Brazil', logo: 'https://crests.football-data.org/1776.png', founded: 1903 } },
  { team: { id: 1769, name: 'SC Internacional', code: 'INT', country: 'Brazil', logo: 'https://crests.football-data.org/1769.png', founded: 1909 } },
  { team: { id: 1772, name: 'CA Mineiro', code: 'CAM', country: 'Brazil', logo: 'https://crests.football-data.org/1772.png', founded: 1908 } },
  { team: { id: 1771, name: 'Botafogo FR', code: 'BOT', country: 'Brazil', logo: 'https://crests.football-data.org/1771.png', founded: 1904 } },
  { team: { id: 1770, name: 'Fluminense FC', code: 'FLU', country: 'Brazil', logo: 'https://crests.football-data.org/1770.png', founded: 1902 } },
  // La Liga
  { team: { id: 86, name: 'Real Madrid CF', code: 'RMA', country: 'Spain', logo: 'https://crests.football-data.org/86.png', founded: 1902 } },
  { team: { id: 81, name: 'FC Barcelona', code: 'BAR', country: 'Spain', logo: 'https://crests.football-data.org/81.png', founded: 1899 } },
  { team: { id: 78, name: 'Club Atlético de Madrid', code: 'ATM', country: 'Spain', logo: 'https://crests.football-data.org/78.png', founded: 1903 } },
  // Bundesliga
  { team: { id: 5, name: 'FC Bayern München', code: 'FCB', country: 'Germany', logo: 'https://crests.football-data.org/5.png', founded: 1900 } },
  { team: { id: 4, name: 'Borussia Dortmund', code: 'BVB', country: 'Germany', logo: 'https://crests.football-data.org/4.png', founded: 1909 } },
  // Serie A
  { team: { id: 109, name: 'Juventus FC', code: 'JUV', country: 'Italy', logo: 'https://crests.football-data.org/109.png', founded: 1897 } },
  { team: { id: 108, name: 'FC Internazionale Milano', code: 'INT', country: 'Italy', logo: 'https://crests.football-data.org/108.png', founded: 1908 } },
  { team: { id: 98, name: 'AC Milan', code: 'MIL', country: 'Italy', logo: 'https://crests.football-data.org/98.png', founded: 1899 } },
  // Ligue 1
  { team: { id: 524, name: 'Paris Saint-Germain FC', code: 'PSG', country: 'France', logo: 'https://crests.football-data.org/524.png', founded: 1970 } },
];

/**
 * Campeonatos disponíveis no aplicativo
 */
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

/**
 * Atletas de exemplo para fallback
 */
export const ATLETAS_MOCK = [
  { player: { id: 1, name: 'Erling Haaland', nationality: 'Norway', age: 24, position: 'Attacker', number: 9 } },
  { player: { id: 2, name: 'Mohamed Salah', nationality: 'Egypt', age: 32, position: 'Attacker', number: 11 } },
  { player: { id: 3, name: 'Kevin De Bruyne', nationality: 'Belgium', age: 33, position: 'Midfielder', number: 17 } },
  { player: { id: 4, name: 'Virgil van Dijk', nationality: 'Netherlands', age: 33, position: 'Defender', number: 4 } },
  { player: { id: 5, name: 'Gabriel Jesus', nationality: 'Brazil', age: 27, position: 'Attacker', number: 9 } },
];

/**
 * Eventos de partida de exemplo
 */
export const EVENTOS_MOCK = [
  { time: { elapsed: 23 }, team: { id: 1 }, player: { name: 'Raphael Veiga' }, assist: { name: 'Dudu' }, type: 'Goal', detail: 'Normal Goal' },
  { time: { elapsed: 45 }, team: { id: 2 }, player: { name: 'Gabriel Barbosa' }, assist: { name: 'Arrascaeta' }, type: 'Goal', detail: 'Normal Goal' },
  { time: { elapsed: 67 }, team: { id: 1 }, player: { name: 'Endrick' }, assist: { name: null }, type: 'Goal', detail: 'Normal Goal' },
  { time: { elapsed: 78 }, team: { id: 2 }, player: { name: 'Pedro' }, assist: { name: 'Everton Ribeiro' }, type: 'Goal', detail: 'Penalty' },
];

/**
 * Maiores artilheiros em atividade (dados de 2025)
 * Fontes: Transfermarkt, Wikipedia, sites oficiais
 */
export const ARTILHEIROS_LENDARIOS = [
  {
    player: { 
      id: 101, name: 'Cristiano Ronaldo', firstName: 'Cristiano', lastName: 'Ronaldo',
      nationality: 'Portugal', age: 39, dateOfBirth: '1985-02-05', position: 'Attacker', 
      shirtNumber: 7, height: '1.87 m', photo: 'https://media.api-sports.io/football/players/874.png'
    },
    team: { id: 0, name: 'Al-Nassr FC', crest: 'https://media.api-sports.io/football/teams/2939.png', country: 'Saudi Arabia', isInApp: false },
    goals: 954, assists: 263, playedMatches: 1300, titles: 35, goldenBoots: 4, ballonDor: 5,
    formerTeams: 'Sporting CP, Manchester United, Real Madrid, Juventus',
    mainTitles: '5x Champions League, 3x Premier League, 2x La Liga, 2x Serie A, Euro 2016, Nations League 2019',
    statistics: [{ goals: { total: 954 }, assists: 263, penalties: 162, playedMatches: 1300, team: { name: 'Al-Nassr FC' } }]
  },
  {
    player: { 
      id: 102, name: 'Lionel Messi', firstName: 'Lionel', lastName: 'Messi',
      nationality: 'Argentina', age: 37, dateOfBirth: '1987-06-24', position: 'Attacker', 
      shirtNumber: 10, height: '1.70 m', photo: 'https://media.api-sports.io/football/players/154.png'
    },
    team: { id: 0, name: 'Inter Miami CF', crest: 'https://media.api-sports.io/football/teams/9568.png', country: 'USA', isInApp: false },
    goals: 896, assists: 383, playedMatches: 1137, titles: 45, goldenBoots: 6, ballonDor: 8,
    formerTeams: 'Barcelona, Paris Saint-Germain',
    mainTitles: '4x Champions League, 10x La Liga, Copa América 2021, Copa do Mundo 2022',
    statistics: [{ goals: { total: 896 }, assists: 383, penalties: 114, playedMatches: 1137, team: { name: 'Inter Miami CF' } }]
  },
  {
    player: { 
      id: 103, name: 'Robert Lewandowski', firstName: 'Robert', lastName: 'Lewandowski',
      nationality: 'Poland', age: 36, dateOfBirth: '1988-08-21', position: 'Attacker', 
      shirtNumber: 9, height: '1.85 m', photo: 'https://media.api-sports.io/football/players/521.png'
    },
    team: { id: 81, name: 'FC Barcelona', crest: 'https://crests.football-data.org/81.png', country: 'Spain', isInApp: false },
    goals: 672, assists: 175, playedMatches: 958, titles: 24, goldenBoots: 1, ballonDor: 0,
    formerTeams: 'Znicz Pruszków, Lech Poznań, Borussia Dortmund, Bayern München',
    mainTitles: '1x Champions League, 10x Bundesliga, 1x La Liga',
    statistics: [{ goals: { total: 672 }, assists: 175, penalties: 92, playedMatches: 958, team: { name: 'FC Barcelona' } }]
  },
  {
    player: { 
      id: 104, name: 'Neymar Jr', firstName: 'Neymar', lastName: 'da Silva Santos Jr',
      nationality: 'Brazil', age: 32, dateOfBirth: '1992-02-05', position: 'Attacker', 
      shirtNumber: 10, height: '1.75 m', photo: 'https://media.api-sports.io/football/players/276.png'
    },
    team: { id: 1777, name: 'Santos FC', crest: 'https://logodetimes.com/times/santos/logo-santos-256.png', country: 'Brazil', isInApp: false },
    goals: 439, assists: 286, playedMatches: 744, titles: 28, goldenBoots: 0, ballonDor: 0,
    formerTeams: 'Santos, Barcelona, Paris Saint-Germain, Al-Hilal',
    mainTitles: '1x Champions League, 2x La Liga, 5x Ligue 1, 3x Brasileirão, Copa Libertadores 2011, Olimpíadas 2016',
    statistics: [{ goals: { total: 439 }, assists: 286, penalties: 75, playedMatches: 744, team: { name: 'Santos FC' } }]
  },
  {
    player: { 
      id: 105, name: 'Karim Benzema', firstName: 'Karim', lastName: 'Benzema',
      nationality: 'France', age: 37, dateOfBirth: '1987-12-19', position: 'Attacker', 
      shirtNumber: 9, height: '1.85 m', photo: 'https://media.api-sports.io/football/players/759.png'
    },
    team: { id: 0, name: 'Al-Ittihad Club', crest: 'https://api.sofascore.app/api/v1/team/34315/image', country: 'Saudi Arabia', isInApp: false },
    goals: 435, assists: 184, playedMatches: 875, titles: 26, goldenBoots: 0, ballonDor: 1,
    formerTeams: 'Lyon, Real Madrid',
    mainTitles: '5x Champions League, 4x La Liga, 1x Ligue 1, Ballon d\'Or 2022',
    statistics: [{ goals: { total: 435 }, assists: 184, penalties: 55, playedMatches: 875, team: { name: 'Al-Ittihad Club' } }]
  },
  {
    player: { 
      id: 106, name: 'Luis Suárez', firstName: 'Luis', lastName: 'Suárez',
      nationality: 'Uruguay', age: 37, dateOfBirth: '1987-01-24', position: 'Attacker', 
      shirtNumber: 9, height: '1.82 m', photo: 'https://media.api-sports.io/football/players/156.png'
    },
    team: { id: 0, name: 'Inter Miami CF', crest: 'https://media.api-sports.io/football/teams/9568.png', country: 'USA', isInApp: false },
    goals: 556, assists: 258, playedMatches: 890, titles: 22, goldenBoots: 2, ballonDor: 0,
    formerTeams: 'Nacional, Groningen, Ajax, Liverpool, Barcelona, Atlético Madrid',
    mainTitles: '1x Champions League, 4x La Liga, 1x Eredivisie, 2x Copa América',
    statistics: [{ goals: { total: 556 }, assists: 258, penalties: 60, playedMatches: 890, team: { name: 'Inter Miami CF' } }]
  },
  {
    player: { 
      id: 107, name: 'Hulk', firstName: 'Givanildo', lastName: 'Vieira de Sousa',
      nationality: 'Brazil', age: 38, dateOfBirth: '1986-07-25', position: 'Attacker', 
      shirtNumber: 7, height: '1.80 m', photo: 'https://media.api-sports.io/football/players/10253.png'
    },
    team: { id: 1772, name: 'CA Mineiro', crest: 'https://media.api-sports.io/football/teams/1062.png', country: 'Brazil', isInApp: false },
    goals: 451, assists: 142, playedMatches: 755, titles: 18, goldenBoots: 2, ballonDor: 0,
    formerTeams: 'Vitória, Consadole Sapporo, Kawasaki Frontale, Tokyo Verdy, Porto, Zenit, Shanghai SIPG',
    mainTitles: '3x Campeonato Português, 3x Liga Russa, 1x Brasileirão, 1x Copa do Brasil, 2x Supercopa do Brasil',
    statistics: [{ goals: { total: 451 }, assists: 142, penalties: 98, playedMatches: 755, team: { name: 'CA Mineiro', logo: 'https://media.api-sports.io/football/teams/1062.png' } }]
  },
  {
    player: { 
      id: 108, name: 'Harry Kane', firstName: 'Harry', lastName: 'Kane',
      nationality: 'England', age: 31, dateOfBirth: '1993-07-28', position: 'Attacker', 
      shirtNumber: 9, height: '1.88 m', photo: 'https://media.api-sports.io/football/players/184.png'
    },
    team: { id: 5, name: 'FC Bayern München', crest: 'https://crests.football-data.org/5.png', country: 'Germany', isInApp: false },
    goals: 382, assists: 115, playedMatches: 615, titles: 1, goldenBoots: 3, ballonDor: 0,
    formerTeams: 'Tottenham Hotspur, Leyton Orient (empréstimo), Millwall (empréstimo), Norwich (empréstimo), Leicester (empréstimo)',
    mainTitles: '1x Bundesliga, 3x Chuteira de Ouro Premier League',
    statistics: [{ goals: { total: 382 }, assists: 115, penalties: 80, playedMatches: 615, team: { name: 'FC Bayern München' } }]
  },
  {
    player: { 
      id: 109, name: 'Erling Haaland', firstName: 'Erling', lastName: 'Haaland',
      nationality: 'Norway', age: 24, dateOfBirth: '2000-07-21', position: 'Attacker', 
      shirtNumber: 9, height: '1.94 m', photo: 'https://media.api-sports.io/football/players/1100.png'
    },
    team: { id: 65, name: 'Manchester City FC', crest: 'https://crests.football-data.org/65.png', country: 'England', isInApp: false },
    goals: 285, assists: 58, playedMatches: 332, titles: 12, goldenBoots: 2, ballonDor: 0,
    formerTeams: 'Bryne, Molde, RB Salzburg, Borussia Dortmund',
    mainTitles: '1x Champions League, 2x Premier League, 1x Bundesliga, 1x Treble (2023)',
    statistics: [{ goals: { total: 285 }, assists: 58, penalties: 35, playedMatches: 332, team: { name: 'Manchester City FC' } }]
  },
  {
    player: { 
      id: 110, name: 'Kylian Mbappé', firstName: 'Kylian', lastName: 'Mbappé',
      nationality: 'France', age: 26, dateOfBirth: '1998-12-20', position: 'Attacker', 
      shirtNumber: 9, height: '1.78 m', photo: 'https://media.api-sports.io/football/players/278.png'
    },
    team: { id: 86, name: 'Real Madrid CF', crest: 'https://crests.football-data.org/86.png', country: 'Spain', isInApp: false },
    goals: 312, assists: 138, playedMatches: 442, titles: 16, goldenBoots: 4, ballonDor: 0,
    formerTeams: 'Monaco, Paris Saint-Germain',
    mainTitles: '1x Ligue 1 (Monaco), 6x Ligue 1 (PSG), Copa do Mundo 2018, Vice Copa 2022',
    statistics: [{ goals: { total: 312 }, assists: 138, penalties: 45, playedMatches: 442, team: { name: 'Real Madrid CF' } }]
  },
  {
    player: { 
      id: 111, name: 'Mohamed Salah', firstName: 'Mohamed', lastName: 'Salah',
      nationality: 'Egypt', age: 32, dateOfBirth: '1992-06-15', position: 'Attacker', 
      shirtNumber: 11, height: '1.75 m', photo: 'https://media.api-sports.io/football/players/306.png'
    },
    team: { id: 64, name: 'Liverpool FC', crest: 'https://crests.football-data.org/64.png', country: 'England', isInApp: false },
    goals: 323, assists: 163, playedMatches: 565, titles: 10, goldenBoots: 3, ballonDor: 0,
    formerTeams: 'El Mokawloon, Basel, Chelsea, Fiorentina (empréstimo), Roma',
    mainTitles: '1x Champions League, 1x Premier League, 1x FA Cup, 2x League Cup',
    statistics: [{ goals: { total: 323 }, assists: 163, penalties: 55, playedMatches: 565, team: { name: 'Liverpool FC' } }]
  },
  {
    player: { 
      id: 112, name: 'Edinson Cavani', firstName: 'Edinson', lastName: 'Cavani',
      nationality: 'Uruguay', age: 37, dateOfBirth: '1987-02-14', position: 'Attacker', 
      shirtNumber: 9, height: '1.84 m', photo: 'https://media.api-sports.io/football/players/138.png'
    },
    team: { id: 0, name: 'Boca Juniors', crest: 'https://tmssl.akamaized.net/images/wappen/head/189.png', country: 'Argentina', isInApp: false },
    goals: 432, assists: 98, playedMatches: 760, titles: 17, goldenBoots: 1, ballonDor: 0,
    formerTeams: 'Danubio, Palermo, Napoli, PSG, Manchester United, Valencia',
    mainTitles: '1x Serie A, 6x Ligue 1, Copa América 2011',
    statistics: [{ goals: { total: 432 }, assists: 98, penalties: 65, playedMatches: 760, team: { name: 'Boca Juniors' } }]
  },
];

/**
 * Estrutura de campeonatos organizados por região
 */
export const CAMPEONATOS_ESTRUTURADOS = {
  continentais: {
    europa: [
      { league: { id: 2001, name: 'UEFA Champions League', code: 'CL', logo: 'https://crests.football-data.org/CL.png' }, country: { name: 'Europa' } },
      { league: { id: 2146, name: 'UEFA Europa League', code: 'EL', logo: 'https://crests.football-data.org/EL.png' }, country: { name: 'Europa' } },
    ],
    sulamericana: [
      { league: { id: 2152, name: 'Copa Libertadores', code: 'CLI', logo: 'https://crests.football-data.org/CLI.png' }, country: { name: 'América do Sul' } },
      { league: { id: 2153, name: 'Copa Sul-Americana', code: 'CSA', logo: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Copa_Sudamericana_logo.svg' }, country: { name: 'América do Sul' } },
    ],
  },
  nacionais: {
    brasil: {
      nome: 'Brasil',
      flag: 'https://media.api-sports.io/flags/br.svg',
      divisoes: [
        { league: { id: 2013, name: 'Campeonato Brasileiro Série A', code: 'BSA', logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/85.png' }, country: { name: 'Brasil' } },
      ],
    },
    inglaterra: {
      nome: 'Inglaterra',
      flag: 'https://media.api-sports.io/flags/gb.svg',
      divisoes: [
        { league: { id: 2021, name: 'Premier League', code: 'PL', logo: 'https://crests.football-data.org/PL.png' }, country: { name: 'Inglaterra' } },
        { league: { id: 2016, name: 'Championship', code: 'ELC', logo: 'https://crests.football-data.org/ELC.png' }, country: { name: 'Inglaterra' } },
      ],
    },
    espanha: {
      nome: 'Espanha',
      flag: 'https://media.api-sports.io/flags/es.svg',
      divisoes: [
        { league: { id: 2014, name: 'La Liga', code: 'PD', logo: 'https://crests.football-data.org/PD.png' }, country: { name: 'Espanha' } },
      ],
    },
    italia: {
      nome: 'Itália',
      flag: 'https://media.api-sports.io/flags/it.svg',
      divisoes: [
        { league: { id: 2019, name: 'Serie A', code: 'SA', logo: 'https://crests.football-data.org/SA.png' }, country: { name: 'Itália' } },
      ],
    },
    alemanha: {
      nome: 'Alemanha',
      flag: 'https://media.api-sports.io/flags/de.svg',
      divisoes: [
        { league: { id: 2002, name: 'Bundesliga', code: 'BL1', logo: 'https://crests.football-data.org/BL1.png' }, country: { name: 'Alemanha' } },
      ],
    },
    franca: {
      nome: 'França',
      flag: 'https://media.api-sports.io/flags/fr.svg',
      divisoes: [
        { league: { id: 2015, name: 'Ligue 1', code: 'FL1', logo: 'https://crests.football-data.org/FL1.png' }, country: { name: 'França' } },
      ],
    },
    portugal: {
      nome: 'Portugal',
      flag: 'https://media.api-sports.io/flags/pt.svg',
      divisoes: [
        { league: { id: 2017, name: 'Primeira Liga', code: 'PPL', logo: 'https://crests.football-data.org/PPL.png' }, country: { name: 'Portugal' } },
      ],
    },
    holanda: {
      nome: 'Holanda',
      flag: 'https://media.api-sports.io/flags/nl.svg',
      divisoes: [
        { league: { id: 2003, name: 'Eredivisie', code: 'DED', logo: 'https://crests.football-data.org/DED.png' }, country: { name: 'Holanda' } },
      ],
    },
  },
};

export default {
  TIMES_MOCK,
  CAMPEONATOS_MOCK,
  ATLETAS_MOCK,
  EVENTOS_MOCK,
  ARTILHEIROS_LENDARIOS,
  CAMPEONATOS_ESTRUTURADOS,
};

/**
 * DetalhePartidaScreen.jsx
 * 
 * Tela de detalhes de uma partida específica.
 * Exibe placar, eventos (gols, cartões) e estatísticas.
 * 
 * Funcionalidades:
 * - Placar atualizado (ao vivo ou final)
 * - Lista de eventos da partida (gols, cartões, substituições)
 * - Estatísticas comparativas (posse, chutes, escanteios, faltas)
 * - Badge "AO VIVO" para partidas em andamento
 * 
 * APIs utilizadas:
 * - LiveScore API: Eventos em tempo real e estatísticas
 * - TheSportsDB: Fallback para eventos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { isMatchLive, isMatchFinished, isMatchScheduled, getMatchEventsSportsDB, getMatchEventsLiveScore, getMatchStatisticsLiveScore, generateMockEventsFromScore, formatTimeBrasilia, formatToBrasilia } from '../../services/api';
import { EVENTOS_MOCK } from '../../services/mockData';

export default function DetalhePartidaScreen({ route, navigation }) {
  const { partida } = route.params;
  const isLive = isMatchLive(partida.fixture.status.short);
  const isFinished = isMatchFinished(partida.fixture.status.short);
  const isScheduled = isMatchScheduled(partida.fixture.status.short);

  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isLive || isFinished) {
      loadEventos();
      loadEstatisticas();
    }
  }, []);

  const loadEventos = async () => {
    setLoadingEventos(true);
    try {
      const homeTeamId = partida.teams.home.id;
      const awayTeamId = partida.teams.away.id;
      const matchDate = partida.fixture.date;
      const leagueCode = partida.league.code;
      const homeTeam = partida.teams.home.name;
      const awayTeam = partida.teams.away.name;
      
      console.log('Buscando eventos para:', homeTeam, 'vs', awayTeam);
      
      // 1. Tentar LiveScore API (RapidAPI) - Gratuito
      const liveScoreData = await getMatchEventsLiveScore(homeTeam, awayTeam, matchDate);
      
      if (liveScoreData && liveScoreData.events && liveScoreData.events.length > 0) {
        const eventosMapeados = liveScoreData.events.map(e => ({
          minuto: e.time.elapsed + (e.time.extra ? `+${e.time.extra}` : ''),
          tipo: mapEventType(e.type, e.detail),
          time: e.team.id === 'home' ? 'mandante' : 'visitante',
          jogador: e.player?.name || 'Jogador',
          assistencia: e.assist?.name || null,
          detalhe: e.detail,
        }));
        setEventos(eventosMapeados);
        console.log('Eventos encontrados LiveScore:', eventosMapeados.length);
        return;
      }
      
      // 2. Tentar TheSportsDB como fallback
      const sportsDBData = await getMatchEventsSportsDB(homeTeam, awayTeam, matchDate);
      
      if (sportsDBData && sportsDBData.events && sportsDBData.events.length > 0) {
        const eventosMapeados = sportsDBData.events.map(e => ({
          minuto: e.time.elapsed || '?',
          tipo: mapEventType(e.type, e.detail),
          time: e.isHome ? 'mandante' : 'visitante',
          jogador: e.player?.name || 'Gol',
          assistencia: e.assist?.name || null,
          detalhe: e.detail,
        }));
        setEventos(eventosMapeados);
        console.log('Eventos encontrados TheSportsDB:', eventosMapeados.length);
        return;
      }
      
      // 4. Gerar eventos simulados baseados no placar (se o jogo terminou com gols)
      const homeGoals = partida.goals?.home || 0;
      const awayGoals = partida.goals?.away || 0;
      
      if (isFinished && (homeGoals > 0 || awayGoals > 0)) {
        const eventosSimulados = generateMockEventsFromScore(homeTeam, awayTeam, homeGoals, awayGoals);
        setEventos(eventosSimulados);
        console.log('Eventos simulados gerados:', eventosSimulados.length);
        return;
      }
      
      // 5. Usar eventos mockados como fallback final
      const eventosMock = EVENTOS_MOCK[partida.fixture.id] || [];
      setEventos(eventosMock);
      console.log('Usando eventos mock:', eventosMock.length);
      
    } catch (error) {
      console.log('Erro ao carregar eventos:', error);
      // Em caso de erro, tentar gerar eventos simulados baseados no placar
      const homeGoals = partida.goals?.home || 0;
      const awayGoals = partida.goals?.away || 0;
      const homeTeam = partida.teams.home.name;
      const awayTeam = partida.teams.away.name;
      
      if (isFinished && (homeGoals > 0 || awayGoals > 0)) {
        const eventosSimulados = generateMockEventsFromScore(homeTeam, awayTeam, homeGoals, awayGoals);
        setEventos(eventosSimulados);
      } else {
        const eventosMock = EVENTOS_MOCK[partida.fixture.id] || [];
        setEventos(eventosMock);
      }
    } finally {
      setLoadingEventos(false);
    }
  };

  // Carregar estatísticas da partida
  const loadEstatisticas = async () => {
    setLoadingStats(true);
    try {
      const homeTeam = partida.teams.home.name;
      const awayTeam = partida.teams.away.name;
      const matchDate = partida.fixture.date;
      
      console.log('Buscando estatísticas para:', homeTeam, 'vs', awayTeam);
      
      const stats = await getMatchStatisticsLiveScore(homeTeam, awayTeam, matchDate);
      
      if (stats && stats.length > 0) {
        setEstatisticas(stats);
        console.log('Estatísticas encontradas:', stats.length);
      } else {
        console.log('Estatísticas não disponíveis');
        setEstatisticas(null);
      }
    } catch (error) {
      console.log('Erro ao carregar estatísticas:', error);
      setEstatisticas(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const mapEventType = (type, detail) => {
    if (type === 'Goal') return 'gol';
    if (type === 'Card' && detail === 'Yellow Card') return 'cartao_amarelo';
    if (type === 'Card' && detail === 'Red Card') return 'cartao_vermelho';
    if (type === 'subst') return 'substituicao';
    return type.toLowerCase();
  };

  const getEventoIcon = (tipo) => {
    switch (tipo) {
      case 'gol':
        return <Ionicons name="football" size={18} color={theme.colors.primary} />;
      case 'cartao_amarelo':
        return <View style={[styles.cartao, styles.cartaoAmarelo]} />;
      case 'cartao_vermelho':
        return <View style={[styles.cartao, styles.cartaoVermelho]} />;
      case 'substituicao':
        return <Ionicons name="swap-horizontal" size={18} color={theme.colors.info} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      {/* Header com placar */}
      <View style={styles.header}>
        <View style={styles.campeonatoInfo}>
          <Text style={styles.campeonatoNome}>{partida.league.name}</Text>
          <Text style={styles.rodadaText}>{partida.league.round}</Text>
        </View>

        {isLive && (
          <View style={styles.liveContainer}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>AO VIVO</Text>
            </View>
            {partida.fixture.status.elapsed && (
              <Text style={styles.tempoJogo}>{partida.fixture.status.elapsed}'</Text>
            )}
          </View>
        )}

        <View style={styles.placarContainer}>
          {/* Time Mandante */}
          <TouchableOpacity 
            style={styles.timeContainer}
            onPress={() => navigation.navigate('DetalheTime', { 
              time: { team: partida.teams.home } 
            })}
          >
            <View style={styles.escudoGrande}>
              {partida.teams.home.logo ? (
                <Image source={{ uri: partida.teams.home.logo }} style={styles.escudo} />
              ) : (
                <Ionicons name="shield" size={40} color={theme.colors.textSecondary} />
              )}
            </View>
            <Text style={styles.timeNome}>{partida.teams.home.name}</Text>
          </TouchableOpacity>

          {/* Placar Central */}
          <View style={styles.placarCentral}>
            {isScheduled ? (
              <>
                <Text style={styles.placarHora}>
                  {formatTimeBrasilia(partida.fixture.date)}
                </Text>
                <Text style={styles.placarData}>
                  {formatToBrasilia(partida.fixture.date, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </>
            ) : (
              <View style={styles.placarNumeros}>
                <Text style={[styles.placarNumero, isLive && styles.placarLive]}>
                  {partida.goals.home}
                </Text>
                <Text style={styles.placarSeparador}>-</Text>
                <Text style={[styles.placarNumero, isLive && styles.placarLive]}>
                  {partida.goals.away}
                </Text>
              </View>
            )}
          </View>

          {/* Time Visitante */}
          <TouchableOpacity 
            style={styles.timeContainer}
            onPress={() => navigation.navigate('DetalheTime', { 
              time: { team: partida.teams.away } 
            })}
          >
            <View style={styles.escudoGrande}>
              {partida.teams.away.logo ? (
                <Image source={{ uri: partida.teams.away.logo }} style={styles.escudo} />
              ) : (
                <Ionicons name="shield" size={40} color={theme.colors.textSecondary} />
              )}
            </View>
            <Text style={styles.timeNome}>{partida.teams.away.name}</Text>
          </TouchableOpacity>
        </View>

        {/* Status/Info */}
        {isFinished && <Text style={styles.finalizadoText}>Partida Encerrada</Text>}
      </View>

      {/* Estádio */}
      {partida.fixture.venue?.name && (
        <View style={styles.infoCard}>
          <Ionicons name="location" size={20} color={theme.colors.primary} />
          <View style={styles.infoTexto}>
            <Text style={styles.infoLabel}>Estádio</Text>
            <Text style={styles.infoValor}>{partida.fixture.venue.name}</Text>
          </View>
        </View>
      )}

      {/* Timeline de Eventos */}
      {(isLive || isFinished) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eventos da Partida</Text>
          {/* Cabeçalho com times */}
          <View style={styles.eventosHeader}>
            <View style={styles.eventosTimeHeader}>
              {partida.teams.home.logo && (
                <Image source={{ uri: partida.teams.home.logo }} style={styles.eventosTimeLogo} />
              )}
              <Text style={styles.eventosTimeNome} numberOfLines={1}>
                {partida.teams.home.name}
              </Text>
            </View>
            <View style={styles.eventosTimeHeader}>
              <Text style={styles.eventosTimeNome} numberOfLines={1}>
                {partida.teams.away.name}
              </Text>
              {partida.teams.away.logo && (
                <Image source={{ uri: partida.teams.away.logo }} style={styles.eventosTimeLogo} />
              )}
            </View>
          </View>
          
          {loadingEventos ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Carregando eventos...</Text>
            </View>
          ) : eventos.length > 0 ? (
            <View style={styles.timeline}>
              {eventos.map((evento, index) => (
                <View key={index} style={styles.eventoRow}>
                  {/* Coluna Mandante */}
                  <View style={styles.eventoColuna}>
                    {evento.time === 'mandante' && (
                      <View style={styles.eventoConteudo}>
                        <View style={styles.eventoJogadorContainer}>
                          {evento.jogador && evento.jogador !== 'Gol' ? (
                            <>
                              <Text style={styles.eventoJogador}>{evento.jogador}</Text>
                              {evento.assistencia && (
                                <Text style={styles.eventoAssistencia}>Assist: {evento.assistencia}</Text>
                              )}
                            </>
                          ) : (
                            <Text style={styles.eventoJogador}>Gol</Text>
                          )}
                        </View>
                        {getEventoIcon(evento.tipo)}
                      </View>
                    )}
                  </View>
                  
                  {/* Coluna Central - Minuto */}
                  <View style={styles.eventoCentro}>
                    <Text style={styles.eventoMinuto}>
                      {evento.minuto !== '?' ? `${evento.minuto}'` : '⚽'}
                    </Text>
                  </View>
                  
                  {/* Coluna Visitante */}
                  <View style={styles.eventoColuna}>
                    {evento.time === 'visitante' && (
                      <View style={[styles.eventoConteudo, styles.eventoConteudoVisitante]}>
                        {getEventoIcon(evento.tipo)}
                        <View style={styles.eventoJogadorContainer}>
                          {evento.jogador && evento.jogador !== 'Gol' ? (
                            <>
                              <Text style={styles.eventoJogador}>{evento.jogador}</Text>
                              {evento.assistencia && (
                                <Text style={styles.eventoAssistencia}>Assist: {evento.assistencia}</Text>
                              )}
                            </>
                          ) : (
                            <Text style={styles.eventoJogador}>Gol</Text>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noEventosContainer}>
              <Ionicons name="information-circle-outline" size={40} color={theme.colors.textMuted} />
              <Text style={styles.noEventosTitle}>Eventos não disponíveis</Text>
              <Text style={styles.noEventosText}>
                Não foi possível carregar os eventos ao vivo desta partida.
              </Text>
              {(isLive || isFinished) && (partida.goals?.home > 0 || partida.goals?.away > 0) && (
                <View style={styles.placarResumoContainer}>
                  <Text style={styles.placarResumoTitulo}>Placar atual:</Text>
                  <Text style={styles.placarResumo}>
                    {partida.teams.home.name} {partida.goals?.home || 0} x {partida.goals?.away || 0} {partida.teams.away.name}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Estatísticas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>
        <View style={styles.statsContainer}>
          {loadingStats ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 20 }} />
          ) : estatisticas && estatisticas.length > 0 ? (
            estatisticas.map((stat, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.statValue}>{stat.mandante}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.visitante}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noStatsContainer}>
              <Ionicons name="stats-chart-outline" size={32} color={theme.colors.textMuted} />
              <Text style={styles.noStatsText}>Estatísticas não disponíveis</Text>
            </View>
          )}
        </View>
      </View>

      {/* Espaço inferior */}
      <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  campeonatoInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  campeonatoNome: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  rodadaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  liveContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.live + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.live,
    marginRight: theme.spacing.xs,
  },
  liveText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.live,
  },
  tempoJogo: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.live,
    marginTop: theme.spacing.xs,
  },
  placarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  escudoGrande: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  escudo: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
  timeNome: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  placarCentral: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  placarNumeros: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placarNumero: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  placarLive: {
    color: theme.colors.live,
  },
  placarSeparador: {
    fontSize: 36,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  placarHora: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  placarData: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  finalizadoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  infoTexto: {
    marginLeft: theme.spacing.md,
  },
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  infoValor: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  section: {
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  timeline: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  eventosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xs,
  },
  eventosTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.xs,
  },
  eventosTimeLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  eventosTimeNome: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  eventoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  eventoColuna: {
    flex: 1,
    alignItems: 'flex-end',
  },
  eventoCentro: {
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 50,
  },
  eventoConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  eventoConteudoVisitante: {
    flexDirection: 'row-reverse',
  },
  eventoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  eventoVisitante: {
    justifyContent: 'flex-end',
  },
  eventoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  eventoJogadorContainer: {
    flexDirection: 'column',
  },
  eventoJogador: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  eventoAssistencia: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  eventoMinuto: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.bold,
    marginHorizontal: theme.spacing.md,
    minWidth: 35,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  noEventosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  noEventosTitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  noEventosText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  placarResumoContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  placarResumoTitulo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  placarResumo: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  cartao: {
    width: 14,
    height: 18,
    borderRadius: 2,
  },
  cartaoAmarelo: {
    backgroundColor: '#FFD700',
  },
  cartaoVermelho: {
    backgroundColor: '#FF0000',
  },
  statsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    width: 50,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  noStatsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  noStatsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
});

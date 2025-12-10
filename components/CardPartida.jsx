/**
 * CardPartida.jsx
 * 
 * Componente reutilizável para exibir informações de uma partida de futebol.
 * Mostra times, placar, status e permite navegação para detalhes.
 * 
 * @component
 * @example
 * // Partida ao vivo
 * <CardPartida 
 *   partida={partidaData}
 *   onPress={() => navigation.navigate('DetalhePartida', { partida })}
 * />
 * 
 * // Variante compacta para listas
 * <CardPartida 
 *   partida={partidaData}
 *   variant="compact"
 * />
 * 
 * Props:
 * @param {object} partida - Objeto com dados da partida (fixture, teams, goals, league)
 * @param {function} onPress - Callback ao pressionar o card
 * @param {string} variant - Variante visual: 'default' | 'compact' (default: 'default')
 * @param {boolean} showLeague - Mostrar nome do campeonato (default: true)
 * @param {object} style - Estilos adicionais
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../utils/theme';

// Função auxiliar para verificar status da partida
const isMatchLive = (status) => {
  return ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'IN_PLAY', 'PAUSED'].includes(status);
};

const isMatchFinished = (status) => {
  return ['FT', 'AET', 'PEN', 'FINISHED'].includes(status);
};

// Formatar data/hora para horário de Brasília
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
};

export default function CardPartida({
  partida,
  onPress,
  variant = 'default',
  showLeague = true,
  style = {},
}) {
  if (!partida) return null;

  const { fixture, teams, goals, league } = partida;
  const isLive = isMatchLive(fixture?.status?.short);
  const isFinished = isMatchFinished(fixture?.status?.short);
  const isCompact = variant === 'compact';

  // Renderizar badge de status
  const renderStatusBadge = () => {
    if (isLive) {
      return (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            {fixture.status.elapsed ? `${fixture.status.elapsed}'` : 'AO VIVO'}
          </Text>
        </View>
      );
    }
    
    if (isFinished) {
      return (
        <Text style={styles.finishedText}>Encerrado</Text>
      );
    }
    
    return (
      <Text style={styles.scheduledText}>
        {formatTime(fixture.date)}
      </Text>
    );
  };

  // Renderizar logo do time
  const renderTeamLogo = (team, size = 40) => (
    <Image
      source={{ uri: team.logo || 'https://via.placeholder.com/40' }}
      style={[styles.teamLogo, { width: size, height: size }]}
      resizeMode="contain"
    />
  );

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCompact && styles.containerCompact,
        isLive && styles.containerLive,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Campeonato */}
      {showLeague && !isCompact && (
        <View style={styles.leagueContainer}>
          {league?.logo && (
            <Image
              source={{ uri: league.logo }}
              style={styles.leagueLogo}
              resizeMode="contain"
            />
          )}
          <Text style={styles.leagueName} numberOfLines={1}>
            {league?.name || 'Campeonato'}
          </Text>
          <Text style={styles.leagueDate}>{formatDate(fixture.date)}</Text>
        </View>
      )}

      {/* Conteúdo principal */}
      <View style={[styles.matchContent, isCompact && styles.matchContentCompact]}>
        {/* Time da casa */}
        <View style={[styles.teamContainer, isCompact && styles.teamContainerCompact]}>
          {renderTeamLogo(teams.home, isCompact ? 30 : 40)}
          <Text 
            style={[styles.teamName, isCompact && styles.teamNameCompact]} 
            numberOfLines={isCompact ? 1 : 2}
          >
            {teams.home.name}
          </Text>
        </View>

        {/* Placar/Status */}
        <View style={styles.scoreContainer}>
          {(isLive || isFinished) ? (
            <View style={styles.scoreWrapper}>
              <Text style={[styles.score, isLive && styles.scoreLive]}>
                {goals?.home ?? 0}
              </Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={[styles.score, isLive && styles.scoreLive]}>
                {goals?.away ?? 0}
              </Text>
            </View>
          ) : (
            <Text style={styles.vsText}>VS</Text>
          )}
          {renderStatusBadge()}
        </View>

        {/* Time visitante */}
        <View style={[styles.teamContainer, isCompact && styles.teamContainerCompact]}>
          {renderTeamLogo(teams.away, isCompact ? 30 : 40)}
          <Text 
            style={[styles.teamName, isCompact && styles.teamNameCompact]} 
            numberOfLines={isCompact ? 1 : 2}
          >
            {teams.away.name}
          </Text>
        </View>
      </View>

      {/* Ícone de navegação */}
      {onPress && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={theme.colors.textMuted} 
          style={styles.chevron}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  containerCompact: {
    padding: theme.spacing.sm,
    marginVertical: 2,
  },
  containerLive: {
    borderColor: theme.colors.live,
    borderWidth: 1.5,
  },
  leagueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  leagueLogo: {
    width: 20,
    height: 20,
    marginRight: theme.spacing.xs,
  },
  leagueName: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  leagueDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchContentCompact: {
    paddingVertical: theme.spacing.xs,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamContainerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    marginBottom: theme.spacing.xs,
  },
  teamName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium,
  },
  teamNameCompact: {
    fontSize: theme.fontSize.xs,
    marginLeft: theme.spacing.xs,
    textAlign: 'left',
  },
  scoreContainer: {
    alignItems: 'center',
    minWidth: 80,
    paddingHorizontal: theme.spacing.sm,
  },
  scoreWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    minWidth: 25,
    textAlign: 'center',
  },
  scoreLive: {
    color: theme.colors.live,
  },
  scoreSeparator: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textMuted,
    marginHorizontal: theme.spacing.xs,
  },
  vsText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textMuted,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.live + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.live,
    marginRight: theme.spacing.xs,
  },
  liveText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.live,
  },
  finishedText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  scheduledText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  chevron: {
    position: 'absolute',
    right: theme.spacing.sm,
    top: '50%',
  },
});

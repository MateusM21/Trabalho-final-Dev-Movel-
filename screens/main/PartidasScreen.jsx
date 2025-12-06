import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { 
  PARTIDAS_MOCK, 
  isMatchLive, 
  isMatchFinished, 
  isMatchScheduled 
} from '../../services/api';

function PartidaCard({ partida, onPress }) {
  const isLive = isMatchLive(partida.fixture.status.short);
  const isFinished = isMatchFinished(partida.fixture.status.short);
  const isScheduled = isMatchScheduled(partida.fixture.status.short);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Status */}
      <View style={styles.cardHeader}>
        <Text style={styles.campeonato}>{partida.league.name}</Text>
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
        )}
        {isFinished && (
          <Text style={styles.finalizadoText}>Finalizado</Text>
        )}
        {isScheduled && (
          <Text style={styles.agendadoText}>
            {new Date(partida.fixture.date).toLocaleDateString('pt-BR')}
          </Text>
        )}
      </View>

      {/* Times e Placar */}
      <View style={styles.matchContent}>
        {/* Time Mandante */}
        <View style={styles.teamContainer}>
          <View style={styles.escudoContainer}>
            {partida.teams.home.logo ? (
              <Image source={{ uri: partida.teams.home.logo }} style={styles.escudo} />
            ) : (
              <Ionicons name="shield" size={30} color={theme.colors.textSecondary} />
            )}
          </View>
          <Text style={styles.teamName} numberOfLines={2}>
            {partida.teams.home.name}
          </Text>
        </View>

        {/* Placar */}
        <View style={styles.scoreContainer}>
          {isScheduled ? (
            <View style={styles.scheduleTime}>
              <Text style={styles.scheduleHour}>
                {new Date(partida.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.rodadaText}>{partida.league.round}</Text>
            </View>
          ) : (
            <>
              <View style={styles.scoreBox}>
                <Text style={[
                  styles.score,
                  isLive && styles.scoreLive
                ]}>
                  {partida.goals.home}
                </Text>
              </View>
              <Text style={styles.scoreSeparator}>-</Text>
              <View style={styles.scoreBox}>
                <Text style={[
                  styles.score,
                  isLive && styles.scoreLive
                ]}>
                  {partida.goals.away}
                </Text>
              </View>
              {isLive && partida.fixture.status.elapsed && (
                <Text style={styles.tempoJogo}>{partida.fixture.status.elapsed}'</Text>
              )}
            </>
          )}
        </View>

        {/* Time Visitante */}
        <View style={styles.teamContainer}>
          <View style={styles.escudoContainer}>
            {partida.teams.away.logo ? (
              <Image source={{ uri: partida.teams.away.logo }} style={styles.escudo} />
            ) : (
              <Ionicons name="shield" size={30} color={theme.colors.textSecondary} />
            )}
          </View>
          <Text style={styles.teamName} numberOfLines={2}>
            {partida.teams.away.name}
          </Text>
        </View>
      </View>

      {/* Estádio */}
      {partida.fixture.venue?.name && (
        <View style={styles.cardFooter}>
          <Ionicons name="location-outline" size={14} color={theme.colors.textMuted} />
          <Text style={styles.estadioText}>{partida.fixture.venue.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function PartidasScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [partidas, setPartidas] = useState(PARTIDAS_MOCK);
  const [filtro, setFiltro] = useState('todas');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const filtros = [
    { key: 'todas', label: 'Todas' },
    { key: 'ao_vivo', label: 'Ao Vivo' },
    { key: 'agendado', label: 'Próximas' },
    { key: 'finalizado', label: 'Finalizadas' },
  ];

  const partidasFiltradas = filtro === 'todas' 
    ? partidas 
    : filtro === 'ao_vivo' 
      ? partidas.filter(p => isMatchLive(p.fixture.status.short))
      : filtro === 'agendado'
        ? partidas.filter(p => isMatchScheduled(p.fixture.status.short))
        : partidas.filter(p => isMatchFinished(p.fixture.status.short));

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        {filtros.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtroButton, filtro === f.key && styles.filtroButtonActive]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[styles.filtroText, filtro === f.key && styles.filtroTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={partidasFiltradas}
        keyExtractor={(item) => item.fixture.id.toString()}
        renderItem={({ item }) => (
          <PartidaCard
            partida={item}
            onPress={() => navigation.navigate('DetalhePartida', { partida: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="football-outline" size={60} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Nenhuma partida encontrada</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  filtroButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceLight,
  },
  filtroButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filtroText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  filtroTextActive: {
    color: theme.colors.white,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  campeonato: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.live + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
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
  finalizadoText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  agendadoText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.info,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  escudoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  escudo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  teamName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  scoreBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  scoreLive: {
    color: theme.colors.live,
  },
  scoreSeparator: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textSecondary,
    marginVertical: -theme.spacing.sm,
  },
  tempoJogo: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.live,
    marginTop: theme.spacing.xs,
  },
  scheduleTime: {
    alignItems: 'center',
  },
  scheduleHour: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  rodadaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  estadioText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
});

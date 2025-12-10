/**
 * PartidasScreen.jsx
 * 
 * Tela de listagem de todas as partidas.
 * Permite filtrar por campeonato e visualizar partidas ao vivo,
 * agendadas e finalizadas.
 * 
 * Funcionalidades:
 * - Lista de partidas organizadas por status (ao vivo, agendadas, finalizadas)
 * - Filtro por campeonato
 * - Pull-to-refresh para atualizar
 * - Navegação para detalhes da partida
 * 
 * APIs utilizadas:
 * - Football-Data.org: Lista de partidas
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { 
  getLiveMatches,
  getFixturesByDate,
  getUpcomingMatches,
  getFinishedMatches,
  isMatchLive, 
  isMatchFinished, 
  isMatchScheduled,
  formatTimeBrasilia,
  formatDateBrasilia,
} from '../../services/api';

// Lista de campeonatos para filtro
const CAMPEONATOS_FILTRO = [
  { code: 'todos', name: 'Todos', logo: null },
  { code: 'BSA', name: 'Brasileirão', logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/85.png' },
  { code: 'CL', name: 'Champions', logo: 'https://crests.football-data.org/CL.png' },
  { code: 'PL', name: 'Premier', logo: 'https://crests.football-data.org/PL.png' },
  { code: 'PD', name: 'La Liga', logo: 'https://crests.football-data.org/PD.png' },
  { code: 'SA', name: 'Serie A', logo: 'https://crests.football-data.org/SA.png' },
  { code: 'BL1', name: 'Bundesliga', logo: 'https://crests.football-data.org/BL1.png' },
  { code: 'FL1', name: 'Ligue 1', logo: 'https://crests.football-data.org/FL1.png' },
];

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
            {formatDateBrasilia(partida.fixture.date)}
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
                {formatTimeBrasilia(partida.fixture.date)}
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
  const [loading, setLoading] = useState(true);
  const [partidas, setPartidas] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [filtroCampeonato, setFiltroCampeonato] = useState('todos');
  const [modalCampeonato, setModalCampeonato] = useState(false);

  const loadPartidas = async () => {
    try {
      // Buscar partidas ao vivo
      const liveData = await getLiveMatches();
      const partidasAoVivo = liveData?.response || [];

      // Buscar partidas do dia
      const today = new Date().toISOString().split('T')[0];
      const todayData = await getFixturesByDate(today);
      const partidasHoje = todayData?.response || [];

      // Buscar partidas dos próximos dias (limite maior)
      const upcomingData = await getUpcomingMatches(50);
      const partidasProximas = upcomingData?.response || [];

      // Buscar partidas finalizadas dos últimos 7 dias (incluindo Champions League)
      const finishedPromises = ['BSA', 'PL', 'PD', 'SA', 'BL1', 'FL1', 'CL'].map(code => 
        getFinishedMatches(code, 10).catch(() => ({ response: [] }))
      );
      const finishedResults = await Promise.all(finishedPromises);
      const partidasFinalizadas = finishedResults.flatMap(r => r?.response || []);

      // Combinar, removendo duplicatas
      const todasPartidas = [...partidasAoVivo];
      
      partidasHoje.forEach(p => {
        if (!todasPartidas.find(t => t.fixture.id === p.fixture.id)) {
          todasPartidas.push(p);
        }
      });

      partidasProximas.forEach(p => {
        if (!todasPartidas.find(t => t.fixture.id === p.fixture.id)) {
          todasPartidas.push(p);
        }
      });

      partidasFinalizadas.forEach(p => {
        if (!todasPartidas.find(t => t.fixture.id === p.fixture.id)) {
          todasPartidas.push(p);
        }
      });

      // Ordenar: ao vivo primeiro, depois por data
      todasPartidas.sort((a, b) => {
        const aIsLive = isMatchLive(a.fixture?.status?.short);
        const bIsLive = isMatchLive(b.fixture?.status?.short);
        if (aIsLive && !bIsLive) return -1;
        if (!aIsLive && bIsLive) return 1;
        return new Date(a.fixture.date) - new Date(b.fixture.date);
      });

      setPartidas(todasPartidas);
    } catch (error) {
      console.error('Erro ao carregar partidas:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadPartidas();
      setLoading(false);
    };
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPartidas();
    setRefreshing(false);
  };

  const filtros = [
    { key: 'todas', label: 'Todas' },
    { key: 'ao_vivo', label: 'Ao Vivo' },
    { key: 'agendado', label: 'Próximas' },
    { key: 'finalizado', label: 'Finalizadas' },
  ];

  // Aplicar filtro de status
  const aplicarFiltroStatus = (lista) => {
    if (!lista || !Array.isArray(lista)) return [];
    if (filtro === 'todas') return lista;
    if (filtro === 'ao_vivo') return lista.filter(p => isMatchLive(p.fixture?.status?.short));
    if (filtro === 'agendado') return lista.filter(p => isMatchScheduled(p.fixture?.status?.short));
    if (filtro === 'finalizado') return lista.filter(p => isMatchFinished(p.fixture?.status?.short));
    return lista;
  };

  // Aplicar filtro de campeonato
  const aplicarFiltroCampeonato = (lista) => {
    if (!lista || !Array.isArray(lista)) return [];
    if (filtroCampeonato === 'todos') return lista;
    return lista.filter(p => p.league?.code === filtroCampeonato);
  };

  // Combinar os dois filtros
  const partidasFiltradas = aplicarFiltroCampeonato(aplicarFiltroStatus(partidas));

  // Obter o campeonato selecionado para exibir no botão
  const campeonatoSelecionado = CAMPEONATOS_FILTRO.find(c => c.code === filtroCampeonato) || CAMPEONATOS_FILTRO[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      {/* Filtro de Campeonato */}
      <View style={styles.campeonatoFilterContainer}>
        <TouchableOpacity 
          style={styles.campeonatoButton}
          onPress={() => setModalCampeonato(true)}
        >
          {campeonatoSelecionado.logo && (
            <Image source={{ uri: campeonatoSelecionado.logo }} style={styles.campeonatoLogo} />
          )}
          <Text style={styles.campeonatoButtonText}>
            {campeonatoSelecionado.name}
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filtros de Status */}
      <View style={styles.filtrosContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        </ScrollView>
      </View>

      {/* Modal de seleção de Campeonato */}
      <Modal
        visible={modalCampeonato}
        transparent
        animationType="slide"
        onRequestClose={() => setModalCampeonato(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalCampeonato(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Campeonato</Text>
            {CAMPEONATOS_FILTRO.map((camp) => (
              <TouchableOpacity
                key={camp.code}
                style={[
                  styles.modalOption,
                  filtroCampeonato === camp.code && styles.modalOptionActive
                ]}
                onPress={() => {
                  setFiltroCampeonato(camp.code);
                  setModalCampeonato(false);
                }}
              >
                {camp.logo ? (
                  <Image source={{ uri: camp.logo }} style={styles.modalOptionLogo} />
                ) : (
                  <Ionicons name="football-outline" size={24} color={theme.colors.textSecondary} />
                )}
                <Text style={[
                  styles.modalOptionText,
                  filtroCampeonato === camp.code && styles.modalOptionTextActive
                ]}>
                  {camp.name}
                </Text>
                {filtroCampeonato === camp.code && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando partidas...</Text>
        </View>
      ) : (
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
      )}
    </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  // Estilos do filtro de campeonato
  campeonatoFilterContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  campeonatoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  campeonatoLogo: {
    width: 24,
    height: 24,
    marginRight: theme.spacing.sm,
    resizeMode: 'contain',
  },
  campeonatoButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.xs,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  modalOptionActive: {
    backgroundColor: theme.colors.primaryMuted,
  },
  modalOptionLogo: {
    width: 28,
    height: 28,
    marginRight: theme.spacing.md,
    resizeMode: 'contain',
  },
  modalOptionText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  modalOptionTextActive: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
});

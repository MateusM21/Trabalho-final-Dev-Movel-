import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { 
  CAMPEONATOS_ESTRUTURADOS,
  TIMES_MOCK,
  isMatchLive,
  isMatchScheduled,
  getMatchStatus,
  getLiveMatches,
  getFixturesByDate,
  getUpcomingMatches,
  formatTimeBrasilia,
  getNextFixtures,
} from '../../services/api';

// Lista de ligas disponíveis para filtro
const LIGAS_DISPONIVEIS = [
  { code: 'todos', name: 'Todos os Jogos', logo: null },
  { code: 'BSA', name: 'Brasileirão', logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/85.png' },
  { code: 'CL', name: 'Champions League', logo: 'https://crests.football-data.org/CL.png' },
  { code: 'PL', name: 'Premier League', logo: 'https://crests.football-data.org/PL.png' },
  { code: 'PD', name: 'La Liga', logo: 'https://crests.football-data.org/PD.png' },
  { code: 'SA', name: 'Serie A', logo: 'https://crests.football-data.org/SA.png' },
  { code: 'BL1', name: 'Bundesliga', logo: 'https://crests.football-data.org/BL1.png' },
  { code: 'FL1', name: 'Ligue 1', logo: 'https://crests.football-data.org/FL1.png' },
];

// Componente de Partida ao Vivo
function PartidaAoVivoCard({ partida, onPress }) {
  const isLive = isMatchLive(partida.fixture.status.short);
  
  return (
    <TouchableOpacity style={styles.partidaCard} onPress={onPress}>
      {isLive && (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>AO VIVO</Text>
          <Text style={styles.tempoText}>{partida.fixture.status.elapsed}'</Text>
        </View>
      )}
      
      <View style={styles.timesContainer}>
        <View style={styles.timeInfo}>
          <View style={styles.escudoPlaceholder}>
            {partida.teams.home.logo ? (
              <Image 
                source={{ uri: partida.teams.home.logo }} 
                style={styles.escudo}
              />
            ) : (
              <Ionicons name="football" size={24} color={theme.colors.textSecondary} />
            )}
          </View>
          <Text style={styles.timeNome} numberOfLines={1}>
            {partida.teams.home.name}
          </Text>
        </View>
        
        <View style={styles.placarContainer}>
          {isMatchScheduled(partida.fixture.status.short) ? (
            <Text style={styles.horario}>
              {formatTimeBrasilia(partida.fixture.date)}
            </Text>
          ) : (
            <>
              <Text style={styles.placar}>{partida.goals.home}</Text>
              <Text style={styles.placarSeparador}>-</Text>
              <Text style={styles.placar}>{partida.goals.away}</Text>
            </>
          )}
        </View>
        
        <View style={styles.timeInfo}>
          <View style={styles.escudoPlaceholder}>
            {partida.teams.away.logo ? (
              <Image 
                source={{ uri: partida.teams.away.logo }} 
                style={styles.escudo}
              />
            ) : (
              <Ionicons name="football" size={24} color={theme.colors.textSecondary} />
            )}
          </View>
          <Text style={styles.timeNome} numberOfLines={1}>
            {partida.teams.away.name}
          </Text>
        </View>
      </View>
      
      <View style={styles.partidaFooter}>
        <Text style={styles.campeonatoNome}>
          {partida.league.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Componente de Campeonato
function CampeonatoCard({ campeonato, onPress }) {
  return (
    <TouchableOpacity style={styles.campeonatoCard} onPress={onPress}>
      <View style={styles.campeonatoLogo}>
        {campeonato.league.logo ? (
          <Image source={{ uri: campeonato.league.logo }} style={styles.campeonatoImg} />
        ) : (
          <Ionicons name="trophy" size={30} color={theme.colors.secondary} />
        )}
      </View>
      <Text style={styles.campeonatoNomeCard} numberOfLines={2}>
        {campeonato.league.name}
      </Text>
    </TouchableOpacity>
  );
}

// Componente de Time
function TimeCard({ time, onPress }) {
  return (
    <TouchableOpacity style={styles.timeCard} onPress={onPress}>
      <View style={styles.timeEscudo}>
        {time.team.logo ? (
          <Image source={{ uri: time.team.logo }} style={styles.timeImg} />
        ) : (
          <Ionicons name="shield" size={35} color={theme.colors.textSecondary} />
        )}
      </View>
      <Text style={styles.timeNomeCard} numberOfLines={1}>
        {time.team.name}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { preferencias, setLigaFavorita, favoritos } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [partidasAoVivo, setPartidasAoVivo] = useState([]);
  const [proximasPartidas, setProximasPartidas] = useState([]);
  const [times, setTimes] = useState(TIMES_MOCK);
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [showFiltroModal, setShowFiltroModal] = useState(false);

  // Extrair campeonatos principais da estrutura
  const campeonatosPrincipais = [
    ...Object.values(CAMPEONATOS_ESTRUTURADOS.continentais).flatMap(cat => cat.competicoes || []),
    ...Object.values(CAMPEONATOS_ESTRUTURADOS.nacionais).flatMap(pais => pais.divisoes || [])
  ].slice(0, 8);

  // Carregar filtro salvo
  useEffect(() => {
    if (preferencias?.ligaFavorita) {
      setFiltroAtivo(preferencias.ligaFavorita);
    }
  }, [preferencias]);

  // Filtrar partidas com base no filtro ativo
  const filtrarPartidas = (partidas) => {
    if (filtroAtivo === 'todos') return partidas;
    if (filtroAtivo === 'time_favorito' && favoritos?.times?.length > 0) {
      const timeFavoritoIds = favoritos.times.map(t => t.team?.id);
      return partidas.filter(p => 
        timeFavoritoIds.includes(p.teams?.home?.id) || 
        timeFavoritoIds.includes(p.teams?.away?.id)
      );
    }
    return partidas.filter(p => p.league?.code === filtroAtivo);
  };

  // Ordenar partidas priorizando times favoritos
  const ordenarPorFavoritos = (partidas) => {
    if (!favoritos?.times?.length) return partidas;
    
    const timeFavoritoIds = favoritos.times.map(t => t.team?.id);
    
    return [...partidas].sort((a, b) => {
      const aTemFavorito = timeFavoritoIds.includes(a.teams?.home?.id) || timeFavoritoIds.includes(a.teams?.away?.id);
      const bTemFavorito = timeFavoritoIds.includes(b.teams?.home?.id) || timeFavoritoIds.includes(b.teams?.away?.id);
      
      if (aTemFavorito && !bTemFavorito) return -1;
      if (!aTemFavorito && bTemFavorito) return 1;
      return 0;
    });
  };

  const loadPartidas = async () => {
    try {
      // Buscar partidas ao vivo
      const liveData = await getLiveMatches();
      console.log('Live data:', liveData?.results);
      
      // Separar corretamente: ao vivo vs próximas
      let aoVivo = [];
      let proximas = [];
      
      if (liveData?.response && liveData.response.length > 0) {
        // Filtrar apenas partidas realmente ao vivo
        aoVivo = liveData.response.filter(p => isMatchLive(p.fixture?.status?.short));
      }
      
      // Buscar próximas partidas (independente de haver jogos ao vivo)
      console.log('Buscando próximas partidas...');
      const upcomingData = await getUpcomingMatches(20);
      console.log('Upcoming data:', upcomingData?.results);
      
      if (upcomingData?.response && upcomingData.response.length > 0) {
        // Filtrar apenas partidas agendadas (não ao vivo)
        proximas = upcomingData.response.filter(p => 
          isMatchScheduled(p.fixture?.status?.short)
        );
      }
      
      // Aplicar filtro e ordenar por favoritos
      const aoVivoFiltradas = ordenarPorFavoritos(filtrarPartidas(aoVivo));
      const proximasFiltradas = ordenarPorFavoritos(filtrarPartidas(proximas));
      
      setPartidasAoVivo(aoVivoFiltradas.slice(0, 10));
      setProximasPartidas(proximasFiltradas.slice(0, 10));
    } catch (error) {
      console.error('Erro ao carregar partidas:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await loadPartidas();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [filtroAtivo]); // Recarregar quando mudar o filtro

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPartidas();
    setRefreshing(false);
  };

  // Mudar filtro e salvar preferência
  const handleFiltroChange = async (codigo) => {
    setFiltroAtivo(codigo);
    await setLigaFavorita(codigo);
    setShowFiltroModal(false);
  };

  // Obter nome do filtro ativo
  const getFiltroNome = () => {
    const liga = LIGAS_DISPONIVEIS.find(l => l.code === filtroAtivo);
    return liga?.name || 'Todos os Jogos';
  };

  // Modal de Filtro
  const FiltroModal = () => (
    <Modal
      visible={showFiltroModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFiltroModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar Jogos</Text>
            <TouchableOpacity onPress={() => setShowFiltroModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalList}>
            {LIGAS_DISPONIVEIS.map((liga) => (
              <TouchableOpacity
                key={liga.code}
                style={[
                  styles.filtroItem,
                  filtroAtivo === liga.code && styles.filtroItemAtivo
                ]}
                onPress={() => handleFiltroChange(liga.code)}
              >
                <View style={styles.filtroItemContent}>
                  {liga.logo ? (
                    <Image source={{ uri: liga.logo }} style={styles.filtroLogo} />
                  ) : (
                    <Ionicons name="football" size={24} color={theme.colors.textSecondary} />
                  )}
                  <Text style={[
                    styles.filtroItemText,
                    filtroAtivo === liga.code && styles.filtroItemTextAtivo
                  ]}>
                    {liga.name}
                  </Text>
                </View>
                {filtroAtivo === liga.code && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            
            {/* Opção de Time Favorito */}
            {favoritos?.times?.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.filtroItem,
                  filtroAtivo === 'time_favorito' && styles.filtroItemAtivo
                ]}
                onPress={() => handleFiltroChange('time_favorito')}
              >
                <View style={styles.filtroItemContent}>
                  <Ionicons name="heart" size={24} color={theme.colors.error} />
                  <Text style={[
                    styles.filtroItemText,
                    filtroAtivo === 'time_favorito' && styles.filtroItemTextAtivo
                  ]}>
                    Meus Times Favoritos
                  </Text>
                </View>
                {filtroAtivo === 'time_favorito' && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Modal de Filtro */}
      <FiltroModal />

      {/* Header de Boas-vindas */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá! 👋</Text>
          <Text style={styles.headerTitle}>Acompanhe o futebol</Text>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('Busca')}
        >
          <Ionicons name="search" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filtro de Ligas */}
      <View style={styles.filtroContainer}>
        <TouchableOpacity 
          style={styles.filtroButton}
          onPress={() => setShowFiltroModal(true)}
        >
          <Ionicons name="filter" size={18} color={theme.colors.primary} />
          <Text style={styles.filtroButtonText}>{getFiltroNome()}</Text>
          <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Partidas ao Vivo */}
      {loading ? (
        <View style={styles.section}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando partidas...</Text>
          </View>
        </View>
      ) : partidasAoVivo.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.liveDotLarge} />
              <Text style={styles.sectionTitle}>Ao Vivo</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Partidas')}>
              <Text style={styles.verTodos}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {partidasAoVivo.map((partida) => (
            <PartidaAoVivoCard
              key={partida.fixture.id}
              partida={partida}
              onPress={() => navigation.navigate('DetalhePartida', { partida })}
            />
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.emptyLiveContainer}>
            <Ionicons name="football-outline" size={40} color={theme.colors.textSecondary} />
            <Text style={styles.emptyLiveText}>Nenhuma partida ao vivo no momento</Text>
          </View>
        </View>
      )}

      {/* Próximas Partidas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>📅 Próximas Partidas</Text>
            {favoritos?.times?.length > 0 && (
              <View style={styles.favoritoBadge}>
                <Ionicons name="heart" size={12} color={theme.colors.error} />
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Partidas')}>
            <Text style={styles.verTodos}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        {proximasPartidas.length > 0 ? (
          proximasPartidas.slice(0, 5).map((partida) => (
            <PartidaAoVivoCard
              key={partida.fixture.id}
              partida={partida}
              onPress={() => navigation.navigate('DetalhePartida', { partida })}
            />
          ))
        ) : (
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma partida agendada para os próximos dias</Text>
            </View>
          )
        )}
      </View>

      {/* Campeonatos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Campeonatos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Campeonatos')}>
            <Text style={styles.verTodos}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {campeonatosPrincipais.map((campeonato) => (
            <CampeonatoCard
              key={campeonato.league.id}
              campeonato={campeonato}
              onPress={() => navigation.navigate('DetalheCampeonato', { campeonato })}
            />
          ))}
        </ScrollView>
      </View>

      {/* Times Populares */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚽ Times Populares</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Times')}>
            <Text style={styles.verTodos}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {times.map((time) => (
            <TimeCard
              key={time.team.id}
              time={time}
              onPress={() => navigation.navigate('DetalheTime', { time })}
            />
          ))}
        </ScrollView>
      </View>

      {/* Espaço inferior */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  verTodos: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  liveDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.live,
    marginRight: theme.spacing.sm,
  },
  
  // Partida Card
  partidaCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.live,
    marginRight: theme.spacing.xs,
  },
  liveText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.live,
    marginRight: theme.spacing.sm,
  },
  tempoText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  timesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInfo: {
    flex: 1,
    alignItems: 'center',
  },
  escudoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  timeNome: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },
  placarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  placar: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  placarSeparador: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.sm,
  },
  horario: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  partidaFooter: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  campeonatoNome: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Horizontal Lists
  horizontalList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  // Campeonato Card
  campeonatoCard: {
    width: 100,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  campeonatoLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  campeonatoImg: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  campeonatoNomeCard: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium,
  },

  // Time Card
  timeCard: {
    width: 80,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  timeEscudo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  timeImg: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  timeNomeCard: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },

  // Loading e Empty states
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyLiveContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  emptyLiveText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  // Estilos do Filtro
  filtroContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  filtroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  filtroButtonText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
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
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  modalList: {
    padding: theme.spacing.md,
  },
  filtroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  filtroItemAtivo: {
    backgroundColor: theme.colors.primaryLight || 'rgba(0, 255, 136, 0.1)',
  },
  filtroItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  filtroLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  filtroItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  filtroItemTextAtivo: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  favoritoBadge: {
    marginLeft: theme.spacing.xs,
    padding: 2,
  },
});

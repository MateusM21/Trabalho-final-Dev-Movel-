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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { 
  CAMPEONATOS_ESTRUTURADOS,
  TIMES_MOCK,
  isMatchLive,
  isMatchScheduled,
  getMatchStatus,
  getLiveMatches,
  getFixturesByDate,
} from '../../services/api';

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
              {new Date(partida.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [partidasAoVivo, setPartidasAoVivo] = useState([]);
  const [proximasPartidas, setProximasPartidas] = useState([]);
  const [times, setTimes] = useState(TIMES_MOCK);

  // Extrair campeonatos principais da estrutura
  const campeonatosPrincipais = [
    ...Object.values(CAMPEONATOS_ESTRUTURADOS.continentais).flatMap(cat => cat.competicoes || []),
    ...Object.values(CAMPEONATOS_ESTRUTURADOS.nacionais).flatMap(pais => pais.divisoes || [])
  ].slice(0, 8);

  const loadPartidas = async () => {
    try {
      // Buscar partidas ao vivo
      const liveData = await getLiveMatches();
      console.log('Live data:', liveData?.results);
      if (liveData?.response && Array.isArray(liveData.response)) {
        setPartidasAoVivo(liveData.response.slice(0, 10));
      }

      // Buscar partidas do dia
      const today = new Date().toISOString().split('T')[0];
      console.log('Buscando partidas para:', today);
      const todayData = await getFixturesByDate(today);
      console.log('Today data:', todayData?.results);
      if (todayData?.response && Array.isArray(todayData.response)) {
        const scheduled = todayData.response.filter(p => 
          p?.fixture?.status?.short && isMatchScheduled(p.fixture.status.short)
        );
        setProximasPartidas(scheduled.slice(0, 10));
      }
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
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPartidas();
    setRefreshing(false);
  };

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
          <Text style={styles.sectionTitle}>📅 Próximas Partidas</Text>
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
              <Text style={styles.emptyText}>Nenhuma partida agendada para hoje</Text>
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
});

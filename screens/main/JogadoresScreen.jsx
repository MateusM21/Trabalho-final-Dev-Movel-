/**
 * JogadoresScreen.jsx
 * 
 * Tela de ranking de jogadores.
 * Exibe artilheiros e assistentes de diferentes ligas.
 * 
 * Funcionalidades:
 * - Ranking de artilheiros por campeonato
 * - Ranking de lendas do futebol
 * - Filtro por liga
 * - Alternação entre gols e assistências
 * 
 * APIs utilizadas:
 * - Football-Data.org: Top scorers por liga
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
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { getTopScorers, getLegendsScorers } from '../../services/api';

// Lista de campeonatos para filtro
const CAMPEONATOS = [
  { code: 'PL', name: 'Premier', logo: 'https://crests.football-data.org/PL.png' },
  { code: 'BSA', name: 'Brasileirão', logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/85.png' },
  { code: 'PD', name: 'La Liga', logo: 'https://crests.football-data.org/PD.png' },
  { code: 'SA', name: 'Serie A', logo: 'https://crests.football-data.org/SA.png' },
  { code: 'BL1', name: 'Bundesliga', logo: 'https://crests.football-data.org/BL1.png' },
  { code: 'FL1', name: 'Ligue 1', logo: 'https://crests.football-data.org/FL1.png' },
];

function JogadorCard({ jogador, posicao, onPress, isAssistMode = false, isLegend = false }) {
  // Para lendas, os dados vêm em formato diferente
  const stats = jogador.statistics?.[0] || {};
  const gols = isLegend ? jogador.goals : (stats.goals?.total || 0);
  const assistencias = isLegend ? jogador.assists : (stats.assists || 0);
  const penaltis = stats.penalties || 0;
  const jogos = isLegend ? jogador.playedMatches : (stats.playedMatches || null);
  const golsPorJogo = jogos ? (gols / jogos).toFixed(2) : null;
  const idade = jogador.player?.age || null;
  const teamName = isLegend ? jogador.team?.name : stats.team?.name;
  const teamLogo = isLegend ? jogador.team?.crest : stats.team?.logo;
  
  // Cores para top 3
  const getPosicaoColor = () => {
    if (posicao === 1) return '#FFD700'; // Ouro
    if (posicao === 2) return '#C0C0C0'; // Prata
    if (posicao === 3) return '#CD7F32'; // Bronze
    return theme.colors.textMuted;
  };

  // Formatar posição do jogador
  const formatPosition = (pos) => {
    if (!pos) return '';
    const positions = {
      'Goalkeeper': 'Goleiro',
      'Defender': 'Defensor',
      'Midfielder': 'Meio-campo',
      'Attacker': 'Atacante',
      'Forward': 'Atacante',
      'Centre-Back': 'Zagueiro',
      'Left-Back': 'Lateral Esq.',
      'Right-Back': 'Lateral Dir.',
      'Defensive Midfield': 'Volante',
      'Central Midfield': 'Meia',
      'Attacking Midfield': 'Meia Ofensivo',
      'Left Winger': 'Ponta Esq.',
      'Right Winger': 'Ponta Dir.',
      'Centre-Forward': 'Centroavante',
    };
    return positions[pos] || pos;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Header com posição e info básica */}
      <View style={styles.cardHeader}>
        <View style={[styles.posicaoContainer, { backgroundColor: getPosicaoColor() }]}>
          <Text style={styles.posicaoText}>{posicao}º</Text>
        </View>
        
        <View style={styles.fotoContainer}>
          {jogador.player?.photo ? (
            <Image source={{ uri: jogador.player.photo }} style={styles.foto} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <Ionicons name="person" size={30} color={theme.colors.textMuted} />
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.nome} numberOfLines={1}>{jogador.player?.name}</Text>
          <View style={styles.timeRow}>
            {teamLogo && (
              <Image source={{ uri: teamLogo }} style={styles.timeLogo} />
            )}
            <Text style={styles.timeNome} numberOfLines={1}>{teamName}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.positionText}>{formatPosition(jogador.player?.position)}</Text>
            {idade && <Text style={styles.ageText}> • {idade} anos</Text>}
            {jogador.player?.shirtNumber && (
              <Text style={styles.numberText}> • #{jogador.player.shirtNumber}</Text>
            )}
          </View>
          <Text style={styles.nacionalidade}>
            {jogador.player?.nationality}
            {jogador.player?.height && ` • ${jogador.player.height}`}
          </Text>
        </View>
      </View>
      
      {/* Estatísticas - ordem muda conforme o modo */}
      <View style={styles.statsRow}>
        {isAssistMode ? (
          <>
            <View style={[styles.statItem, styles.statItemHighlight]}>
              <Text style={[styles.statValue, styles.statValueHighlight]}>{assistencias}</Text>
              <Text style={styles.statLabel}>Assist.</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{gols}</Text>
              <Text style={styles.statLabel}>Gols</Text>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.statItem, styles.statItemHighlight]}>
              <Text style={[styles.statValue, styles.statValueHighlight]}>{gols}</Text>
              <Text style={styles.statLabel}>Gols</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{assistencias}</Text>
              <Text style={styles.statLabel}>Assist.</Text>
            </View>
          </>
        )}
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{penaltis}</Text>
          <Text style={styles.statLabel}>Pênaltis</Text>
        </View>
        {jogos && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{jogos}</Text>
              <Text style={styles.statLabel}>Jogos</Text>
            </View>
          </>
        )}
        {golsPorJogo && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.statValueSmall]}>{golsPorJogo}</Text>
              <Text style={styles.statLabel}>G/Jogo</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function JogadoresScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jogadores, setJogadores] = useState([]);
  const [jogadoresOriginal, setJogadoresOriginal] = useState([]);
  const [lendas, setLendas] = useState([]);
  const [campeonatoSelecionado, setCampeonatoSelecionado] = useState('PL');
  const [tabAtiva, setTabAtiva] = useState('lendas'); // 'lendas', 'artilheiros' ou 'assistentes'
  const [busca, setBusca] = useState('');

  const loadJogadores = async (code) => {
    try {
      const data = await getTopScorers(code, 20);
      const lista = data?.response || [];
      setJogadoresOriginal(lista);
      setJogadores(lista);
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
      setJogadoresOriginal([]);
      setJogadores([]);
    }
  };

  const loadLendas = async () => {
    try {
      const data = await getLegendsScorers();
      setLendas(data || []);
    } catch (error) {
      console.error('Erro ao carregar lendas:', error);
      setLendas([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (tabAtiva === 'lendas') {
        await loadLendas();
      } else {
        await loadJogadores(campeonatoSelecionado);
      }
      setLoading(false);
    };
    loadData();
  }, [campeonatoSelecionado, tabAtiva]);

  // Filtrar e ordenar jogadores quando tab ou busca mudar
  useEffect(() => {
    if (tabAtiva === 'lendas') {
      // Filtrar lendas por busca
      if (busca.trim()) {
        const termo = busca.toLowerCase().trim();
        const filtradas = lendas.filter(l => 
          l.player?.name?.toLowerCase().includes(termo) ||
          l.team?.name?.toLowerCase().includes(termo)
        );
        setJogadores(filtradas);
      } else {
        setJogadores(lendas);
      }
      return;
    }
    
    let lista = [...jogadoresOriginal];
    
    // Filtrar por busca
    if (busca.trim()) {
      const termo = busca.toLowerCase().trim();
      lista = lista.filter(j => 
        j.player?.name?.toLowerCase().includes(termo) ||
        j.statistics?.[0]?.team?.name?.toLowerCase().includes(termo)
      );
    }
    
    // Ordenar por gols ou assistências
    if (tabAtiva === 'assistentes') {
      lista.sort((a, b) => {
        const assistA = a.statistics?.[0]?.assists || 0;
        const assistB = b.statistics?.[0]?.assists || 0;
        return assistB - assistA;
      });
    } else {
      lista.sort((a, b) => {
        const golsA = a.statistics?.[0]?.goals?.total || 0;
        const golsB = b.statistics?.[0]?.goals?.total || 0;
        return golsB - golsA;
      });
    }
    
    setJogadores(lista);
  }, [tabAtiva, busca, jogadoresOriginal, lendas]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (tabAtiva === 'lendas') {
      await loadLendas();
    } else {
      await loadJogadores(campeonatoSelecionado);
    }
    setRefreshing(false);
  };

  const handleSelectCampeonato = (code) => {
    if (code !== campeonatoSelecionado) {
      setCampeonatoSelecionado(code);
      setJogadoresOriginal([]);
      setJogadores([]);
      setLoading(true);
      setBusca('');
    }
  };

  const handlePressJogador = (jogador) => {
    // Para lendas, os dados já vêm formatados diferente
    if (tabAtiva === 'lendas') {
      navigation.navigate('DetalheAtleta', { 
        atleta: { 
          player: jogador.player,
          statistics: jogador.statistics,
          team: jogador.team,
          goals: jogador.goals || 0,
          assists: jogador.assists || 0,
          penalties: jogador.statistics?.[0]?.penalties || 0,
          playedMatches: jogador.playedMatches || 0,
        } 
      });
    } else {
      navigation.navigate('DetalheAtleta', { 
        atleta: { 
          player: jogador.player,
          statistics: jogador.statistics,
          team: jogador.statistics?.[0]?.team,
          goals: jogador.statistics?.[0]?.goals?.total || 0,
          assists: jogador.statistics?.[0]?.assists || 0,
          penalties: jogador.statistics?.[0]?.penalties || 0,
          playedMatches: jogador.statistics?.[0]?.playedMatches || 0,
        } 
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="trophy" size={24} color={theme.colors.secondary} />
        <Text style={styles.headerTitle}>Jogadores</Text>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar jogador ou time..."
          placeholderTextColor={theme.colors.textMuted}
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs Lendas / Artilheiros / Assistentes */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tabAtiva === 'lendas' && styles.tabButtonActive]}
          onPress={() => setTabAtiva('lendas')}
        >
          <Ionicons 
            name="star" 
            size={18} 
            color={tabAtiva === 'lendas' ? theme.colors.white : theme.colors.textSecondary} 
          />
          <Text style={[styles.tabText, tabAtiva === 'lendas' && styles.tabTextActive]}>
            Lendas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tabAtiva === 'artilheiros' && styles.tabButtonActive]}
          onPress={() => setTabAtiva('artilheiros')}
        >
          <Ionicons 
            name="football" 
            size={18} 
            color={tabAtiva === 'artilheiros' ? theme.colors.white : theme.colors.textSecondary} 
          />
          <Text style={[styles.tabText, tabAtiva === 'artilheiros' && styles.tabTextActive]}>
            Artilheiros
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tabAtiva === 'assistentes' && styles.tabButtonActive]}
          onPress={() => setTabAtiva('assistentes')}
        >
          <Ionicons 
            name="hand-right-outline" 
            size={18} 
            color={tabAtiva === 'assistentes' ? theme.colors.white : theme.colors.textSecondary} 
          />
          <Text style={[styles.tabText, tabAtiva === 'assistentes' && styles.tabTextActive]}>
            Assistentes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de Campeonato - só mostra se não for Lendas */}
      {tabAtiva !== 'lendas' && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtrosContainer}
          contentContainerStyle={styles.filtrosContent}
        >
          {CAMPEONATOS.map((camp) => (
            <TouchableOpacity
              key={camp.code}
              style={[
                styles.filtroButton,
                campeonatoSelecionado === camp.code && styles.filtroButtonActive
              ]}
              onPress={() => handleSelectCampeonato(camp.code)}
            >
              <Image source={{ uri: camp.logo }} style={styles.filtroLogo} />
              <Text style={[
                styles.filtroText,
                campeonatoSelecionado === camp.code && styles.filtroTextActive
              ]}>
                {camp.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Descrição da aba Lendas */}
      {tabAtiva === 'lendas' && (
        <View style={styles.legendsHeader}>
          <Text style={styles.legendsTitle}>🏆 Maiores Artilheiros em Atividade</Text>
          <Text style={styles.legendsSubtitle}>Ranking histórico de gols na carreira</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            Carregando {tabAtiva === 'lendas' ? 'lendas' : tabAtiva === 'artilheiros' ? 'artilheiros' : 'assistentes'}...
          </Text>
        </View>
      ) : (
        <FlatList
          data={jogadores}
          keyExtractor={(item, index) => `${item.player?.id || index}`}
          renderItem={({ item, index }) => (
            <JogadorCard
              jogador={item}
              posicao={index + 1}
              onPress={() => handlePressJogador(item)}
              isAssistMode={tabAtiva === 'assistentes'}
              isLegend={tabAtiva === 'lendas'}
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
              <Text style={styles.emptyText}>
                {busca ? 'Nenhum jogador encontrado' : `Nenhum ${tabAtiva === 'artilheiros' ? 'artilheiro' : 'assistente'} encontrado`}
              </Text>
              <Text style={styles.emptySubtext}>
                {busca ? 'Tente outro termo de busca' : 'Tente selecionar outro campeonato'}
              </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceLight,
    gap: theme.spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  tabTextActive: {
    color: theme.colors.white,
  },
  legendsHeader: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  legendsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  legendsSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  filtrosContainer: {
    backgroundColor: theme.colors.surface,
    maxHeight: 70,
  },
  filtrosContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  filtroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceLight,
    marginRight: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  filtroButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filtroLogo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
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
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  posicaoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  posicaoText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.background,
  },
  fotoContainer: {
    marginRight: theme.spacing.md,
  },
  foto: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: theme.colors.surfaceLight,
  },
  fotoPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  nome: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  timeLogo: {
    width: 16,
    height: 16,
    marginRight: theme.spacing.xs,
    resizeMode: 'contain',
  },
  timeNome: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  positionText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  ageText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  numberText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  nacionalidade: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 45,
  },
  statItemHighlight: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statValueHighlight: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.secondary,
  },
  statValueSmall: {
    fontSize: theme.fontSize.md,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.border,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
  emptySubtext: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
});

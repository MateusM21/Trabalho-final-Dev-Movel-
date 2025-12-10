/**
 * DetalheCampeonatoScreen.jsx
 * 
 * Tela de detalhes de um campeonato específico.
 * Exibe tabela de classificação, partidas e artilheiros.
 * 
 * Funcionalidades:
 * - Tabela de classificação atualizada
 * - Lista de partidas (passadas e futuras)
 * - Ranking de artilheiros
 * - Navegação por tabs
 * 
 * APIs utilizadas:
 * - Football-Data.org: Classificação, partidas e artilheiros
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { 
  getStandings,
  getMatches,
  getTopScorers,
  isMatchScheduled,
  isMatchLive,
  isMatchFinished,
  formatTimeBrasilia,
  formatDateBrasilia,
} from '../../services/api';

const { width } = Dimensions.get('window');

// Componente de Tab
function TabButton({ title, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
  );
}

// Componente de linha da tabela
function TabelaRow({ item, onPressTime, competitionCode }) {
  // Função para determinar a cor baseada na posição e competição
  const getPositionColor = (pos) => {
    // Regras específicas para o Brasileirão 2025
    // Flamengo campeão da Libertadores 2024 abriu +1 vaga para Libertadores
    if (competitionCode === 'BSA') {
      // 1° ao 5° - Libertadores (vaga extra por campeão da Libertadores estar no G4)
      if (pos <= 5) return theme.colors.libertadores;
      // 6° ao 13° - Sul-Americana
      if (pos <= 13) return theme.colors.sulAmericana;
      // 14° ao 16° - Sem classificação
      if (pos <= 16) return theme.colors.textMuted;
      // 17° ao 20° - Rebaixamento
      return theme.colors.rebaixamento;
    }
    
    // Regras para ligas europeias (Champions League)
    if (['PL', 'PD', 'SA', 'BL1', 'FL1'].includes(competitionCode)) {
      if (pos <= 4) return theme.colors.libertadores; // Champions League
      if (pos <= 6) return theme.colors.sulAmericana; // Europa League
      if (pos === 7) return '#FF9800'; // Conference League
      if (pos >= 18) return theme.colors.rebaixamento;
      return theme.colors.textMuted;
    }
    
    // Padrão para outras competições
    if (pos <= 4) return theme.colors.libertadores;
    if (pos <= 6) return theme.colors.sulAmericana;
    if (pos >= 17) return theme.colors.rebaixamento;
    return theme.colors.textMuted;
  };

  return (
    <TouchableOpacity 
      style={styles.tabelaRow}
      onPress={() => onPressTime({ team: item.team })}
    >
      <View style={[styles.posicaoContainer, { borderLeftColor: getPositionColor(item.rank) }]}>
        <Text style={styles.posicao}>{item.rank}</Text>
      </View>
      <View style={styles.tabelaTimeInfo}>
        <View style={styles.tabelaEscudo}>
          {item.team.logo ? (
            <Image source={{ uri: item.team.logo }} style={styles.escudoPequeno} />
          ) : (
            <Ionicons name="shield" size={18} color={theme.colors.textSecondary} />
          )}
        </View>
        <Text style={styles.tabelaTimeNome} numberOfLines={1}>
          {item.team.name}
        </Text>
      </View>
      <Text style={styles.tabelaValor}>{item.points}</Text>
      <Text style={styles.tabelaValor}>{item.all.played}</Text>
      <Text style={styles.tabelaValor}>{item.all.win}</Text>
      <Text style={styles.tabelaValor}>{item.all.draw}</Text>
      <Text style={styles.tabelaValor}>{item.all.lose}</Text>
      <Text style={styles.tabelaValor}>{item.goalsDiff > 0 ? '+' : ''}{item.goalsDiff}</Text>
    </TouchableOpacity>
  );
}

// Componente de Partida
function PartidaItem({ partida, onPress }) {
  const isScheduled = isMatchScheduled(partida.fixture.status.short);
  
  return (
    <TouchableOpacity style={styles.partidaItem} onPress={onPress}>
      <View style={styles.partidaTimes}>
        <View style={styles.partidaTime}>
          <View style={styles.partidaEscudo}>
            {partida.teams.home.logo ? (
              <Image source={{ uri: partida.teams.home.logo }} style={styles.escudoMedio} />
            ) : (
              <Ionicons name="shield" size={20} color={theme.colors.textSecondary} />
            )}
          </View>
          <Text style={styles.partidaTimeNome}>{partida.teams.home.name?.substring(0, 3).toUpperCase()}</Text>
        </View>
        
        <View style={styles.partidaPlacar}>
          {isScheduled ? (
            <Text style={styles.partidaHora}>
              {formatTimeBrasilia(partida.fixture.date)}
            </Text>
          ) : (
            <Text style={styles.partidaPlacarTexto}>
              {partida.goals.home} - {partida.goals.away}
            </Text>
          )}
        </View>
        
        <View style={styles.partidaTime}>
          <View style={styles.partidaEscudo}>
            {partida.teams.away.logo ? (
              <Image source={{ uri: partida.teams.away.logo }} style={styles.escudoMedio} />
            ) : (
              <Ionicons name="shield" size={20} color={theme.colors.textSecondary} />
            )}
          </View>
          <Text style={styles.partidaTimeNome}>{partida.teams.away.name?.substring(0, 3).toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.partidaData}>
        {formatDateBrasilia(partida.fixture.date)} • {partida.fixture.venue?.name}
      </Text>
    </TouchableOpacity>
  );
}

// Componente de Artilheiro
function ArtilheiroItem({ item, posicao, onPress }) {
  if (!item || !item.player) return null;
  
  return (
    <TouchableOpacity style={styles.artilheiroItem} onPress={onPress}>
      <Text style={styles.artilheiroPosicao}>{posicao}</Text>
      <View style={styles.artilheiroInfo}>
        <View style={styles.artilheiroAvatar}>
          {item.player?.photo ? (
            <Image source={{ uri: item.player.photo }} style={styles.artilheiroFoto} />
          ) : (
            <Ionicons name="person" size={20} color={theme.colors.textSecondary} />
          )}
        </View>
        <View>
          <Text style={styles.artilheiroNome}>{item.player?.name || 'Desconhecido'}</Text>
          <Text style={styles.artilheiroTime}>{item.statistics?.[0]?.team?.name || '-'}</Text>
        </View>
      </View>
      <View style={styles.artilheiroGols}>
        <Ionicons name="football" size={14} color={theme.colors.secondary} />
        <Text style={styles.artilheiroGolsTexto}>{item.statistics?.[0]?.goals?.total || 0}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DetalheCampeonatoScreen({ route, navigation }) {
  const { campeonato } = route.params;
  const [activeTab, setActiveTab] = useState('tabela');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para dados da API
  const [tabela, setTabela] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [artilheiros, setArtilheiros] = useState([]);

  const tabs = [
    { key: 'tabela', title: 'Tabela' },
    { key: 'jogos', title: 'Jogos' },
    { key: 'artilharia', title: 'Artilharia' },
  ];

  // Código da competição na Football-Data.org (PL, BSA, CL, etc.)
  const competitionCode = campeonato.league.code || campeonato.league.id;
  const season = 2025; // Temporada atual para exibição
  
  console.log('Campeonato:', campeonato.league.name, 'Code:', competitionCode);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadTabela(),
        loadPartidas(),
        loadArtilheiros(),
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadTabela = async () => {
    try {
      const data = await getStandings(competitionCode);
      console.log('Standings data:', data?.results);
      if (data?.response && data.response.length > 0 && data.response[0].league?.standings) {
        // A API retorna standings como array de grupos
        const standings = data.response[0].league.standings[0] || [];
        setTabela(standings);
      }
    } catch (err) {
      console.error('Erro ao carregar tabela:', err);
    }
  };

  const loadPartidas = async () => {
    try {
      // Buscar partidas do campeonato
      const todasPartidas = await getMatches(competitionCode, {});
      console.log('Partidas:', todasPartidas?.results);
      const proximasData = todasPartidas; // Partidas já vêm ordenadas
      
      // Combinar partidas - ordenar por data
      let todasOrdenadas = [];
      
      if (todasPartidas?.response && Array.isArray(todasPartidas.response)) {
        // Filtrar partidas recentes (últimos 7 dias) e futuras (próximos 14 dias)
        const agora = new Date();
        const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        const quatorzeDiasFrente = new Date(agora.getTime() + 14 * 24 * 60 * 60 * 1000);
        
        todasOrdenadas = todasPartidas.response
          .filter(p => {
            const dataPartida = new Date(p.fixture.date);
            return dataPartida >= seteDiasAtras && dataPartida <= quatorzeDiasFrente;
          })
          .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));
      } else if (proximasData?.response && Array.isArray(proximasData.response)) {
        todasOrdenadas = proximasData.response;
      }
      
      setPartidas(todasOrdenadas.slice(0, 20));
    } catch (err) {
      console.error('Erro ao carregar partidas:', err);
    }
  };

  const loadArtilheiros = async () => {
    try {
      const data = await getTopScorers(competitionCode);
      console.log('Artilheiros:', data?.results);
      if (data?.response && Array.isArray(data.response)) {
        setArtilheiros(data.response.slice(0, 20));
      }
    } catch (err) {
      console.error('Erro ao carregar artilheiros:', err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeTab) {
      case 'tabela':
        return (
          <View style={styles.tabelaContainer}>
            {/* Cabeçalho da tabela */}
            <View style={styles.tabelaHeader}>
              <Text style={styles.tabelaHeaderPosicao}>#</Text>
              <Text style={styles.tabelaHeaderTime}>Time</Text>
              <Text style={styles.tabelaHeaderValor}>P</Text>
              <Text style={styles.tabelaHeaderValor}>J</Text>
              <Text style={styles.tabelaHeaderValor}>V</Text>
              <Text style={styles.tabelaHeaderValor}>E</Text>
              <Text style={styles.tabelaHeaderValor}>D</Text>
              <Text style={styles.tabelaHeaderValor}>SG</Text>
            </View>
            {tabela.length > 0 ? (
              <FlatList
                data={tabela}
                keyExtractor={(item) => item.rank?.toString() || Math.random().toString()}
                renderItem={({ item }) => (
                  <TabelaRow 
                    item={item} 
                    onPressTime={(time) => navigation.navigate('DetalheTime', { time })}
                    competitionCode={competitionCode}
                  />
                )}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="podium-outline" size={50} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Classificação não disponível para este campeonato</Text>
                <Text style={styles.emptySubtext}>Temporada {season}</Text>
              </View>
            )}
            {tabela.length > 0 && (
              <View style={styles.legenda}>
                {competitionCode === 'BSA' ? (
                  // Legenda específica para o Brasileirão 2025
                  <>
                    <View style={styles.legendaItem}>
                      <View style={[styles.legendaCor, { backgroundColor: theme.colors.libertadores }]} />
                      <Text style={styles.legendaTexto}>Libertadores (1°-5°)*</Text>
                    </View>
                    <View style={styles.legendaItem}>
                      <View style={[styles.legendaCor, { backgroundColor: theme.colors.sulAmericana }]} />
                      <Text style={styles.legendaTexto}>Sul-Americana (6°-13°)</Text>
                    </View>
                    <View style={styles.legendaItem}>
                      <View style={[styles.legendaCor, { backgroundColor: theme.colors.rebaixamento }]} />
                      <Text style={styles.legendaTexto}>Rebaixamento (17°-20°)</Text>
                    </View>
                    <Text style={styles.legendaNota}>*Vaga extra: Flamengo campeão da Libertadores 2024</Text>
                  </>
                ) : (
                  // Legenda para ligas europeias
                  <>
                    <View style={styles.legendaItem}>
                      <View style={[styles.legendaCor, { backgroundColor: theme.colors.libertadores }]} />
                      <Text style={styles.legendaTexto}>Champions League</Text>
                    </View>
                    <View style={styles.legendaItem}>
                      <View style={[styles.legendaCor, { backgroundColor: theme.colors.sulAmericana }]} />
                      <Text style={styles.legendaTexto}>Europa League</Text>
                    </View>
                    <View style={styles.legendaItem}>
                      <View style={[styles.legendaCor, { backgroundColor: theme.colors.rebaixamento }]} />
                      <Text style={styles.legendaTexto}>Rebaixamento</Text>
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
        );
      
      case 'jogos':
        return (
          <View style={styles.jogosContainer}>
            {partidas.length > 0 ? (
              partidas.map((partida) => (
                <PartidaItem
                  key={partida.fixture.id}
                  partida={partida}
                  onPress={() => navigation.navigate('DetalhePartida', { partida })}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={50} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Nenhuma partida encontrada</Text>
              </View>
            )}
          </View>
        );
      
      case 'artilharia':
        return (
          <View style={styles.artilhariaContainer}>
            {artilheiros.length > 0 ? (
              artilheiros.map((item, index) => (
                <ArtilheiroItem 
                  key={item.player?.id || index} 
                  item={item} 
                  posicao={index + 1}
                  onPress={() => navigation.navigate('DetalheAtleta', { atleta: item })}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="football-outline" size={50} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Nenhum artilheiro encontrado</Text>
              </View>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header do Campeonato */}
      <View style={styles.header}>
        <View style={styles.headerLogo}>
          {campeonato.league.logo ? (
            <Image source={{ uri: campeonato.league.logo }} style={styles.campeonatoLogo} />
          ) : (
            <Ionicons name="trophy" size={50} color={theme.colors.secondary} />
          )}
        </View>
        <Text style={styles.headerTitle}>{campeonato.league.name}</Text>
        <Text style={styles.headerSubtitle}>
          {campeonato.country?.name || 'Internacional'} • Temporada {season}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            title={tab.title}
            active={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>

      {/* Conteúdo */}
      {renderContent()}
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
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  headerLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  campeonatoLogo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },

  // Tabela
  tabelaContainer: {
    padding: theme.spacing.md,
  },
  tabelaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  tabelaHeaderPosicao: {
    width: 30,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.bold,
  },
  tabelaHeaderTime: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.bold,
  },
  tabelaHeaderValor: {
    width: 28,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
  },
  tabelaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  posicaoContainer: {
    width: 30,
    borderLeftWidth: 3,
    paddingLeft: theme.spacing.sm,
  },
  posicao: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.bold,
  },
  tabelaTimeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabelaEscudo: {
    width: 24,
    height: 24,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  escudoPequeno: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  tabelaTimeNome: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  tabelaValor: {
    width: 28,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  legenda: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendaCor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: theme.spacing.xs,
  },
  legendaTexto: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  legendaNota: {
    fontSize: theme.fontSize.xs - 1,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },

  // Jogos
  jogosContainer: {
    padding: theme.spacing.md,
  },
  partidaItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  partidaTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partidaTime: {
    alignItems: 'center',
    width: 70,
  },
  partidaEscudo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  escudoMedio: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  partidaTimeNome: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  partidaPlacar: {
    alignItems: 'center',
  },
  partidaPlacarTexto: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  partidaHora: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  partidaData: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },

  // Artilharia
  artilhariaContainer: {
    padding: theme.spacing.md,
  },
  artilheiroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  artilheiroPosicao: {
    width: 30,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
  },
  artilheiroInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artilheiroAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  artilheiroFoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  artilheiroNome: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  artilheiroTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  artilheiroGols: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  artilheiroGolsTexto: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.xs,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },

  // Error
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});

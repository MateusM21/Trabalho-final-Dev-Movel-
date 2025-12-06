import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { 
  TABELA_MOCK, 
  PARTIDAS_MOCK, 
  ARTILHARIA_MOCK,
  isMatchScheduled 
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
function TabelaRow({ item, onPressTime }) {
  const getPositionColor = (pos) => {
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
              {new Date(partida.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
        {new Date(partida.fixture.date).toLocaleDateString('pt-BR')} • {partida.fixture.venue?.name}
      </Text>
    </TouchableOpacity>
  );
}

// Componente de Artilheiro
function ArtilheiroItem({ item, posicao }) {
  return (
    <View style={styles.artilheiroItem}>
      <Text style={styles.artilheiroPosicao}>{posicao}</Text>
      <View style={styles.artilheiroInfo}>
        <View style={styles.artilheiroAvatar}>
          {item.player.photo ? (
            <Image source={{ uri: item.player.photo }} style={styles.artilheiroFoto} />
          ) : (
            <Ionicons name="person" size={20} color={theme.colors.textSecondary} />
          )}
        </View>
        <View>
          <Text style={styles.artilheiroNome}>{item.player.name}</Text>
          <Text style={styles.artilheiroTime}>{item.statistics[0]?.team?.name}</Text>
        </View>
      </View>
      <View style={styles.artilheiroGols}>
        <Ionicons name="football" size={14} color={theme.colors.secondary} />
        <Text style={styles.artilheiroGolsTexto}>{item.statistics[0]?.goals?.total}</Text>
      </View>
    </View>
  );
}

export default function DetalheCampeonatoScreen({ route, navigation }) {
  const { campeonato } = route.params;
  const [activeTab, setActiveTab] = useState('tabela');

  const tabs = [
    { key: 'tabela', title: 'Tabela' },
    { key: 'jogos', title: 'Jogos' },
    { key: 'artilharia', title: 'Artilharia' },
  ];

  const partidasDoCampeonato = PARTIDAS_MOCK.filter(
    p => p.league.id === campeonato.league.id
  );

  const renderContent = () => {
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
            <FlatList
              data={TABELA_MOCK}
              keyExtractor={(item) => item.rank.toString()}
              renderItem={({ item }) => (
                <TabelaRow 
                  item={item} 
                  onPressTime={(time) => navigation.navigate('DetalheTime', { time })}
                />
              )}
              scrollEnabled={false}
            />
            {/* Legenda */}
            <View style={styles.legenda}>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaCor, { backgroundColor: theme.colors.libertadores }]} />
                <Text style={styles.legendaTexto}>Libertadores</Text>
              </View>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaCor, { backgroundColor: theme.colors.sulAmericana }]} />
                <Text style={styles.legendaTexto}>Sul-Americana</Text>
              </View>
              <View style={styles.legendaItem}>
                <View style={[styles.legendaCor, { backgroundColor: theme.colors.rebaixamento }]} />
                <Text style={styles.legendaTexto}>Rebaixamento</Text>
              </View>
            </View>
          </View>
        );
      
      case 'jogos':
        return (
          <View style={styles.jogosContainer}>
            {partidasDoCampeonato.length > 0 ? (
              partidasDoCampeonato.map((partida) => (
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
            {ARTILHARIA_MOCK.map((item, index) => (
              <ArtilheiroItem key={item.atleta.atleta_id} item={item} posicao={index + 1} />
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.headerSubtitle}>{campeonato.country?.name || 'Internacional'}</Text>
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
  );
}

const styles = StyleSheet.create({
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
  },
});

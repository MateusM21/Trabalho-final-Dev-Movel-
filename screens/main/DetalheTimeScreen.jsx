import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { PARTIDAS_MOCK, ATLETAS_MOCK, isMatchScheduled } from '../../services/api';

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

// Componente de Jogador
function JogadorItem({ jogador, onPress }) {
  return (
    <TouchableOpacity style={styles.jogadorItem} onPress={onPress}>
      <View style={styles.jogadorAvatar}>
        {jogador.player.photo ? (
          <Image source={{ uri: jogador.player.photo }} style={styles.jogadorFoto} />
        ) : (
          <Ionicons name="person" size={24} color={theme.colors.textSecondary} />
        )}
      </View>
      <View style={styles.jogadorInfo}>
        <Text style={styles.jogadorNome}>{jogador.player.name}</Text>
        <Text style={styles.jogadorPosicao}>{jogador.player.position}</Text>
      </View>
      <View style={styles.jogadorNumero}>
        <Text style={styles.numeroText}>{jogador.player.number || '-'}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Componente de Partida
function PartidaItem({ partida, time, onPress }) {
  const isMandante = partida.teams.home.id === time.team.id;
  const adversario = isMandante ? partida.teams.away : partida.teams.home;
  const isScheduled = isMatchScheduled(partida.fixture.status.short);
  
  let resultado = '';
  let resultadoCor = theme.colors.textSecondary;
  
  if (!isScheduled) {
    const golsTime = isMandante ? partida.goals.home : partida.goals.away;
    const golsAdversario = isMandante ? partida.goals.away : partida.goals.home;
    
    if (golsTime > golsAdversario) {
      resultado = 'V';
      resultadoCor = theme.colors.success;
    } else if (golsTime < golsAdversario) {
      resultado = 'D';
      resultadoCor = theme.colors.error;
    } else {
      resultado = 'E';
      resultadoCor = theme.colors.warning;
    }
  }

  return (
    <TouchableOpacity style={styles.partidaItem} onPress={onPress}>
      <View style={styles.partidaData}>
        <Text style={styles.partidaDataText}>
          {new Date(partida.fixture.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })}
        </Text>
      </View>
      
      <View style={styles.partidaInfo}>
        <Text style={styles.localText}>{isMandante ? 'Casa' : 'Fora'}</Text>
        <View style={styles.adversarioContainer}>
          <View style={styles.adversarioEscudo}>
            {adversario.logo ? (
              <Image source={{ uri: adversario.logo }} style={styles.escudoPequeno} />
            ) : (
              <Ionicons name="shield" size={16} color={theme.colors.textSecondary} />
            )}
          </View>
          <Text style={styles.adversarioNome}>{adversario.name}</Text>
        </View>
      </View>
      
      <View style={styles.partidaResultado}>
        {isScheduled ? (
          <Text style={styles.horarioText}>
            {new Date(partida.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        ) : (
          <>
            <Text style={styles.placarText}>
              {isMandante 
                ? `${partida.goals.home} - ${partida.goals.away}`
                : `${partida.goals.away} - ${partida.goals.home}`
              }
            </Text>
            <View style={[styles.resultadoBadge, { backgroundColor: resultadoCor + '30' }]}>
              <Text style={[styles.resultadoText, { color: resultadoCor }]}>{resultado}</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function DetalheTimeScreen({ route, navigation }) {
  const { time } = route.params;
  const [activeTab, setActiveTab] = useState('info');
  const { user, toggleFavorito, isFavorito } = useAuth();

  const favorito = isFavorito('times', time.team.id);

  const handleFavorito = () => {
    if (user) {
      toggleFavorito('times', time);
    } else {
      // Poderia mostrar um alert pedindo login
    }
  };

  const tabs = [
    { key: 'info', title: 'Info' },
    { key: 'elenco', title: 'Elenco' },
    { key: 'jogos', title: 'Jogos' },
  ];

  // Filtrar partidas do time
  const partidasDoTime = PARTIDAS_MOCK.filter(
    p => p.teams.home.id === time.team.id || 
         p.teams.away.id === time.team.id
  );

  // Filtrar jogadores do time (usando o mock de atletas)
  const elenco = ATLETAS_MOCK.filter(
    atleta => atleta.statistics[0]?.team?.id === time.team.id
  );

  const proximaPartida = partidasDoTime.find(p => isMatchScheduled(p.fixture.status.short));

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nome Completo</Text>
                <Text style={styles.infoValue}>{time.team.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Código</Text>
                <Text style={styles.infoValue}>{time.team.code || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fundação</Text>
                <Text style={styles.infoValue}>{time.team.founded || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>País</Text>
                <Text style={styles.infoValue}>{time.team.country || '-'}</Text>
              </View>
            </View>

            {/* Próxima Partida */}
            <Text style={styles.sectionTitle}>Próxima Partida</Text>
            {proximaPartida ? (
              <PartidaItem
                partida={proximaPartida}
                time={time}
                onPress={() => navigation.navigate('DetalhePartida', { 
                  partida: proximaPartida 
                })}
              />
            ) : (
              <View style={styles.emptyMini}>
                <Text style={styles.emptyMiniText}>Nenhuma partida agendada</Text>
              </View>
            )}
          </View>
        );
      
      case 'elenco':
        return (
          <View style={styles.elencoContainer}>
            {elenco.length > 0 ? (
              elenco.map((jogador) => (
                <JogadorItem
                  key={jogador.player.id}
                  jogador={jogador}
                  onPress={() => navigation.navigate('DetalheAtleta', { atleta: jogador })}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={50} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Elenco não disponível</Text>
              </View>
            )}
          </View>
        );
      
      case 'jogos':
        return (
          <View style={styles.jogosContainer}>
            {partidasDoTime.length > 0 ? (
              partidasDoTime.map((partida) => (
                <PartidaItem
                  key={partida.fixture.id}
                  partida={partida}
                  time={time}
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
      
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header do Time */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.escudoGrande}>
            {time.team.logo ? (
              <Image source={{ uri: time.team.logo }} style={styles.escudo} />
            ) : (
              <Ionicons name="shield" size={60} color={theme.colors.textSecondary} />
            )}
          </View>
          <Text style={styles.headerTitle}>{time.team.name}</Text>
          <Text style={styles.headerSubtitle}>{time.team.code || time.team.country || ''}</Text>
        </View>
        
        {/* Botão Favorito */}
        {user && (
          <TouchableOpacity style={styles.favoritoButton} onPress={handleFavorito}>
            <Ionicons 
              name={favorito ? 'heart' : 'heart-outline'} 
              size={24} 
              color={favorito ? theme.colors.error : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
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
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
  },
  escudoGrande: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  escudo: {
    width: 75,
    height: 75,
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
  favoritoButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Info
  infoContainer: {
    padding: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },

  // Elenco
  elencoContainer: {
    padding: theme.spacing.md,
  },
  jogadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  jogadorAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  jogadorFoto: {
    width: 45,
    height: 45,
    borderRadius: 23,
  },
  jogadorInfo: {
    flex: 1,
  },
  jogadorNome: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  jogadorPosicao: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  jogadorNumero: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numeroText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },

  // Jogos
  jogosContainer: {
    padding: theme.spacing.md,
  },
  partidaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  partidaData: {
    width: 50,
    marginRight: theme.spacing.md,
  },
  partidaDataText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  partidaInfo: {
    flex: 1,
  },
  localText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  adversarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adversarioEscudo: {
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
  adversarioNome: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  partidaResultado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  placarText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  horarioText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.info,
    fontWeight: theme.fontWeight.medium,
  },
  resultadoBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultadoText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
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
  emptyMini: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyMiniText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
});

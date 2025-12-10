/**
 * DetalheAtletaScreen.jsx
 * 
 * Tela de detalhes de um jogador específico.
 * Exibe estatísticas, carreira e informações pessoais.
 * 
 * Funcionalidades:
 * - Informações pessoais (nacionalidade, idade, altura)
 * - Estatísticas da temporada (gols, assistências)
 * - Histórico de times (para lendas)
 * - Adicionar aos favoritos
 * 
 * APIs utilizadas:
 * - Football-Data.org: Detalhes do jogador
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { fetchPlayerDetails } from '../../services/api';

export default function DetalheAtletaScreen({ route, navigation }) {
  const { atleta } = route.params;
  const { user, toggleFavorito, isFavorito } = useAuth();

  const [playerDetails, setPlayerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const player = atleta.player;
  // Estatísticas vem direto do objeto atleta (de getTopScorers ou lendas)
  const goals = atleta.goals || atleta.numberOfGoals || 0;
  const assists = atleta.assists || 0;
  const penalties = atleta.penalties || atleta.statistics?.[0]?.penalties || 0;
  const playedMatches = atleta.playedMatches || 0;
  
  // Dados extras para lendas
  const formerTeams = atleta.formerTeams || null;
  const mainTitles = atleta.mainTitles || null;
  const titles = atleta.titles || 0;
  const goldenBoots = atleta.goldenBoots || 0;
  const ballonDor = atleta.ballonDor || 0;
  
  const favorito = isFavorito('atletas', player.id);

  // Buscar detalhes completos do jogador
  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoadingDetails(true);
        const teamName = atleta.team?.name || '';
        const details = await fetchPlayerDetails(player.name, teamName);
        if (details) {
          setPlayerDetails(details);
        }
      } catch (error) {
        console.log('Erro ao carregar detalhes:', error);
      } finally {
        setLoadingDetails(false);
      }
    };
    
    loadDetails();
  }, [player.name]);

  const handleFavorito = () => {
    // Agora funciona sem login - salva localmente via AsyncStorage
    toggleFavorito('atletas', atleta);
  };

  // Abrir rede social
  const openSocialMedia = (url) => {
    if (url) {
      let fullUrl = url;
      if (!url.startsWith('http')) {
        fullUrl = 'https://' + url;
      }
      Linking.openURL(fullUrl).catch(err => console.log('Erro ao abrir link:', err));
    }
  };

  // Formatar data de nascimento
  const formatBirthDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      {/* Header do Atleta */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {(player.photo || playerDetails?.photo) ? (
            <Image 
              source={{ uri: player.photo || playerDetails?.photo }} 
              style={styles.avatar} 
            />
          ) : (
            <Ionicons name="person" size={60} color={theme.colors.textSecondary} />
          )}
        </View>
        
        <Text style={styles.nome}>{player.name}</Text>
        
        {(player.position || playerDetails?.position) && (
          <View style={styles.posicaoBadge}>
            <Text style={styles.posicaoText}>{player.position || playerDetails?.position}</Text>
          </View>
        )}

        {/* Botão Favorito */}
        <TouchableOpacity style={styles.favoritoButton} onPress={handleFavorito}>
          <Ionicons 
            name={favorito ? 'heart' : 'heart-outline'} 
            size={24} 
            color={favorito ? theme.colors.error : theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Número da Camisa */}
      {(player.shirtNumber || playerDetails?.kitNumber) && (
        <View style={styles.numeroContainer}>
          <Text style={styles.numeroLabel}>Número</Text>
          <Text style={styles.numero}>{player.shirtNumber || playerDetails?.kitNumber}</Text>
        </View>
      )}

      {/* Carregando detalhes */}
      {loadingDetails && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      )}

      {/* Informações Básicas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="flag-outline" size={20} color={theme.colors.primary} />
              <View style={styles.infoTexto}>
                <Text style={styles.infoLabel}>Nacionalidade</Text>
                <Text style={styles.infoValue}>
                  {player.nationality || playerDetails?.nationality || '-'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <View style={styles.infoTexto}>
                <Text style={styles.infoLabel}>Idade</Text>
                <Text style={styles.infoValue}>{player.age || '-'} anos</Text>
              </View>
            </View>
          </View>

          {(player.dateOfBirth || playerDetails?.birthDate) && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="gift-outline" size={20} color={theme.colors.primary} />
                <View style={styles.infoTexto}>
                  <Text style={styles.infoLabel}>Nascimento</Text>
                  <Text style={styles.infoValue}>
                    {formatBirthDate(player.dateOfBirth || playerDetails?.birthDate)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {(player.height || playerDetails?.height) && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="resize-outline" size={20} color={theme.colors.primary} />
                <View style={styles.infoTexto}>
                  <Text style={styles.infoLabel}>Altura</Text>
                  <Text style={styles.infoValue}>{player.height || playerDetails?.height}</Text>
                </View>
              </View>
            </View>
          )}

          {(player.weight || playerDetails?.weight) && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="barbell-outline" size={20} color={theme.colors.primary} />
                <View style={styles.infoTexto}>
                  <Text style={styles.infoLabel}>Peso</Text>
                  <Text style={styles.infoValue}>{player.weight || playerDetails?.weight}</Text>
                </View>
              </View>
            </View>
          )}

          {playerDetails?.birthPlace && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
                <View style={styles.infoTexto}>
                  <Text style={styles.infoLabel}>Naturalidade</Text>
                  <Text style={styles.infoValue}>{playerDetails.birthPlace}</Text>
                </View>
              </View>
            </View>
          )}
          
          {atleta.team && atleta.team.isInApp !== false && (
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => navigation.navigate('DetalheTime', { time: { team: atleta.team } })}
            >
              <View style={styles.infoItem}>
                <View style={styles.timeEscudo}>
                  {atleta.team.crest ? (
                    <Image source={{ uri: atleta.team.crest }} style={styles.escudoPequeno} />
                  ) : (
                    <Ionicons name="shield" size={20} color={theme.colors.textSecondary} />
                  )}
                </View>
                <View style={styles.infoTexto}>
                  <Text style={styles.infoLabel}>Time Atual</Text>
                  <Text style={styles.infoValue}>{atleta.team.name}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Mostrar time atual sem link quando não está no app */}
          {atleta.team && atleta.team.isInApp === false && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <View style={styles.timeEscudo}>
                  {atleta.team.crest ? (
                    <Image source={{ uri: atleta.team.crest }} style={styles.escudoPequeno} />
                  ) : (
                    <Ionicons name="shield" size={20} color={theme.colors.textSecondary} />
                  )}
                </View>
                <View style={styles.infoTexto}>
                  <Text style={styles.infoLabel}>Time Atual</Text>
                  <Text style={styles.infoValue}>{atleta.team.name}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Estatísticas da Temporada */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas 2025</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="football" size={24} color={theme.colors.secondary} />
            <Text style={styles.statValue}>{goals}</Text>
            <Text style={styles.statLabel}>Gols</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="hand-right-outline" size={24} color={theme.colors.info} />
            <Text style={styles.statValue}>{assists}</Text>
            <Text style={styles.statLabel}>Assistências</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>{playedMatches}</Text>
            <Text style={styles.statLabel}>Jogos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="disc-outline" size={24} color={theme.colors.warning} />
            <Text style={styles.statValue}>{penalties}</Text>
            <Text style={styles.statLabel}>Pênaltis</Text>
          </View>
        </View>
      </View>

      {/* Títulos e Prêmios (Lendas) */}
      {(titles > 0 || goldenBoots > 0 || ballonDor > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Conquistas</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#FFD700' + '20' }]}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.statValue}>{titles}</Text>
              <Text style={styles.statLabel}>Títulos</Text>
            </View>
            {goldenBoots > 0 && (
              <View style={[styles.statCard, { backgroundColor: '#C9B037' + '20' }]}>
                <Ionicons name="football" size={24} color="#C9B037" />
                <Text style={styles.statValue}>{goldenBoots}</Text>
                <Text style={styles.statLabel}>Chuteiras de Ouro</Text>
              </View>
            )}
            {ballonDor > 0 && (
              <View style={[styles.statCard, { backgroundColor: '#FFD700' + '20' }]}>
                <Text style={{ fontSize: 24 }}>⚽</Text>
                <Text style={styles.statValue}>{ballonDor}</Text>
                <Text style={styles.statLabel}>Bola de Ouro</Text>
              </View>
            )}
          </View>
          {mainTitles && (
            <View style={styles.titlesCard}>
              <Text style={styles.titlesTitle}>Principais Títulos:</Text>
              <Text style={styles.titlesText}>{mainTitles}</Text>
            </View>
          )}
        </View>
      )}

      {/* Times Anteriores */}
      {(formerTeams || playerDetails?.formerTeams) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚽ Times Anteriores</Text>
          <View style={styles.infoCard}>
            <View style={styles.formerTeamsContainer}>
              <Ionicons name="football-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.formerTeamsText}>
                {formerTeams || playerDetails.formerTeams}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Redes Sociais */}
      {(playerDetails?.instagram || playerDetails?.twitter || playerDetails?.facebook) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes Sociais</Text>
          <View style={styles.socialContainer}>
            {playerDetails.instagram && (
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                onPress={() => openSocialMedia(playerDetails.instagram)}
              >
                <Ionicons name="logo-instagram" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
            {playerDetails.twitter && (
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
                onPress={() => openSocialMedia(playerDetails.twitter)}
              >
                <Ionicons name="logo-twitter" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
            {playerDetails.facebook && (
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                onPress={() => openSocialMedia(playerDetails.facebook)}
              >
                <Ionicons name="logo-facebook" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Descrição */}
      {playerDetails?.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText} numberOfLines={10}>
              {playerDetails.description}
            </Text>
          </View>
        </View>
      )}

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
    padding: theme.spacing.xl,
    alignItems: 'center',
    position: 'relative',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  nome: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  posicaoBadge: {
    backgroundColor: theme.colors.primary + '30',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  posicaoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
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
  numeroContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginTop: 1,
  },
  numeroLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  numero: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTexto: {
    marginLeft: theme.spacing.md,
  },
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  timeEscudo: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  escudoPequeno: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginVertical: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  cartao: {
    width: 18,
    height: 24,
    borderRadius: 2,
  },
  cartaoAmarelo: {
    backgroundColor: '#FFD700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginTop: 1,
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  formerTeamsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  formerTeamsText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  descriptionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  descriptionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  titlesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  titlesTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  titlesText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
});

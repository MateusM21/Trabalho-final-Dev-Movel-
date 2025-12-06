import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

export default function DetalheAtletaScreen({ route, navigation }) {
  const { atleta } = route.params;
  const { user, toggleFavorito, isFavorito } = useAuth();

  const player = atleta.player;
  const stats = atleta.statistics?.[0] || {};
  
  const favorito = isFavorito('atletas', player.id);

  const handleFavorito = () => {
    if (user) {
      toggleFavorito('atletas', atleta);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header do Atleta */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {player.photo ? (
            <Image source={{ uri: player.photo }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={60} color={theme.colors.textSecondary} />
          )}
        </View>
        
        <Text style={styles.nome}>{player.name}</Text>
        
        {player.position && (
          <View style={styles.posicaoBadge}>
            <Text style={styles.posicaoText}>{player.position}</Text>
          </View>
        )}

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

      {/* Número da Camisa */}
      {player.number && (
        <View style={styles.numeroContainer}>
          <Text style={styles.numeroLabel}>Número</Text>
          <Text style={styles.numero}>{player.number}</Text>
        </View>
      )}

      {/* Informações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="flag-outline" size={20} color={theme.colors.primary} />
              <View style={styles.infoTexto}>
                <Text style={styles.infoLabel}>Nacionalidade</Text>
                <Text style={styles.infoValue}>{player.nationality || 'Brasil'}</Text>
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
          
          {stats.team && (
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => navigation.navigate('DetalheTime', { time: { team: stats.team } })}
            >
              <View style={styles.infoItem}>
                <View style={styles.timeEscudo}>
                  {stats.team.logo ? (
                    <Image source={{ uri: stats.team.logo }} style={styles.escudoPequeno} />
                  ) : (
                    <Ionicons name="shield" size={20} color={theme.colors.textSecondary} />
                  )}
                </View>
                <View style={styles.infoTexto}>
                  <Text style={styles.infoLabel}>Time Atual</Text>
                  <Text style={styles.infoValue}>{stats.team.name}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Estatísticas da Temporada */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas 2025</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="football" size={24} color={theme.colors.secondary} />
            <Text style={styles.statValue}>{stats.goals?.total || 0}</Text>
            <Text style={styles.statLabel}>Gols</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="hand-right-outline" size={24} color={theme.colors.info} />
            <Text style={styles.statValue}>{stats.goals?.assists || 0}</Text>
            <Text style={styles.statLabel}>Assistências</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>{stats.games?.appearences || 0}</Text>
            <Text style={styles.statLabel}>Jogos</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.cartao, styles.cartaoAmarelo]} />
            <Text style={styles.statValue}>{stats.cards?.yellow || 0}</Text>
            <Text style={styles.statLabel}>Amarelos</Text>
          </View>
        </View>
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
});

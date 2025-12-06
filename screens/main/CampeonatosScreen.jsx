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
import { CAMPEONATOS_MOCK } from '../../services/api';

function CampeonatoItem({ campeonato, onPress }) {
  const league = campeonato.league;
  const seasons = campeonato.seasons || [];
  const currentSeason = seasons.find(s => s.current) || seasons[0];
  
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.logoContainer}>
        {league.logo ? (
          <Image source={{ uri: league.logo }} style={styles.logo} />
        ) : (
          <Ionicons name="trophy" size={35} color={theme.colors.secondary} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.nome}>{league.name}</Text>
        <Text style={styles.detalhes}>
          {campeonato.country?.name || 'Internacional'} • {league.type === 'League' ? 'Liga' : 'Copa'}
        </Text>
        <View style={[
          styles.statusBadge,
          currentSeason?.current ? styles.statusAtivo : styles.statusEncerrado
        ]}>
          <Text style={styles.statusText}>
            {currentSeason?.current ? 'Em andamento' : 'Encerrado'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function CampeonatosScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [campeonatos, setCampeonatos] = useState(CAMPEONATOS_MOCK);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={campeonatos}
        keyExtractor={(item) => item.league.id.toString()}
        renderItem={({ item }) => (
          <CampeonatoItem
            campeonato={item}
            onPress={() => navigation.navigate('DetalheCampeonato', { campeonato: item })}
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
            <Ionicons name="trophy-outline" size={60} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Nenhum campeonato encontrado</Text>
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
  listContent: {
    padding: theme.spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  logo: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  detalhes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusAtivo: {
    backgroundColor: theme.colors.primary + '30',
  },
  statusEncerrado: {
    backgroundColor: theme.colors.textMuted + '30',
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
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

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { TIMES_MOCK, getAllTeams } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function TimeItem({ time, onPress, isFavorito, onToggleFavorito }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.escudoContainer}>
        {time.team.logo ? (
          <Image source={{ uri: time.team.logo }} style={styles.escudo} />
        ) : (
          <Ionicons name="shield" size={35} color={theme.colors.textSecondary} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.nome}>{time.team.name}</Text>
        <Text style={styles.sigla}>
          {time.team.code || time.team.name?.substring(0, 3).toUpperCase()} • {time.team.country}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.favoritoBtn} 
        onPress={() => onToggleFavorito(time)}
      >
        <Ionicons 
          name={isFavorito ? "heart" : "heart-outline"} 
          size={24} 
          color={isFavorito ? theme.colors.primary : theme.colors.textMuted} 
        />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
}

// Agrupar times por país
function groupTimesByCountry(times) {
  const grouped = {};
  times.forEach(time => {
    const country = time.team.country || 'Outros';
    if (!grouped[country]) {
      grouped[country] = [];
    }
    grouped[country].push(time);
  });
  
  // Ordenar países (Brasil primeiro, depois Europa, depois resto)
  const ordem = ['Brazil', 'England', 'Spain', 'Italy', 'Germany', 'France'];
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const indexA = ordem.indexOf(a);
    const indexB = ordem.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
  
  return sortedKeys.map(country => ({
    title: country === 'Brazil' ? 'Brasil' : 
           country === 'England' ? 'Inglaterra' :
           country === 'Spain' ? 'Espanha' :
           country === 'Italy' ? 'Itália' :
           country === 'Germany' ? 'Alemanha' :
           country === 'France' ? 'França' : country,
    data: grouped[country],
  }));
}

export default function TimesScreen({ navigation }) {
  const { user, toggleFavorito, isFavorito } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [times, setTimes] = useState(TIMES_MOCK);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('country'); // 'all' ou 'country'

  // Carregar times da API ao montar
  useEffect(() => {
    loadTimes();
  }, []);

  const loadTimes = async () => {
    setLoading(true);
    try {
      const data = await getAllTeams();
      console.log('Times carregados:', data?.results);
      if (data?.response && data.response.length > 0) {
        setTimes(data.response);
      }
    } catch (error) {
      console.error('Erro ao carregar times:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTimes();
    setRefreshing(false);
  };

  const timesFiltrados = useMemo(() => {
    return times.filter(time =>
      time.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (time.team.code && time.team.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (time.team.country && time.team.country.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [times, searchQuery]);

  const timesAgrupados = useMemo(() => {
    return groupTimesByCountry(timesFiltrados);
  }, [timesFiltrados]);

  const handleToggleFavorito = async (time) => {
    // Agora funciona sem login - salva localmente via AsyncStorage
    await toggleFavorito('times', time);
  };

  const checkIsFavorito = (teamId) => {
    return isFavorito('times', teamId);
  };

  const renderTimeItem = ({ item }) => (
    <TimeItem
      time={item}
      onPress={() => navigation.navigate('DetalheTime', { time: item })}
      isFavorito={checkIsFavorito(item.team.id)}
      onToggleFavorito={handleToggleFavorito}
    />
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{timesAgrupados.find(s => s.title === title)?.data.length} times</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar time ou país..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading inicial */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando times...</Text>
          <Text style={styles.loadingSubtext}>Buscando times de todas as ligas</Text>
        </View>
      ) : (
        <>
          {/* Toggle de visualização */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'country' && styles.toggleBtnActive]}
              onPress={() => setViewMode('country')}
            >
              <Ionicons name="flag" size={16} color={viewMode === 'country' ? theme.colors.background : theme.colors.textSecondary} />
              <Text style={[styles.toggleText, viewMode === 'country' && styles.toggleTextActive]}>Por País</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, viewMode === 'all' && styles.toggleBtnActive]}
              onPress={() => setViewMode('all')}
            >
              <Ionicons name="list" size={16} color={viewMode === 'all' ? theme.colors.background : theme.colors.textSecondary} />
              <Text style={[styles.toggleText, viewMode === 'all' && styles.toggleTextActive]}>Todos</Text>
            </TouchableOpacity>
          </View>

          {/* Contador de times */}
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>{times.length} times disponíveis</Text>
          </View>

          {/* Dica de favoritos */}
          {user && (
            <View style={styles.tipContainer}>
              <Ionicons name="heart" size={14} color={theme.colors.primary} />
              <Text style={styles.tipText}>Toque no coração para selecionar seu time favorito</Text>
            </View>
          )}

          {viewMode === 'country' ? (
            <SectionList
              sections={timesAgrupados}
              keyExtractor={(item) => item.team.id.toString()}
              renderItem={renderTimeItem}
              renderSectionHeader={renderSectionHeader}
              contentContainerStyle={styles.listContent}
              stickySectionHeadersEnabled={true}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.colors.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="shield-outline" size={60} color={theme.colors.textMuted} />
                  <Text style={styles.emptyText}>Nenhum time encontrado</Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={timesFiltrados}
              keyExtractor={(item) => item.team.id.toString()}
              renderItem={renderTimeItem}
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
                  <Ionicons name="shield-outline" size={60} color={theme.colors.textMuted} />
                  <Text style={styles.emptyText}>Nenhum time encontrado</Text>
                </View>
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    marginLeft: theme.spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  toggleTextActive: {
    color: theme.colors.background,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  tipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  sectionCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
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
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  escudoContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  escudo: {
    width: 42,
    height: 42,
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
  sigla: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  favoritoBtn: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.xs,
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
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  loadingSubtext: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  counterContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  counterText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

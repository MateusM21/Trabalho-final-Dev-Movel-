/**
 * BuscaScreen.jsx
 * 
 * Tela de busca global do aplicativo.
 * Permite pesquisar times, campeonatos e atletas.
 * 
 * Funcionalidades:
 * - Busca unificada por nome
 * - Resultados categorizados por tipo
 * - Sugestões rápidas
 * - Navegação para detalhes
 * 
 * APIs utilizadas:
 * - Football-Data.org: Busca de times
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { searchTeams } from '../../services/api';
import { TIMES_MOCK, CAMPEONATOS_MOCK, ATLETAS_MOCK } from '../../services/mockData';

// Componente de Resultado
function ResultItem({ item, tipo, onPress }) {
  const getIcon = () => {
    switch (tipo) {
      case 'time':
        return item.team?.logo ? (
          <Image source={{ uri: item.team.logo }} style={styles.itemImage} />
        ) : (
          <Ionicons name="shield" size={24} color={theme.colors.textSecondary} />
        );
      case 'campeonato':
        return item.league?.logo ? (
          <Image source={{ uri: item.league.logo }} style={styles.itemImage} />
        ) : (
          <Ionicons name="trophy" size={24} color={theme.colors.secondary} />
        );
      case 'atleta':
        return item.player?.photo ? (
          <Image source={{ uri: item.player.photo }} style={styles.itemAvatar} />
        ) : (
          <Ionicons name="person" size={24} color={theme.colors.textSecondary} />
        );
      default:
        return null;
    }
  };

  const getTipoLabel = () => {
    switch (tipo) {
      case 'time': return 'Time';
      case 'campeonato': return 'Campeonato';
      case 'atleta': return 'Atleta';
      default: return '';
    }
  };

  const getNome = () => {
    if (tipo === 'time') return item.team?.name;
    if (tipo === 'campeonato') return item.league?.name;
    if (tipo === 'atleta') return item.player?.name;
    return '-';
  };

  return (
    <TouchableOpacity style={styles.resultItem} onPress={onPress}>
      <View style={styles.resultIcon}>{getIcon()}</View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{getNome()}</Text>
        <Text style={styles.resultType}>{getTipoLabel()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function BuscaScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounce para evitar muitas chamadas
  const debounceRef = React.useRef(null);

  const buscar = useCallback(async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setResultados([]);
      setBuscaRealizada(false);
      return;
    }

    // Limpar timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce de 300ms
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setBuscaRealizada(true);
      const termoBusca = query.toLowerCase().trim();

      try {
        // Buscar em times - primeiro os mocks, depois a API
        let times = TIMES_MOCK.filter(
          t => t.team?.name?.toLowerCase().includes(termoBusca) ||
               (t.team?.code && t.team.code.toLowerCase().includes(termoBusca)) ||
               (t.team?.country && t.team.country.toLowerCase().includes(termoBusca))
        ).map(t => ({ ...t, _tipo: 'time' }));

        // Se encontrou poucos resultados nos mocks, buscar na API
        if (times.length < 5) {
          try {
            const apiResult = await searchTeams(query);
            if (apiResult?.response) {
              // Adicionar times da API que não estão nos mocks
              apiResult.response.forEach(t => {
                if (!times.find(m => m.team?.id === t.team?.id)) {
                  times.push({ ...t, _tipo: 'time' });
                }
              });
            }
          } catch (err) {
            console.log('Erro na busca da API:', err);
          }
        }

        // Buscar em campeonatos
        const campeonatos = CAMPEONATOS_MOCK.filter(
          c => c.league?.name?.toLowerCase().includes(termoBusca) ||
               (c.league?.code && c.league.code.toLowerCase().includes(termoBusca)) ||
               (c.league?.country && c.league.country.toLowerCase().includes(termoBusca))
        ).map(c => ({ ...c, _tipo: 'campeonato' }));

        // Buscar em atletas
        const atletas = ATLETAS_MOCK.filter(
          a => a.player?.name?.toLowerCase().includes(termoBusca) ||
               (a.player?.nationality && a.player.nationality.toLowerCase().includes(termoBusca))
        ).map(a => ({ ...a, _tipo: 'atleta' }));

        // Ordenar times por relevância (nome começa com o termo primeiro)
        times.sort((a, b) => {
          const aStartsWith = a.team?.name?.toLowerCase().startsWith(termoBusca) ? 0 : 1;
          const bStartsWith = b.team?.name?.toLowerCase().startsWith(termoBusca) ? 0 : 1;
          return aStartsWith - bStartsWith;
        });

        setResultados([...times, ...campeonatos, ...atletas]);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handlePressItem = (item) => {
    switch (item._tipo) {
      case 'time':
        navigation.navigate('DetalheTime', { time: item });
        break;
      case 'campeonato':
        navigation.navigate('DetalheCampeonato', { campeonato: item });
        break;
      case 'atleta':
        navigation.navigate('DetalheAtleta', { atleta: item });
        break;
    }
  };

  const limparBusca = () => {
    setSearchQuery('');
    setResultados([]);
    setBuscaRealizada(false);
  };

  const getItemId = (item) => {
    if (item._tipo === 'time') return item.team?.id;
    if (item._tipo === 'campeonato') return item.league?.id;
    if (item._tipo === 'atleta') return item.player?.id;
    return Math.random().toString();
  };

  // Sugestões rápidas
  const sugestoes = [
    { label: 'Flamengo', tipo: 'time' },
    { label: 'Brasileirão', tipo: 'campeonato' },
    { label: 'Palmeiras', tipo: 'time' },
    { label: 'Libertadores', tipo: 'campeonato' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar times, campeonatos, atletas..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={buscar}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={limparBusca}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sugestões quando não há busca */}
      {!buscaRealizada && (
        <View style={styles.sugestoesContainer}>
          <Text style={styles.sugestoesTitle}>Sugestões de busca</Text>
          <View style={styles.sugestoesList}>
            {sugestoes.map((s, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sugestaoChip}
                onPress={() => buscar(s.label)}
              >
                <Text style={styles.sugestaoText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      )}

      {/* Resultados */}
      {buscaRealizada && !loading && (
        <>
          <Text style={styles.resultadosHeader}>
            {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'} para "{searchQuery}"
          </Text>
          
          <FlatList
            data={resultados}
            keyExtractor={(item, index) => `${item._tipo}-${getItemId(item) || index}`}
            renderItem={({ item }) => (
              <ResultItem
                item={item}
                tipo={item._tipo}
                onPress={() => handlePressItem(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={60} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Nenhum resultado encontrado</Text>
                <Text style={styles.emptySubtext}>Tente buscar por outro termo</Text>
              </View>
            }
          />
        </>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    marginLeft: theme.spacing.sm,
  },
  sugestoesContainer: {
    padding: theme.spacing.md,
  },
  sugestoesTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  sugestoesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sugestaoChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sugestaoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  resultadosHeader: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  resultIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  itemImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  itemAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  resultType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});

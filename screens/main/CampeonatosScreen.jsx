import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { CAMPEONATOS_ESTRUTURADOS } from '../../services/api';

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
          <Ionicons name="trophy" size={28} color={theme.colors.secondary} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.nome} numberOfLines={1}>{league.name}</Text>
        <Text style={styles.detalhes}>
          {league.type === 'League' ? 'Liga' : 'Copa'}
        </Text>
      </View>
      <View style={[
        styles.statusBadge,
        currentSeason?.current ? styles.statusAtivo : styles.statusEncerrado
      ]}>
        <View style={currentSeason?.current ? styles.activeDot : null} />
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
}

function SectionHeader({ title, icon, expanded, onToggle }) {
  return (
    <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
      <Ionicons name={icon} size={24} color={theme.colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <Ionicons 
        name={expanded ? "chevron-up" : "chevron-down"} 
        size={24} 
        color={theme.colors.textSecondary} 
      />
    </TouchableOpacity>
  );
}

function CountrySection({ pais, data, navigation, expanded, onToggle }) {
  return (
    <View style={styles.countrySection}>
      <TouchableOpacity style={styles.countryHeader} onPress={onToggle}>
        {data.flag ? (
          <Image source={{ uri: data.flag }} style={styles.countryFlag} />
        ) : (
          <Ionicons name="flag" size={20} color={theme.colors.textSecondary} />
        )}
        <Text style={styles.countryName}>{data.nome}</Text>
        <Text style={styles.countryCount}>{data.divisoes.length} competições</Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.colors.textSecondary} 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.divisoesList}>
          {data.divisoes.map((campeonato) => (
            <CampeonatoItem
              key={campeonato.league.id}
              campeonato={campeonato}
              onPress={() => navigation.navigate('DetalheCampeonato', { campeonato })}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function CampeonatosScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    continentais: true,
    nacionais: true,
  });
  const [expandedContinents, setExpandedContinents] = useState({
    europa: true,
    sulamericana: true,
  });
  const [expandedCountries, setExpandedCountries] = useState({
    brasil: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleContinent = (continent) => {
    setExpandedContinents(prev => ({
      ...prev,
      [continent]: !prev[continent]
    }));
  };

  const toggleCountry = (country) => {
    setExpandedCountries(prev => ({
      ...prev,
      [country]: !prev[country]
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
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
      {/* Competições Continentais */}
      <View style={styles.section}>
        <SectionHeader 
          title="Competições Continentais" 
          icon="globe-outline"
          expanded={expandedSections.continentais}
          onToggle={() => toggleSection('continentais')}
        />
        
        {expandedSections.continentais && (
          <View style={styles.sectionContent}>
            {Object.entries(CAMPEONATOS_ESTRUTURADOS.continentais).map(([key, data]) => (
              <View key={key} style={styles.continentSection}>
                <TouchableOpacity 
                  style={styles.continentHeader}
                  onPress={() => toggleContinent(key)}
                >
                  <Ionicons 
                    name={key === 'europa' ? 'earth' : 'globe'} 
                    size={18} 
                    color={theme.colors.secondary} 
                  />
                  <Text style={styles.continentName}>{data.nome}</Text>
                  <Ionicons 
                    name={expandedContinents[key] ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color={theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
                
                {expandedContinents[key] && (
                  <View style={styles.competicoesList}>
                    {data.competicoes.map((campeonato) => (
                      <CampeonatoItem
                        key={campeonato.league.id}
                        campeonato={campeonato}
                        onPress={() => navigation.navigate('DetalheCampeonato', { campeonato })}
                      />
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Competições Nacionais */}
      <View style={styles.section}>
        <SectionHeader 
          title="Competições Nacionais" 
          icon="flag-outline"
          expanded={expandedSections.nacionais}
          onToggle={() => toggleSection('nacionais')}
        />
        
        {expandedSections.nacionais && (
          <View style={styles.sectionContent}>
            {Object.entries(CAMPEONATOS_ESTRUTURADOS.nacionais).map(([key, data]) => (
              <CountrySection
                key={key}
                pais={key}
                data={data}
                navigation={navigation}
                expanded={expandedCountries[key] || false}
                onToggle={() => toggleCountry(key)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  sectionContent: {
    marginLeft: theme.spacing.sm,
  },
  continentSection: {
    marginBottom: theme.spacing.sm,
  },
  continentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  continentName: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  competicoesList: {
    marginLeft: theme.spacing.md,
  },
  countrySection: {
    marginBottom: theme.spacing.sm,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  countryFlag: {
    width: 24,
    height: 16,
    borderRadius: 2,
    resizeMode: 'cover',
  },
  countryName: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  countryCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginRight: theme.spacing.sm,
  },
  divisoesList: {
    marginLeft: theme.spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  detalhes: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusAtivo: {
    backgroundColor: theme.colors.success + '30',
  },
  statusEncerrado: {
    backgroundColor: theme.colors.textMuted + '30',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
});

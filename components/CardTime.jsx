/**
 * CardTime.jsx
 * 
 * Componente reutilizável para exibir informações de um time de futebol.
 * Mostra logo, nome, país e permite navegação para detalhes.
 * 
 * @component
 * @example
 * // Uso básico
 * <CardTime 
 *   time={{ id: 1, name: 'Flamengo', crest: 'url...' }}
 *   onPress={() => navigation.navigate('DetalheTime', { time })}
 * />
 * 
 * // Variante lista (horizontal)
 * <CardTime 
 *   time={timeData}
 *   variant="list"
 * />
 * 
 * // Com informações extras
 * <CardTime 
 *   time={timeData}
 *   showCountry={true}
 *   showStadium={true}
 * />
 * 
 * Props:
 * @param {object} time - Objeto com dados do time (id, name, crest, area, venue)
 * @param {function} onPress - Callback ao pressionar o card
 * @param {string} variant - Variante visual: 'card' | 'list' (default: 'card')
 * @param {boolean} showCountry - Mostrar país/bandeira (default: false)
 * @param {boolean} showStadium - Mostrar nome do estádio (default: false)
 * @param {boolean} isFavorite - Indica se é favorito (mostra ícone)
 * @param {object} style - Estilos adicionais
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../utils/theme';

export default function CardTime({
  time,
  onPress,
  variant = 'card',
  showCountry = false,
  showStadium = false,
  isFavorite = false,
  style = {},
}) {
  if (!time) return null;

  const isListVariant = variant === 'list';

  // Renderizar escudo do time
  const renderCrest = (size = 60) => (
    <View style={[styles.crestContainer, { width: size, height: size }]}>
      <Image
        source={{ uri: time.crest || time.logo || 'https://via.placeholder.com/60' }}
        style={[styles.crest, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );

  // Variante Card (vertical)
  if (!isListVariant) {
    return (
      <TouchableOpacity
        style={[styles.cardContainer, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Ícone de favorito */}
        {isFavorite && (
          <Ionicons 
            name="heart" 
            size={16} 
            color={theme.colors.live} 
            style={styles.favoriteIcon}
          />
        )}

        {renderCrest(60)}
        
        <Text style={styles.cardName} numberOfLines={2}>
          {time.shortName || time.name}
        </Text>

        {showCountry && time.area && (
          <View style={styles.countryContainer}>
            {time.area.flag && (
              <Image
                source={{ uri: time.area.flag }}
                style={styles.countryFlag}
                resizeMode="contain"
              />
            )}
            <Text style={styles.countryName} numberOfLines={1}>
              {time.area.name}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Variante List (horizontal)
  return (
    <TouchableOpacity
      style={[styles.listContainer, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {renderCrest(50)}

      <View style={styles.listInfo}>
        <Text style={styles.listName} numberOfLines={1}>
          {time.name}
        </Text>
        
        {showCountry && time.area && (
          <View style={styles.listCountry}>
            {time.area.flag && (
              <Image
                source={{ uri: time.area.flag }}
                style={styles.smallFlag}
                resizeMode="contain"
              />
            )}
            <Text style={styles.listCountryText}>{time.area.name}</Text>
          </View>
        )}

        {showStadium && time.venue && (
          <View style={styles.stadiumContainer}>
            <Ionicons name="location-outline" size={12} color={theme.colors.textMuted} />
            <Text style={styles.stadiumText} numberOfLines={1}>
              {time.venue}
            </Text>
          </View>
        )}
      </View>

      {/* Ícone de favorito */}
      {isFavorite && (
        <Ionicons 
          name="heart" 
          size={20} 
          color={theme.colors.live} 
          style={styles.listFavoriteIcon}
        />
      )}

      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={theme.colors.textMuted} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Variante Card
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: 120,
    marginHorizontal: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  crestContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  crest: {
    borderRadius: theme.borderRadius.sm,
  },
  cardName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  countryFlag: {
    width: 16,
    height: 12,
    marginRight: theme.spacing.xs,
  },
  countryName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  favoriteIcon: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
  },

  // Variante List
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  listName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  listCountry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  smallFlag: {
    width: 14,
    height: 10,
    marginRight: theme.spacing.xs,
  },
  listCountryText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  stadiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  stadiumText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  listFavoriteIcon: {
    marginRight: theme.spacing.sm,
  },
});

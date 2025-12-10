/**
 * SectionHeader.jsx
 * 
 * Componente reutilizável para cabeçalhos de seções.
 * Usado para separar e identificar diferentes seções de conteúdo.
 * 
 * @component
 * @example
 * // Uso básico
 * <SectionHeader title="Partidas de Hoje" />
 * 
 * // Com ícone
 * <SectionHeader 
 *   title="Ao Vivo" 
 *   icon="radio-outline"
 * />
 * 
 * // Com botão "Ver mais"
 * <SectionHeader 
 *   title="Próximas Partidas"
 *   actionText="Ver todas"
 *   onAction={() => navigation.navigate('Partidas')}
 * />
 * 
 * // Com contador
 * <SectionHeader 
 *   title="Resultados"
 *   count={15}
 * />
 * 
 * Props:
 * @param {string} title - Título da seção
 * @param {string} icon - Nome do ícone Ionicons (opcional)
 * @param {string} iconColor - Cor do ícone (default: theme.colors.primary)
 * @param {string} actionText - Texto do botão de ação (opcional)
 * @param {function} onAction - Callback do botão de ação
 * @param {number} count - Contador exibido ao lado do título (opcional)
 * @param {object} style - Estilos adicionais
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../utils/theme';

export default function SectionHeader({
  title,
  icon = null,
  iconColor = theme.colors.primary,
  actionText = null,
  onAction = null,
  count = null,
  style = {},
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={iconColor} 
            style={styles.icon}
          />
        )}
        <Text style={styles.title}>{title}</Text>
        {count !== null && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
      
      {actionText && onAction && (
        <TouchableOpacity 
          onPress={onAction}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.actionContainer}>
            <Text style={styles.actionText}>{actionText}</Text>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={theme.colors.primary} 
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  countBadge: {
    backgroundColor: theme.colors.primary + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.spacing.sm,
  },
  countText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
});

/**
 * EmptyState.jsx
 * 
 * Componente reutilizável para exibir estado vazio (sem dados).
 * Usado quando uma lista está vazia ou não há resultados de busca.
 * 
 * @component
 * @example
 * // Uso básico
 * <EmptyState message="Nenhuma partida encontrada" />
 * 
 * // Com ícone personalizado
 * <EmptyState 
 *   icon="football-outline"
 *   title="Sem partidas hoje"
 *   message="Não há jogos agendados para esta data"
 * />
 * 
 * // Com ação
 * <EmptyState 
 *   icon="search-outline"
 *   title="Nenhum resultado"
 *   message="Tente buscar com outros termos"
 *   actionText="Limpar busca"
 *   onAction={() => clearSearch()}
 * />
 * 
 * Props:
 * @param {string} icon - Nome do ícone Ionicons (default: 'folder-open-outline')
 * @param {string} title - Título principal (opcional)
 * @param {string} message - Mensagem descritiva
 * @param {string} actionText - Texto do botão de ação (opcional)
 * @param {function} onAction - Callback do botão de ação
 * @param {object} style - Estilos adicionais
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../utils/theme';

export default function EmptyState({
  icon = 'folder-open-outline',
  title = null,
  message = 'Nenhum item encontrado',
  actionText = null,
  onAction = null,
  style = {},
}) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons 
        name={icon} 
        size={64} 
        color={theme.colors.textMuted} 
      />
      
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
      
      <Text style={styles.message}>{message}</Text>
      
      {actionText && onAction && (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onAction}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    minHeight: 200,
  },
  title: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },
});

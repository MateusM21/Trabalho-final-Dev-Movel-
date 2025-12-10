/**
 * ErrorMessage.jsx
 * 
 * Componente reutilizável para exibir mensagens de erro.
 * Inclui ícone, mensagem e botão opcional para tentar novamente.
 * 
 * @component
 * @example
 * // Uso básico
 * <ErrorMessage message="Erro ao carregar dados" />
 * 
 * // Com botão de retry
 * <ErrorMessage 
 *   message="Falha na conexão" 
 *   onRetry={() => fetchData()} 
 * />
 * 
 * // Personalizado
 * <ErrorMessage 
 *   message="Nenhum resultado encontrado"
 *   icon="search-outline"
 *   type="info"
 * />
 * 
 * Props:
 * @param {string} message - Mensagem de erro a ser exibida
 * @param {function} onRetry - Callback para botão "Tentar novamente" (opcional)
 * @param {string} retryText - Texto do botão de retry (default: "Tentar novamente")
 * @param {string} icon - Nome do ícone Ionicons (default: 'alert-circle-outline')
 * @param {string} type - Tipo de mensagem: 'error' | 'warning' | 'info' (default: 'error')
 * @param {boolean} fullScreen - Se true, centraliza na tela inteira
 * @param {object} style - Estilos adicionais para o container
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../utils/theme';

export default function ErrorMessage({
  message,
  onRetry = null,
  retryText = 'Tentar novamente',
  icon = 'alert-circle-outline',
  type = 'error',
  fullScreen = false,
  style = {},
}) {
  // Definir cores baseado no tipo
  const getColor = () => {
    switch (type) {
      case 'warning':
        return '#FFA500'; // Laranja
      case 'info':
        return theme.colors.textSecondary;
      case 'error':
      default:
        return '#FF4444'; // Vermelho
    }
  };

  const iconColor = getColor();

  return (
    <View style={[
      styles.container,
      fullScreen && styles.fullScreen,
      style
    ]}>
      <Ionicons name={icon} size={48} color={iconColor} />
      <Text style={styles.message}>{message}</Text>
      
      {onRetry && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={18} color={theme.colors.white} />
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },
});

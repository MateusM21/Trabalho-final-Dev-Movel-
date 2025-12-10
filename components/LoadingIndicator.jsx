/**
 * LoadingIndicator.jsx
 * 
 * Componente reutilizável para exibir indicador de carregamento.
 * Pode ser usado em qualquer tela que precise mostrar estado de loading.
 * 
 * @component
 * @example
 * // Uso básico
 * <LoadingIndicator />
 * 
 * // Com texto personalizado
 * <LoadingIndicator text="Carregando partidas..." />
 * 
 * // Tamanho pequeno (para inline)
 * <LoadingIndicator size="small" />
 * 
 * // Em tela cheia
 * <LoadingIndicator fullScreen />
 * 
 * Props:
 * @param {string} size - Tamanho do indicador: 'small' | 'large' (default: 'large')
 * @param {string} text - Texto opcional exibido abaixo do spinner
 * @param {string} color - Cor do spinner (default: theme.colors.primary)
 * @param {boolean} fullScreen - Se true, centraliza na tela inteira
 * @param {object} style - Estilos adicionais para o container
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../utils/theme';

export default function LoadingIndicator({
  size = 'large',
  text = null,
  color = theme.colors.primary,
  fullScreen = false,
  style = {},
}) {
  return (
    <View style={[
      styles.container,
      fullScreen && styles.fullScreen,
      style
    ]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={styles.text}>{text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  text: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

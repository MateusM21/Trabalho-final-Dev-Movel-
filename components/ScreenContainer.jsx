/**
 * ScreenContainer.jsx
 * 
 * Container principal para telas que inclui SafeAreaView.
 * Garante que o conteúdo não seja cortado pelo notch ou barra de status.
 * Pode incluir header personalizado, loading e scroll.
 * 
 * @component
 * @example
 * // Uso básico
 * <ScreenContainer>
 *   <Text>Conteúdo da tela</Text>
 * </ScreenContainer>
 * 
 * // Com loading
 * <ScreenContainer loading={isLoading}>
 *   <Text>Conteúdo</Text>
 * </ScreenContainer>
 * 
 * // Com scroll
 * <ScreenContainer scroll>
 *   <Text>Conteúdo longo...</Text>
 * </ScreenContainer>
 * 
 * // Com header customizado
 * <ScreenContainer 
 *   headerTitle="Partidas"
 *   headerRight={<Icon name="search" />}
 * >
 *   <Text>Conteúdo</Text>
 * </ScreenContainer>
 * 
 * Props:
 * @param {ReactNode} children - Conteúdo da tela
 * @param {boolean} loading - Se true, mostra indicador de loading
 * @param {string} loadingText - Texto do loading (opcional)
 * @param {boolean} scroll - Se true, envolve conteúdo em ScrollView
 * @param {boolean} padded - Se true, adiciona padding ao conteúdo (default: true)
 * @param {string} backgroundColor - Cor de fundo (default: theme.colors.background)
 * @param {object} style - Estilos adicionais para o container
 * @param {object} contentStyle - Estilos adicionais para o conteúdo
 */

import React from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingIndicator from './LoadingIndicator';
import theme from '../utils/theme';

export default function ScreenContainer({
  children,
  loading = false,
  loadingText = null,
  scroll = false,
  padded = false,
  backgroundColor = theme.colors.background,
  style = {},
  contentStyle = {},
  refreshing = false,
  onRefresh = null,
}) {
  // Renderizar conteúdo
  const renderContent = () => {
    if (loading) {
      return <LoadingIndicator fullScreen text={loadingText} />;
    }

    if (scroll) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            padded && styles.paddedContent,
            contentStyle
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[
        styles.content, 
        padded && styles.paddedContent,
        contentStyle
      ]}>
        {children}
      </View>
    );
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor }, style]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={backgroundColor}
      />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  paddedContent: {
    padding: theme.spacing.md,
  },
});

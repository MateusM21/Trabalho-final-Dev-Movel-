/**
 * globalStyles.js
 * 
 * Estilos globais reutilizáveis em todo o aplicativo.
 * Centraliza estilos comuns para manter consistência visual
 * e reduzir duplicação de código.
 * 
 * Categorias:
 * - Layout: Containers, SafeArea, Flex
 * - Cards: Estilos de cartões
 * - Texto: Títulos, subtítulos, labels
 * - Botões: Primary, secondary, outline
 * - Inputs: Campos de busca, formulários
 * - Estados: Loading, empty, error
 * - Listas: Headers de seção, separadores
 */

import { StyleSheet } from 'react-native';
import theme from './theme';

/**
 * Estilos de layout e containers
 */
export const layoutStyles = StyleSheet.create({
  // Container seguro com SafeAreaView
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Container principal da tela
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Container centralizado
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  
  // Row com itens centralizados
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Row com espaço entre itens
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Espaçamento horizontal padrão
  paddingHorizontal: {
    paddingHorizontal: theme.spacing.md,
  },
  
  // Espaçamento vertical padrão
  paddingVertical: {
    paddingVertical: theme.spacing.md,
  },
  
  // Padding completo
  padding: {
    padding: theme.spacing.md,
  },
});

/**
 * Estilos de cards e superfícies
 */
export const cardStyles = StyleSheet.create({
  // Card básico
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  
  // Card com sombra
  cardElevated: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    ...theme.shadows.md,
  },
  
  // Card clicável (TouchableOpacity)
  cardTouchable: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  // Card de partida
  matchCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  // Card de time
  teamCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: 100,
    marginRight: theme.spacing.sm,
  },
});

/**
 * Estilos de texto
 */
export const textStyles = StyleSheet.create({
  // Título grande
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  
  // Título de seção
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  
  // Subtítulo
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  
  // Label
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  // Texto primário
  textPrimary: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  
  // Texto secundário
  textSecondary: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  // Texto muted
  textMuted: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  
  // Placar grande
  scoreText: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  
  // Nome do time
  teamName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});

/**
 * Estilos de botões
 */
export const buttonStyles = StyleSheet.create({
  // Botão primário
  primary: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  
  // Botão secundário
  secondary: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  secondaryText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
  },
  
  // Botão outline
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  outlineText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  
  // Chip/Tag
  chip: {
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  
  chipActive: {
    backgroundColor: theme.colors.primary,
  },
  
  chipText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  chipTextActive: {
    color: theme.colors.white,
  },
});

/**
 * Estilos de inputs
 */
export const inputStyles = StyleSheet.create({
  // Container de busca
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 45,
  },
  
  // Input de busca
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
  },
  
  // Input de formulário
  formInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
  },
});

/**
 * Estilos de estados (loading, empty, error)
 */
export const stateStyles = StyleSheet.create({
  // Container de loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  
  // Container vazio
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  emptySubtext: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  
  // Container de erro
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
});

/**
 * Estilos de listas e seções
 */
export const listStyles = StyleSheet.create({
  // Header de seção
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  
  // Separador
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  
  // Espaço inferior para scroll
  bottomSpace: {
    height: 30,
  },
});

/**
 * Estilos de badges e indicadores
 */
export const badgeStyles = StyleSheet.create({
  // Badge ao vivo
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.live,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.xs,
  },
  
  liveText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  
  // Badge de status
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  // Favorito
  favoriteBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.colors.overlay,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
  },
});

/**
 * Estilos de imagens e avatares
 */
export const imageStyles = StyleSheet.create({
  // Escudo pequeno (30x30)
  escudoSmall: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  
  // Escudo médio (40x40)
  escudoMedium: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  
  // Escudo grande (60x60)
  escudoLarge: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  
  // Avatar de jogador
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surfaceLight,
  },
  
  // Avatar grande
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surfaceLight,
  },
});

/**
 * Estilos de tabs
 */
export const tabStyles = StyleSheet.create({
  // Container de tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  
  // Tab individual
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  
  tabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  
  tabTextActive: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
  },
});

/**
 * Estilos de header
 */
export const headerStyles = StyleSheet.create({
  // Header de tela
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  
  // Header com conteúdo
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  
  // Título do header
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  
  // Subtítulo do header
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

// Export default com todos os estilos
export default {
  layout: layoutStyles,
  card: cardStyles,
  text: textStyles,
  button: buttonStyles,
  input: inputStyles,
  state: stateStyles,
  list: listStyles,
  badge: badgeStyles,
  image: imageStyles,
  tab: tabStyles,
  header: headerStyles,
};

// Tema do aplicativo de futebol
export const theme = {
  // Cores principais
  colors: {
    // Fundo
    background: '#0D1117',
    surface: '#161B22',
    surfaceLight: '#21262D',
    
    // Primária (Verde do campo)
    primary: '#238636',
    primaryLight: '#2EA043',
    primaryDark: '#1A7F37',
    
    // Secundária (Dourado/Amarelo)
    secondary: '#F0B429',
    secondaryLight: '#F5C748',
    secondaryDark: '#D9A21B',
    
    // Texto
    textPrimary: '#F0F6FC',
    textSecondary: '#8B949E',
    textMuted: '#6E7681',
    
    // Estados
    success: '#238636',
    error: '#F85149',
    warning: '#D29922',
    info: '#58A6FF',
    
    // Partida ao vivo
    live: '#FF4444',
    
    // Posições na tabela
    libertadores: '#238636',
    sulAmericana: '#58A6FF',
    rebaixamento: '#F85149',
    
    // Outros
    inactive: '#484F58',
    border: '#30363D',
    overlay: 'rgba(0, 0, 0, 0.7)',
    white: '#FFFFFF',
    black: '#000000',
  },
  
  // Espaçamentos
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border Radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Tamanhos de fonte
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export default theme;

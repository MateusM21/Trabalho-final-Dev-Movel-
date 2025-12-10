/**
 * index.js
 * 
 * Exportação centralizada de utilitários e estilos.
 * Permite importar tema e estilos de um único lugar.
 * 
 * @example
 * import { theme, globalStyles } from '../utils';
 * // ou
 * import { layoutStyles, cardStyles } from '../utils/globalStyles';
 */

// Tema do aplicativo
export { default as theme } from './theme';

// Estilos globais
export { default as globalStyles } from './globalStyles';

// Estilos individuais para uso direto
export {
  layoutStyles,
  cardStyles,
  textStyles,
  buttonStyles,
  inputStyles,
  stateStyles,
  listStyles,
  badgeStyles,
  imageStyles,
  tabStyles,
  headerStyles,
} from './globalStyles';

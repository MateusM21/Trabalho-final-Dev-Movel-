/**
 * index.js
 * 
 * Arquivo de exportação centralizada de todos os componentes reutilizáveis.
 * Permite importar múltiplos componentes de uma só vez.
 * 
 * @example
 * // Importar componentes individuais
 * import { LoadingIndicator, ErrorMessage, CardPartida } from '../components';
 * 
 * // Ou importar todos
 * import * as Components from '../components';
 * <Components.LoadingIndicator />
 */

// Componentes de UI/Feedback
export { default as LoadingIndicator } from './LoadingIndicator';
export { default as ErrorMessage } from './ErrorMessage';
export { default as EmptyState } from './EmptyState';

// Componentes de Layout
export { default as ScreenContainer } from './ScreenContainer';
export { default as SectionHeader } from './SectionHeader';

// Componentes de Cards
export { default as CardPartida } from './CardPartida';
export { default as CardTime } from './CardTime';

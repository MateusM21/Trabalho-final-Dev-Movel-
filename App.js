// Importe isso no TOPO, obrigatório para o Stack Navigator
import 'react-native-gesture-handler'; 

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { RootNavigator } from './navigation/AppNavigator';

/**
 * App.js - Componente raiz do aplicativo FanFoot
 * 
 * Este é o ponto de entrada principal do aplicativo.
 * Configura os providers necessários:
 * 
 * - SafeAreaProvider: Garante que o conteúdo respeite as áreas seguras
 *   do dispositivo (notch, barra de status, etc.)
 * 
 * - AuthProvider: Gerencia o estado de autenticação do usuário,
 *   favoritos e preferências usando AsyncStorage
 * 
 * - NavigationContainer: Container principal do React Navigation
 *   que gerencia o estado de navegação
 * 
 * - StatusBar: Configura a barra de status para tema escuro
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Contexto de autenticação
import { useAuth } from '../context/AuthContext';

// Telas de Autenticação
import LoginScreen from '../screens/auth/LoginScreen';
import CadastroScreen from '../screens/auth/CadastroScreen';

// Telas Principais
import HomeScreen from '../screens/main/HomeScreen';
import CampeonatosScreen from '../screens/main/CampeonatosScreen';
import DetalheCampeonatoScreen from '../screens/main/DetalheCampeonatoScreen';
import PartidasScreen from '../screens/main/PartidasScreen';
import DetalhePartidaScreen from '../screens/main/DetalhePartidaScreen';
import TimesScreen from '../screens/main/TimesScreen';
import DetalheTimeScreen from '../screens/main/DetalheTimeScreen';
import DetalheAtletaScreen from '../screens/main/DetalheAtletaScreen';
import PerfilScreen from '../screens/main/PerfilScreen';
import BuscaScreen from '../screens/main/BuscaScreen';

// Tema
import theme from '../utils/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Configurações comuns de header
const defaultScreenOptions = {
  headerStyle: { 
    backgroundColor: theme.colors.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTintColor: theme.colors.textPrimary,
  headerTitleStyle: { 
    fontWeight: '600',
    fontSize: 18,
  },
  headerBackTitleVisible: false,
  cardStyle: { backgroundColor: theme.colors.background },
};

// Stack de Autenticação
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
    </Stack.Navigator>
  );
}

// Stack da Home
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DetalheCampeonato" 
        component={DetalheCampeonatoScreen}
        options={({ route }) => ({
          title: route.params?.campeonato?.nome || 'Campeonato',
        })}
      />
      <Stack.Screen 
        name="DetalhePartida" 
        component={DetalhePartidaScreen}
        options={{ title: 'Partida' }}
      />
      <Stack.Screen 
        name="DetalheTime" 
        component={DetalheTimeScreen}
        options={({ route }) => ({
          title: route.params?.time?.nome_popular || 'Time',
        })}
      />
      <Stack.Screen 
        name="DetalheAtleta" 
        component={DetalheAtletaScreen}
        options={({ route }) => ({
          title: route.params?.atleta?.nome_popular || 'Atleta',
        })}
      />
      <Stack.Screen 
        name="Busca" 
        component={BuscaScreen}
        options={{ title: 'Buscar' }}
      />
    </Stack.Navigator>
  );
}

// Stack de Campeonatos
function CampeonatosStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen 
        name="CampeonatosList" 
        component={CampeonatosScreen}
        options={{ title: 'Campeonatos' }}
      />
      <Stack.Screen 
        name="DetalheCampeonato" 
        component={DetalheCampeonatoScreen}
        options={({ route }) => ({
          title: route.params?.campeonato?.nome || 'Campeonato',
        })}
      />
      <Stack.Screen 
        name="DetalhePartida" 
        component={DetalhePartidaScreen}
        options={{ title: 'Partida' }}
      />
      <Stack.Screen 
        name="DetalheTime" 
        component={DetalheTimeScreen}
        options={({ route }) => ({
          title: route.params?.time?.nome_popular || 'Time',
        })}
      />
      <Stack.Screen 
        name="DetalheAtleta" 
        component={DetalheAtletaScreen}
        options={({ route }) => ({
          title: route.params?.atleta?.nome_popular || 'Atleta',
        })}
      />
    </Stack.Navigator>
  );
}

// Stack de Partidas
function PartidasStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen 
        name="PartidasList" 
        component={PartidasScreen}
        options={{ title: 'Partidas' }}
      />
      <Stack.Screen 
        name="DetalhePartida" 
        component={DetalhePartidaScreen}
        options={{ title: 'Partida' }}
      />
      <Stack.Screen 
        name="DetalheTime" 
        component={DetalheTimeScreen}
        options={({ route }) => ({
          title: route.params?.time?.nome_popular || 'Time',
        })}
      />
      <Stack.Screen 
        name="DetalheAtleta" 
        component={DetalheAtletaScreen}
        options={({ route }) => ({
          title: route.params?.atleta?.nome_popular || 'Atleta',
        })}
      />
    </Stack.Navigator>
  );
}

// Stack de Times
function TimesStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen 
        name="TimesList" 
        component={TimesScreen}
        options={{ title: 'Times' }}
      />
      <Stack.Screen 
        name="DetalheTime" 
        component={DetalheTimeScreen}
        options={({ route }) => ({
          title: route.params?.time?.nome_popular || 'Time',
        })}
      />
      <Stack.Screen 
        name="DetalhePartida" 
        component={DetalhePartidaScreen}
        options={{ title: 'Partida' }}
      />
      <Stack.Screen 
        name="DetalheAtleta" 
        component={DetalheAtletaScreen}
        options={({ route }) => ({
          title: route.params?.atleta?.nome_popular || 'Atleta',
        })}
      />
    </Stack.Navigator>
  );
}

// Stack de Perfil
function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen 
        name="PerfilScreen" 
        component={PerfilScreen}
        options={{ title: 'Perfil' }}
      />
      <Stack.Screen 
        name="DetalheTime" 
        component={DetalheTimeScreen}
        options={({ route }) => ({
          title: route.params?.time?.nome_popular || 'Time',
        })}
      />
      <Stack.Screen 
        name="DetalheCampeonato" 
        component={DetalheCampeonatoScreen}
        options={({ route }) => ({
          title: route.params?.campeonato?.nome || 'Campeonato',
        })}
      />
      <Stack.Screen 
        name="DetalheAtleta" 
        component={DetalheAtletaScreen}
        options={({ route }) => ({
          title: route.params?.atleta?.nome_popular || 'Atleta',
        })}
      />
      <Stack.Screen 
        name="DetalhePartida" 
        component={DetalhePartidaScreen}
        options={{ title: 'Partida' }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Tab Navigator Principal
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Campeonatos':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Partidas':
              iconName = focused ? 'football' : 'football-outline';
              break;
            case 'Times':
              iconName = focused ? 'shield' : 'shield-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ tabBarLabel: 'Início' }}
      />
      <Tab.Screen 
        name="Campeonatos" 
        component={CampeonatosStack}
      />
      <Tab.Screen 
        name="Partidas" 
        component={PartidasStack}
      />
      <Tab.Screen 
        name="Times" 
        component={TimesStack}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilStack}
      />
    </Tab.Navigator>
  );
}

// Navegador Raiz
export function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainApp" component={MainTabs} />
      <Stack.Screen name="Auth" component={AuthStack} />
    </Stack.Navigator>
  );
}

// Exportação para compatibilidade
export { MainTabs as RootDrawer };
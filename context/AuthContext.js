import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

// Chaves do AsyncStorage
const STORAGE_KEYS = {
  USER: '@FutebolApp:user',
  USERS: '@FutebolApp:users',
  FAVORITOS: '@FutebolApp:favoritos', // Favoritos locais (sem login)
  PREFERENCIAS: '@FutebolApp:preferencias', // Preferências de exibição
};

// Estrutura padrão de favoritos e preferências
const DEFAULT_FAVORITOS = {
  times: [],
  campeonatos: [],
  atletas: [],
};

const DEFAULT_PREFERENCIAS = {
  ligaFavorita: null, // Código da liga favorita (BSA, PL, etc.)
  timeFavorito: null, // ID do time favorito
  filtroJogos: 'todos', // 'todos', 'liga_favorita', 'time_favorito'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState(DEFAULT_FAVORITOS);
  const [preferencias, setPreferencias] = useState(DEFAULT_PREFERENCIAS);

  // Carregar dados ao iniciar
  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      // Carregar usuário (se houver login)
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Se tem usuário logado, usar favoritos dele
        setFavoritos(userData.favoritos || DEFAULT_FAVORITOS);
      } else {
        // Se não tem login, carregar favoritos locais
        const storedFavoritos = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITOS);
        if (storedFavoritos) {
          setFavoritos(JSON.parse(storedFavoritos));
        }
      }

      // Carregar preferências (independente de login)
      const storedPreferencias = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCIAS);
      if (storedPreferencias) {
        setPreferencias(JSON.parse(storedPreferencias));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  // Cadastrar novo usuário
  async function signUp(nome, email, senha) {
    try {
      const newUser = {
        id: Date.now().toString(),
        nome,
        email,
        favoritos: favoritos, // Usar favoritos locais existentes
        createdAt: new Date().toISOString(),
      };

      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const usersList = users ? JSON.parse(users) : [];
      
      if (usersList.find(u => u.email === email)) {
        throw new Error('Este email já está cadastrado');
      }

      usersList.push({ ...newUser, senha });
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      setUser(newUser);

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  // Login
  async function signIn(email, senha) {
    try {
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const usersList = users ? JSON.parse(users) : [];

      const foundUser = usersList.find(u => u.email === email && u.senha === senha);
      
      if (!foundUser) {
        throw new Error('Email ou senha incorretos');
      }

      const { senha: _, ...userWithoutPassword } = foundUser;
      
      // Mesclar favoritos locais com favoritos do usuário
      const mergedFavoritos = {
        times: [...new Set([...(foundUser.favoritos?.times || []), ...favoritos.times])],
        campeonatos: [...new Set([...(foundUser.favoritos?.campeonatos || []), ...favoritos.campeonatos])],
        atletas: [...new Set([...(foundUser.favoritos?.atletas || []), ...favoritos.atletas])],
      };

      userWithoutPassword.favoritos = mergedFavoritos;
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      setFavoritos(mergedFavoritos);

      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async function signOut() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
      // Manter favoritos locais após logout
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // Helper para obter o ID de um item
  function getItemId(item, tipo) {
    if (tipo === 'times') return item.team?.id;
    if (tipo === 'campeonatos') return item.league?.id || item.league?.code;
    if (tipo === 'atletas') return item.player?.id;
    return null;
  }

  // Atualizar favoritos (funciona com ou sem login)
  async function toggleFavorito(tipo, item) {
    try {
      const updatedFavoritos = { ...favoritos };
      const lista = [...updatedFavoritos[tipo]];
      const itemId = getItemId(item, tipo);
      
      const index = lista.findIndex(f => getItemId(f, tipo) === itemId);

      if (index >= 0) {
        lista.splice(index, 1);
      } else {
        lista.push(item);
      }

      updatedFavoritos[tipo] = lista;

      if (user) {
        // Se tem login, salvar no usuário
        const updatedUser = { ...user, favoritos: updatedFavoritos };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        
        // Atualizar na lista de usuários
        const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
        const usersList = users ? JSON.parse(users) : [];
        const userIndex = usersList.findIndex(u => u.id === user.id);
        if (userIndex >= 0) {
          usersList[userIndex] = { ...usersList[userIndex], favoritos: updatedFavoritos };
          await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
        }
        setUser(updatedUser);
      } else {
        // Se não tem login, salvar localmente
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITOS, JSON.stringify(updatedFavoritos));
      }

      setFavoritos(updatedFavoritos);
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
    }
  }

  // Verificar se é favorito
  function isFavorito(tipo, itemId) {
    if (!favoritos) return false;
    const lista = favoritos[tipo] || [];
    return lista.some(f => getItemId(f, tipo) === itemId);
  }

  // Atualizar preferências (funciona sem login)
  async function updatePreferencias(novasPreferencias) {
    try {
      const updated = { ...preferencias, ...novasPreferencias };
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCIAS, JSON.stringify(updated));
      setPreferencias(updated);
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
    }
  }

  // Definir liga favorita
  async function setLigaFavorita(ligaCode) {
    await updatePreferencias({ ligaFavorita: ligaCode });
  }

  // Definir time favorito
  async function setTimeFavorito(timeId) {
    await updatePreferencias({ timeFavorito: timeId });
  }

  // Definir filtro de jogos
  async function setFiltroJogos(filtro) {
    await updatePreferencias({ filtroJogos: filtro });
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        favoritos,
        preferencias,
        signUp,
        signIn,
        signOut,
        toggleFavorito,
        isFavorito,
        updatePreferencias,
        setLigaFavorita,
        setTimeFavorito,
        setFiltroJogos,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

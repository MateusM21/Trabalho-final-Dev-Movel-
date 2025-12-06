import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário salvo ao iniciar
  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const storedUser = await AsyncStorage.getItem('@FutebolApp:user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  }

  // Cadastrar novo usuário
  async function signUp(nome, email, senha) {
    try {
      // Em produção, isso seria uma chamada à API
      const newUser = {
        id: Date.now().toString(),
        nome,
        email,
        favoritos: {
          times: [],
          campeonatos: [],
          atletas: [],
        },
        createdAt: new Date().toISOString(),
      };

      // Salvar no AsyncStorage (simulando banco de dados)
      const users = await AsyncStorage.getItem('@FutebolApp:users');
      const usersList = users ? JSON.parse(users) : [];
      
      // Verificar se email já existe
      if (usersList.find(u => u.email === email)) {
        throw new Error('Este email já está cadastrado');
      }

      usersList.push({ ...newUser, senha });
      await AsyncStorage.setItem('@FutebolApp:users', JSON.stringify(usersList));
      
      // Fazer login automático
      await AsyncStorage.setItem('@FutebolApp:user', JSON.stringify(newUser));
      setUser(newUser);

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  // Login
  async function signIn(email, senha) {
    try {
      const users = await AsyncStorage.getItem('@FutebolApp:users');
      const usersList = users ? JSON.parse(users) : [];

      const foundUser = usersList.find(u => u.email === email && u.senha === senha);
      
      if (!foundUser) {
        throw new Error('Email ou senha incorretos');
      }

      const { senha: _, ...userWithoutPassword } = foundUser;
      
      await AsyncStorage.setItem('@FutebolApp:user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);

      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async function signOut() {
    try {
      await AsyncStorage.removeItem('@FutebolApp:user');
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // Helper para obter o ID de um item no novo formato API-Football
  function getItemId(item, tipo) {
    if (tipo === 'times') return item.team?.id;
    if (tipo === 'campeonatos') return item.league?.id;
    if (tipo === 'atletas') return item.player?.id;
    return null;
  }

  // Atualizar favoritos
  async function toggleFavorito(tipo, item) {
    try {
      if (!user) return;

      const updatedFavoritos = { ...user.favoritos };
      const lista = updatedFavoritos[tipo];
      const itemId = getItemId(item, tipo);
      
      const index = lista.findIndex(f => getItemId(f, tipo) === itemId);

      if (index >= 0) {
        lista.splice(index, 1);
      } else {
        lista.push(item);
      }

      const updatedUser = { ...user, favoritos: updatedFavoritos };
      
      // Atualizar no storage
      await AsyncStorage.setItem('@FutebolApp:user', JSON.stringify(updatedUser));
      
      // Atualizar na lista de usuários
      const users = await AsyncStorage.getItem('@FutebolApp:users');
      const usersList = users ? JSON.parse(users) : [];
      const userIndex = usersList.findIndex(u => u.id === user.id);
      if (userIndex >= 0) {
        usersList[userIndex] = { ...usersList[userIndex], favoritos: updatedFavoritos };
        await AsyncStorage.setItem('@FutebolApp:users', JSON.stringify(usersList));
      }

      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
    }
  }

  // Verificar se é favorito
  function isFavorito(tipo, itemId) {
    if (!user || !user.favoritos) return false;
    const lista = user.favoritos[tipo];
    return lista.some(f => getItemId(f, tipo) === itemId);
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signUp,
        signIn,
        signOut,
        toggleFavorito,
        isFavorito,
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

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

// Componente de item favorito
function FavoritoItem({ item, tipo, onPress, onRemove }) {
  const getIcon = () => {
    switch (tipo) {
      case 'times':
        return item.team?.logo ? (
          <Image source={{ uri: item.team.logo }} style={styles.itemEscudo} />
        ) : (
          <Ionicons name="shield" size={24} color={theme.colors.textSecondary} />
        );
      case 'campeonatos':
        return item.league?.logo ? (
          <Image source={{ uri: item.league.logo }} style={styles.itemEscudo} />
        ) : (
          <Ionicons name="trophy" size={24} color={theme.colors.secondary} />
        );
      case 'atletas':
        return item.player?.photo ? (
          <Image source={{ uri: item.player.photo }} style={styles.itemAvatar} />
        ) : (
          <Ionicons name="person" size={24} color={theme.colors.textSecondary} />
        );
      default:
        return null;
    }
  };

  const getNome = () => {
    if (tipo === 'times') return item.team?.name || '-';
    if (tipo === 'campeonatos') return item.league?.name || '-';
    if (tipo === 'atletas') return item.player?.name || '-';
    return '-';
  };

  return (
    <TouchableOpacity style={styles.favoritoItem} onPress={onPress}>
      <View style={styles.favoritoIcon}>{getIcon()}</View>
      <Text style={styles.favoritoNome} numberOfLines={1}>{getNome()}</Text>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Ionicons name="heart" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// Seção de favoritos
function FavoritosSection({ titulo, icone, items, tipo, onPressItem, onRemoveItem }) {
  if (!items || items.length === 0) return null;

  const getItemId = (item, tipo) => {
    if (tipo === 'times') return item.team?.id;
    if (tipo === 'campeonatos') return item.league?.id;
    if (tipo === 'atletas') return item.player?.id;
    return Math.random().toString();
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icone} size={20} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>{titulo}</Text>
        <Text style={styles.sectionCount}>{items.length}</Text>
      </View>
      {items.map((item, index) => (
        <FavoritoItem
          key={getItemId(item, tipo) || index}
          item={item}
          tipo={tipo}
          onPress={() => onPressItem(item, tipo)}
          onRemove={() => onRemoveItem(item, tipo)}
        />
      ))}
    </View>
  );
}

export default function PerfilScreen({ navigation }) {
  const { user, signOut, toggleFavorito } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handlePressItem = (item, tipo) => {
    switch (tipo) {
      case 'times':
        navigation.navigate('DetalheTime', { time: item });
        break;
      case 'campeonatos':
        navigation.navigate('DetalheCampeonato', { campeonato: item });
        break;
      case 'atletas':
        navigation.navigate('DetalheAtleta', { atleta: item });
        break;
    }
  };

  const getNome = (item, tipo) => {
    if (tipo === 'times') return item.team?.name;
    if (tipo === 'campeonatos') return item.league?.name;
    if (tipo === 'atletas') return item.player?.name;
    return 'este item';
  };

  const handleRemoveItem = (item, tipo) => {
    Alert.alert(
      'Remover favorito',
      `Deseja remover ${getNome(item, tipo)} dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive', 
          onPress: () => toggleFavorito(tipo, item) 
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.containerCentered}>
        <View style={styles.notLoggedContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-outline" size={60} color={theme.colors.textMuted} />
          </View>
          <Text style={styles.notLoggedTitle}>Faça login para continuar</Text>
          <Text style={styles.notLoggedText}>
            Crie uma conta para salvar seus times, campeonatos e atletas favoritos
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Cadastro')}
          >
            <Text style={styles.registerButtonText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalFavoritos = 
    (user.favoritos?.times?.length || 0) + 
    (user.favoritos?.campeonatos?.length || 0) + 
    (user.favoritos?.atletas?.length || 0);

  return (
    <ScrollView style={styles.container}>
      {/* Header do Perfil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.nome?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user.nome}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalFavoritos}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.favoritos?.times?.length || 0}</Text>
            <Text style={styles.statLabel}>Times</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.favoritos?.atletas?.length || 0}</Text>
            <Text style={styles.statLabel}>Atletas</Text>
          </View>
        </View>
      </View>

      {/* Favoritos */}
      <View style={styles.favoritosContainer}>
        <Text style={styles.favoritosTitle}>⭐ Meus Favoritos</Text>
        
        {totalFavoritos === 0 ? (
          <View style={styles.emptyFavoritos}>
            <Ionicons name="heart-outline" size={50} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Você ainda não tem favoritos</Text>
            <Text style={styles.emptySubtext}>
              Explore times, campeonatos e atletas para adicionar aos seus favoritos
            </Text>
          </View>
        ) : (
          <>
            <FavoritosSection
              titulo="Times"
              icone="shield-outline"
              items={user.favoritos?.times}
              tipo="times"
              onPressItem={handlePressItem}
              onRemoveItem={handleRemoveItem}
            />
            <FavoritosSection
              titulo="Campeonatos"
              icone="trophy-outline"
              items={user.favoritos?.campeonatos}
              tipo="campeonatos"
              onPressItem={handlePressItem}
              onRemoveItem={handleRemoveItem}
            />
            <FavoritosSection
              titulo="Atletas"
              icone="person-outline"
              items={user.favoritos?.atletas}
              tipo="atletas"
              onPressItem={handlePressItem}
              onRemoveItem={handleRemoveItem}
            />
          </>
        )}
      </View>

      {/* Opções */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="settings-outline" size={22} color={theme.colors.textPrimary} />
          <Text style={styles.optionText}>Configurações</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
          <Text style={styles.optionText}>Notificações</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionItem}>
          <Ionicons name="help-circle-outline" size={22} color={theme.colors.textPrimary} />
          <Text style={styles.optionText}>Ajuda</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.optionItem, styles.logoutItem]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
          <Text style={[styles.optionText, styles.logoutText]}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Espaço inferior */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  containerCentered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
  notLoggedContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  notLoggedTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  notLoggedText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  registerButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    alignItems: 'center',
  },
  registerButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  userEmail: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.border,
  },
  favoritosContainer: {
    padding: theme.spacing.md,
  },
  favoritosTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  emptyFavoritos: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  sectionCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  favoritoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  favoritoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  itemEscudo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  itemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  favoritoNome: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  optionsContainer: {
    padding: theme.spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  optionText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.md,
  },
  logoutItem: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.error + '10',
  },
  logoutText: {
    color: theme.colors.error,
  },
});

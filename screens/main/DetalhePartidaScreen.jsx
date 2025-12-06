import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';
import { isMatchLive, isMatchFinished, isMatchScheduled } from '../../services/api';

export default function DetalhePartidaScreen({ route, navigation }) {
  const { partida } = route.params;
  const isLive = isMatchLive(partida.fixture.status.short);
  const isFinished = isMatchFinished(partida.fixture.status.short);
  const isScheduled = isMatchScheduled(partida.fixture.status.short);

  // Dados mockados de eventos
  const eventos = [
    { minuto: 15, tipo: 'gol', time: 'mandante', jogador: 'Jogador 1' },
    { minuto: 32, tipo: 'cartao_amarelo', time: 'visitante', jogador: 'Jogador 2' },
    { minuto: 45, tipo: 'gol', time: 'visitante', jogador: 'Jogador 3' },
    { minuto: 67, tipo: 'gol', time: 'mandante', jogador: 'Jogador 4' },
  ];

  const getEventoIcon = (tipo) => {
    switch (tipo) {
      case 'gol':
        return <Ionicons name="football" size={18} color={theme.colors.primary} />;
      case 'cartao_amarelo':
        return <View style={[styles.cartao, styles.cartaoAmarelo]} />;
      case 'cartao_vermelho':
        return <View style={[styles.cartao, styles.cartaoVermelho]} />;
      case 'substituicao':
        return <Ionicons name="swap-horizontal" size={18} color={theme.colors.info} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header com placar */}
      <View style={styles.header}>
        <View style={styles.campeonatoInfo}>
          <Text style={styles.campeonatoNome}>{partida.league.name}</Text>
          <Text style={styles.rodadaText}>{partida.league.round}</Text>
        </View>

        {isLive && (
          <View style={styles.liveContainer}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>AO VIVO</Text>
            </View>
            {partida.fixture.status.elapsed && (
              <Text style={styles.tempoJogo}>{partida.fixture.status.elapsed}'</Text>
            )}
          </View>
        )}

        <View style={styles.placarContainer}>
          {/* Time Mandante */}
          <TouchableOpacity 
            style={styles.timeContainer}
            onPress={() => navigation.navigate('DetalheTime', { 
              time: { team: partida.teams.home } 
            })}
          >
            <View style={styles.escudoGrande}>
              {partida.teams.home.logo ? (
                <Image source={{ uri: partida.teams.home.logo }} style={styles.escudo} />
              ) : (
                <Ionicons name="shield" size={40} color={theme.colors.textSecondary} />
              )}
            </View>
            <Text style={styles.timeNome}>{partida.teams.home.name}</Text>
          </TouchableOpacity>

          {/* Placar Central */}
          <View style={styles.placarCentral}>
            {isScheduled ? (
              <>
                <Text style={styles.placarHora}>
                  {new Date(partida.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.placarData}>
                  {new Date(partida.fixture.date).toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </>
            ) : (
              <View style={styles.placarNumeros}>
                <Text style={[styles.placarNumero, isLive && styles.placarLive]}>
                  {partida.goals.home}
                </Text>
                <Text style={styles.placarSeparador}>-</Text>
                <Text style={[styles.placarNumero, isLive && styles.placarLive]}>
                  {partida.goals.away}
                </Text>
              </View>
            )}
          </View>

          {/* Time Visitante */}
          <TouchableOpacity 
            style={styles.timeContainer}
            onPress={() => navigation.navigate('DetalheTime', { 
              time: { team: partida.teams.away } 
            })}
          >
            <View style={styles.escudoGrande}>
              {partida.teams.away.logo ? (
                <Image source={{ uri: partida.teams.away.logo }} style={styles.escudo} />
              ) : (
                <Ionicons name="shield" size={40} color={theme.colors.textSecondary} />
              )}
            </View>
            <Text style={styles.timeNome}>{partida.teams.away.name}</Text>
          </TouchableOpacity>
        </View>

        {/* Status/Info */}
        {isFinished && <Text style={styles.finalizadoText}>Partida Encerrada</Text>}
      </View>

      {/* Estádio */}
      {partida.fixture.venue?.name && (
        <View style={styles.infoCard}>
          <Ionicons name="location" size={20} color={theme.colors.primary} />
          <View style={styles.infoTexto}>
            <Text style={styles.infoLabel}>Estádio</Text>
            <Text style={styles.infoValor}>{partida.fixture.venue.name}</Text>
          </View>
        </View>
      )}

      {/* Timeline de Eventos */}
      {(isLive || isFinished) && eventos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eventos da Partida</Text>
          <View style={styles.timeline}>
            {eventos.map((evento, index) => (
              <View 
                key={index} 
                style={[
                  styles.eventoItem,
                  evento.time === 'visitante' && styles.eventoVisitante
                ]}
              >
                {evento.time === 'mandante' && (
                  <>
                    <View style={styles.eventoInfo}>
                      <Text style={styles.eventoJogador}>{evento.jogador}</Text>
                      {getEventoIcon(evento.tipo)}
                    </View>
                    <Text style={styles.eventoMinuto}>{evento.minuto}'</Text>
                  </>
                )}
                {evento.time === 'visitante' && (
                  <>
                    <Text style={styles.eventoMinuto}>{evento.minuto}'</Text>
                    <View style={styles.eventoInfo}>
                      {getEventoIcon(evento.tipo)}
                      <Text style={styles.eventoJogador}>{evento.jogador}</Text>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Estatísticas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>
        <View style={styles.statsContainer}>
          {[
            { label: 'Posse de Bola', mandante: '55%', visitante: '45%' },
            { label: 'Finalizações', mandante: '12', visitante: '8' },
            { label: 'Escanteios', mandante: '6', visitante: '3' },
            { label: 'Faltas', mandante: '10', visitante: '14' },
          ].map((stat, index) => (
            <View key={index} style={styles.statRow}>
              <Text style={styles.statValue}>{stat.mandante}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.visitante}</Text>
            </View>
          ))}
        </View>
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
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  campeonatoInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  campeonatoNome: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  rodadaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  liveContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.live + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.live,
    marginRight: theme.spacing.xs,
  },
  liveText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.live,
  },
  tempoJogo: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.live,
    marginTop: theme.spacing.xs,
  },
  placarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  escudoGrande: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  escudo: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
  timeNome: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  placarCentral: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  placarNumeros: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placarNumero: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  placarLive: {
    color: theme.colors.live,
  },
  placarSeparador: {
    fontSize: 36,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  placarHora: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  placarData: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  finalizadoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  infoTexto: {
    marginLeft: theme.spacing.md,
  },
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  infoValor: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  section: {
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  timeline: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  eventoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  eventoVisitante: {
    justifyContent: 'flex-end',
  },
  eventoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  eventoJogador: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  eventoMinuto: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.bold,
    marginHorizontal: theme.spacing.md,
    minWidth: 35,
    textAlign: 'center',
  },
  cartao: {
    width: 14,
    height: 18,
    borderRadius: 2,
  },
  cartaoAmarelo: {
    backgroundColor: '#FFD700',
  },
  cartaoVermelho: {
    backgroundColor: '#FF0000',
  },
  statsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    width: 50,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
});

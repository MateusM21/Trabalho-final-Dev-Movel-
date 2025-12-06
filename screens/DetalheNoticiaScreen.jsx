import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DetalheNoticiaScreen({ route, navigation }) {
  const { noticia } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: noticia.titulo,
      // O estilo do header já vem do AppNavigator, mas podemos sobrescrever
      headerTitleStyle: { color: '#E0E0E0' },
    });
  }, [navigation, noticia]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.categoria}>{noticia.categoria}</Text>
      <Text style={styles.titulo}>{noticia.titulo}</Text>
      <Text style={styles.conteudo}>{noticia.conteudoCompleto}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Cor de Fundo
    padding: 16,
  },
  categoria: {
    fontSize: 14,
    color: '#FF6600', // Cor Primária (Laranja)
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E0E0', // Texto Primário
    marginBottom: 16,
  },
  conteudo: {
    fontSize: 16,
    color: '#E0E0E0', // Texto Primário (para boa legibilidade)
    lineHeight: 24,
  },
});
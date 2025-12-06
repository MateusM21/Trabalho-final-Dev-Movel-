import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

// Adicionamos 'imageUrl' às props
export default function CardNoticia({ titulo, resumo, categoria, imageUrl, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Imagem da Notícia */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
      />
      
      {/* Container para o texto */}
      <View style={styles.contentContainer}>
        {/* Tag de Categoria */}
        <View style={styles.tagContainer}>
          <Text style={styles.categoria}>{categoria}</Text>
        </View>
        
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.resumo}>{resumo}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E', // Cor da Superfície
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 16,
    borderColor: '#333',
    borderWidth: 1,
    overflow: 'hidden', // Para a imagem não vazar das bordas arredondadas
  },
  image: {
    width: '100%',
    height: 180, // Altura fixa para a imagem
  },
  contentContainer: {
    padding: 16, // Adicionamos o padding aqui
  },
  tagContainer: {
    backgroundColor: '#FF6600', // Cor Primária (Laranja)
    borderRadius: 12, // Arredondado
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start', // Faz o "pill" se ajustar ao texto
    marginBottom: 10, // Espaço abaixo da tag
  },
  categoria: {
    fontSize: 12,
    color: '#FFFFFF', // Texto branco
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0', // Texto Primário (Branco suave)
    marginBottom: 6,
  },
  resumo: {
    fontSize: 14,
    color: '#A0A0A0', // Texto Secundário (Cinza claro)
    lineHeight: 20, // Melhor legibilidade
  },
});
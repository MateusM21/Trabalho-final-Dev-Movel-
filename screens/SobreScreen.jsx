import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function SobreScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Imagem */}
      <Image
        source={require('../assets/news-icon.png')} // Usando o ícone que você forneceu
        style={styles.image}
      />
      
      {/* Nome Fictício */}
      <Text style={styles.title}>Portal Quasar</Text>
      
      {/* Descrição Fictícia (LINHA DO ERRO REMOVIDA) */}
      <Text style={styles.description}>
        Bem-vindo ao Portal Quasar, sua fonte de notícias intergaláctica.
      </Text>
      <Text style={styles.description}>
        Nossa missão é trazer as informações mais rápidas e precisas do universo da tecnologia e dos esportes, diretamente para a palma da sua mão.
      </Text>

      {/* Informações Fictícias Adicionais */}
      <View style={styles.list}>
        <Text style={styles.listItem}>Desenvolvido por: Lira Technologies</Text>
        <Text style={styles.listItem}>Versão do App: 1.0.0 (Nebula)</Text>
      </View>

      <Text style={styles.slogan}>
        "Conectando você ao futuro, hoje."
      </Text>

      {/* Botão de Voltar */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('RootNoticias')} // Volta para a tela de Notícias
      >
        <Text style={styles.buttonText}>VOLTAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212', // Cor de Fundo (Dark)
  },
  image: {
    width: 120, // Ajustei o tamanho
    height: 120, // Ajustei o tamanho
    resizeMode: 'contain',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24, // Aumentei o título
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF6600', // Cor Primária (Laranja)
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#E0E0E0', // Texto Primário (Branco suave)
    paddingHorizontal: 10,
  },
  list: {
    alignSelf: 'stretch', // Ocupar a largura
    backgroundColor: '#1E1E1E', // Cor de Superfície
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  listItem: {
    fontSize: 15,
    color: '#A0A0A0', // Texto Secundário (Cinza claro)
    lineHeight: 22,
  },
  slogan: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#A0A0A0', // Texto Secundário
    marginBottom: 'auto', // Empurra o botão para baixo
  },
  button: {
    backgroundColor: '#FF6600', // Cor Primária (Laranja)
    paddingVertical: 12,
    paddingHorizontal: 120, 
    borderRadius: 8,
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF', // Texto do botão (Branco)
    fontSize: 16,
    fontWeight: 'bold',
  },
});
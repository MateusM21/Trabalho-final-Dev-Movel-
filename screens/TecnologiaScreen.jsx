import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import CardNoticia from '../components/CardNoticia';
import { TECNOLOGIA_NOTICIAS } from '../noticias';

// Esta tela exibe a lista de notícias de tecnologia
export default function TecnologiaScreen({ navigation }) {
  
  const renderItem = ({ item }) => (
    <CardNoticia
      titulo={item.titulo}
      resumo={item.resumo}
      categoria={item.categoria}
      imageUrl={item.imageUrl} // <-- ADICIONE ESTA LINHA
      onPress={() => navigation.navigate('Detalhes', { noticia: item })} 
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={TECNOLOGIA_NOTICIAS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Cor de Fundo
  },
});
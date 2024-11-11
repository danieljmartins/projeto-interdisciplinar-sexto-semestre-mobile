import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, Modal, ActivityIndicator, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [selectedLora, setSelectedLora] = useState();
  const [negativePrompt, setNegativePrompt] = useState('');
  const [positivePrompt, setPositivePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Novo estado para armazenar a imagem selecionada

  const handleLoadImage = async () => {
    // Solicitar permissão para acessar a galeria de imagens
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permissão de acesso à galeria necessária!");
      return;
    }

    // Abrir o seletor de imagens
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    // Verificar se o usuário não cancelou a seleção
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); // Armazena o URI da imagem selecionada
      console.log('Imagem selecionada:', result.assets[0].uri);
    }
  };

  const handleGenerateImage = () => {
    console.log('Gerando nova imagem com prompts:');
    console.log('Prompt Negativo:', negativePrompt);
    console.log('Prompt Positivo:', positivePrompt);

    setLoading(true);
    setImageGenerated(false);

    // Fecha o carregamento e exibe a imagem após 1 segundo
    setTimeout(() => {
      setLoading(false);
      setImageGenerated(true); // Mostra a imagem gerada
    }, 1000);
  };

  const handleBackToHome = () => {
    setImageGenerated(false); // Retorna para a tela inicial
    setSelectedImage(null); // Limpa a imagem selecionada ao voltar
  };

  return (
    <View style={styles.container}>
      {!imageGenerated ? (
        <>
          <Image
            source={require('./media/logo.png')}
            style={styles.logo}
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedLora}
              onValueChange={(itemValue) => setSelectedLora(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma Lora" value="" />
              <Picker.Item label="Lora 1" value="lora1" />
              <Picker.Item label="Lora 2" value="lora2" />
              <Picker.Item label="Lora 3" value="lora3" />
            </Picker>
          </View>

          <View style={styles.buttonUploadImage}>
            <Button title="Selecione sua imagem" onPress={handleLoadImage} color="#FF4500" />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Prompt Positivo"
            placeholderTextColor="#888"
            value={positivePrompt}
            onChangeText={setPositivePrompt}
          />

          <TextInput
            style={styles.input}
            placeholder="Prompt Negativo"
            placeholderTextColor="#888"
            value={negativePrompt}
            onChangeText={setNegativePrompt}
          />

          <View style={styles.buttonContainer}>
            <Button title="Gerar Nova Imagem" onPress={handleGenerateImage} color="#FF4500" />
          </View>
        </>
      ) : (
        <>
          <Image
            source={require('./media/gabrieldepois.jpeg')}
            style={styles.generatedImage}
          />
          <View style={styles.buttonContainer}>
            <Button title="Salvar Imagem" color="#FF4500" />
            <View style={styles.spaceBetweenButtons} />
            <Button title="Voltar para Tela Inicial" onPress={handleBackToHome} color="#FF4500" />
          </View>
        </>
      )}

      <StatusBar style="light" />

      {/* Modal de Carregamento */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={loading}
        onRequestClose={() => setLoading(false)}
      >
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Gerando imagem...</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3dbe0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    backgroundColor: '#e0e6ed',
  },
  buttonUploadImage: {
    width: '100%',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 90,
    backgroundColor: '#e0e6ed',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 20,
    fontSize: 18,
  },
  generatedImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  spaceBetweenButtons: {
    height: 20, // Ajuste a altura conforme necessário
  },
});

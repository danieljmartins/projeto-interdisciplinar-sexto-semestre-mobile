import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, Modal, ActivityIndicator, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [negativePrompt, setNegativePrompt] = useState('');
  const [positivePrompt, setPositivePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [temporaryId, setTemporaryId] = useState(null);

  const handleLoadImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permissão de acesso à galeria necessária!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      console.log('Imagem selecionada:', result.assets[0].uri);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedImage || !positivePrompt || !negativePrompt) {
      alert("Preencha todos os campos antes de gerar a imagem.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      const fileUri = selectedImage;
      const fileName = fileUri.split('/').pop();

      // Criação do arquivo para o FormData
      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      formData.append("photo", {
        uri: fileUri,
        name: fileName,
        type: "image/jpeg",
      });
      formData.append("positivePrompt", positivePrompt);
      formData.append("negativePrompt", negativePrompt);

      const tempId = uuidv4();
      setTemporaryId(tempId);

      const response = await fetch(`http://localhost:8080/customers/${tempId}`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.ok) {
        console.log("Imagem enviada com sucesso!");
        // Buscar imagem gerada
        const fetchResponse = await fetch(`http://localhost:8080/customers/${tempId}`);
        const data = await fetchResponse.json();

        if (fetchResponse.ok && data.photos && data.photos.length > 0) {
          setGeneratedImage(data.photos[0]);
          setImageGenerated(true);
        } else {
          alert("Erro ao buscar a imagem gerada.");
        }
      } else {
        alert("Erro ao enviar a imagem.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setImageGenerated(false);
    setSelectedImage(null);
    setGeneratedImage(null);
  };

  return (
    <View style={styles.container}>
      {!imageGenerated ? (
        <>
          <Image
            source={require('./media/logo.png')}
            style={styles.logo}
          />

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
          {generatedImage && (
            <Image
              source={{ uri: generatedImage }}
              style={styles.generatedImage}
            />
          )}
          <View style={styles.buttonContainer}>
            <Button title="Salvar Imagem" color="#FF4500" />
            <View style={styles.spaceBetweenButtons} />
            <Button title="Voltar para Tela Inicial" onPress={handleBackToHome} color="#FF4500" />
          </View>
        </>
      )}

      <StatusBar style="light" />

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
    height: 20,
  },
});

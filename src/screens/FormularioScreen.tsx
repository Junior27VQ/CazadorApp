import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function FormularioScreen({ route, navigation }: any) {
  const db = useSQLiteContext();

  const idEdicion = route.params?.idEdicion;
  const tituloActual = route.params?.tituloActual || '';
  const calificacionActual = route.params?.calificacionActual?.toString() || '';
  const comentariosActuales = route.params?.comentariosActuales || '';
  const fotoActual = route.params?.fotoActual || '';

  const [titulo, setTitulo] = useState(tituloActual);
  const [calificacion, setCalificacion] = useState(calificacionActual);
  const [comentarios, setComentarios] = useState(comentariosActuales);
  const [fotoBase64, setFotoBase64] = useState(fotoActual);

  const tomarFoto = async () => {
    const permisoCamara = await ImagePicker.requestCameraPermissionsAsync();
    if (!permisoCamara.granted) {
      Alert.alert("Permiso requerido", "Se necesitan permisos para acceder a la cámara.");
      return;
    }

    let resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], 
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!resultado.canceled && resultado.assets[0].base64) {
      const base64Uri = `data:image/jpeg;base64,${resultado.assets[0].base64}`;
      setFotoBase64(base64Uri);
    }
  };

  const seleccionarFotoGaleria = async () => {
    const permisoGaleria = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permisoGaleria.granted) {
      Alert.alert("Permiso requerido", "Se necesitan permisos para acceder a la galería.");
      return;
    }

    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!resultado.canceled && resultado.assets[0].base64) {
      const base64Uri = `data:image/jpeg;base64,${resultado.assets[0].base64}`;
      setFotoBase64(base64Uri);
    }
  };

  const guardarRegistro = async () => {
    if (!titulo.trim() || !calificacion.trim() || !comentarios.trim()) {
      Alert.alert("Campos incompletos", "Por favor llena todos los campos obligatorios.");
      return;
    }

    const califNum = parseInt(calificacion, 10);
    if (isNaN(califNum) || califNum < 1 || califNum > 5) {
      Alert.alert("Calificación inválida", "Ingresa un número entero entre 1 y 5.");
      return;
    }

    if (!fotoBase64) {
      Alert.alert("Imagen requerida", "Por favor selecciona o toma una foto para el registro.");
      return;
    }

    try {
      if (idEdicion) {
        await db.runAsync(
          `UPDATE registros SET titulo = ?, calificacion = ?, comentarios = ?, fotoBase64 = ? WHERE id = ?;`,
          [titulo, califNum, comentarios, fotoBase64, idEdicion]
        );
      } else {
        const fechaHoy = new Date().toLocaleDateString();
        await db.runAsync(
          `INSERT INTO registros (titulo, calificacion, comentarios, fotoBase64, fecha) VALUES (?, ?, ?, ?, ?);`,
          [titulo, califNum, comentarios, fotoBase64, fechaHoy]
        );
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error al guardar el registro:", error);
      Alert.alert("Error", "No se pudo guardar el registro en la base de datos.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Título del Plato / Sabor</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Encebollado tradicional"
        placeholderTextColor="#999"
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.label}>Calificación (1 al 5)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 5"
        placeholderTextColor="#999"
        keyboardType="numeric"
        maxLength={1}
        value={calificacion}
        onChangeText={setCalificacion}
      />

      <Text style={styles.label}>Comentarios / Reseña</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Escribe tus impresiones..."
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        value={comentarios}
        onChangeText={setComentarios}
      />

      <Text style={styles.label}>Fotografía</Text>
      <View style={styles.imageButtonsContainer}>
        <TouchableOpacity style={styles.imagePickerButton} onPress={tomarFoto}>
          <Ionicons name="camera" size={20} color="#007AFF" />
          <Text style={styles.imagePickerText}>Cámara</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.imagePickerButton} onPress={seleccionarFotoGaleria}>
          <Ionicons name="images" size={20} color="#007AFF" />
          <Text style={styles.imagePickerText}>Galería</Text>
        </TouchableOpacity>
      </View>

      {fotoBase64 ? (
        <Image source={{ uri: fotoBase64 }} style={styles.previewImage} />
      ) : null}

      <TouchableOpacity style={styles.saveButton} onPress={guardarRegistro}>
        <Ionicons name="checkmark-sharp" size={24} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.saveButtonText}>Guardar Registro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  imagePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#90caf9',
    marginHorizontal: 4,
  },
  imagePickerText: {
    marginLeft: 6,
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
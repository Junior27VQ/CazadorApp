import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

interface Registro {
  id: number;
  titulo: string;
  calificacion: number;
  comentarios: string;
  fotoBase64: string;
  fecha: string;
}

export default function ListaScreen({ navigation }: any) {
  const db = useSQLiteContext();
  const [registros, setRegistros] = useState<Registro[]>([]);

  const cargarRegistros = async () => {
    try {
      const allRows = await db.getAllAsync<Registro>('SELECT * FROM registros ORDER BY id DESC;');
      setRegistros(allRows);
    } catch (error) {
      console.error('Error al cargar registros:', error);
    }
  };

  const eliminarRegistro = async (id: number) => {
    Alert.alert(
      "Eliminar Registro",
      "¿Estás seguro de que deseas eliminar este elemento?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM registros WHERE id = ?;', [id]);
              cargarRegistros(); 
            } catch (error) {
              console.error('Error al eliminar el registro:', error);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarRegistros();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.fotoBase64 ? (
              <Image source={{ uri: item.fotoBase64 }} style={styles.image} />
            ) : null}
            
            <View style={styles.infoContainer}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              
              <View style={styles.calificacionContainer}>
                <Ionicons name="star" size={14} color="#f1c40f" />
                <Text style={styles.calificacionText}>{item.calificacion} / 5</Text>
              </View>

              <Text style={styles.comentarios} numberOfLines={2}>{item.comentarios}</Text>
              <Text style={styles.fecha}>{item.fecha}</Text>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Formulario', {
                  idEdicion: item.id,
                  tituloActual: item.titulo,
                  calificacionActual: item.calificacion,
                  comentariosActuales: item.comentarios,
                  fotoActual: item.fotoBase64,
                  fechaActual: item.fecha
                })}
              >
                <Ionicons name="pencil-sharp" size={20} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => eliminarRegistro(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay registros todavía.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Formulario')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 65,
    height: 65,
    borderRadius: 8,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  calificacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  calificacionText: {
    fontSize: 13,
    color: '#e67e22',
    marginLeft: 4,
    fontWeight: '600',
  },
  comentarios: {
    fontSize: 13,
    color: '#666',
  },
  fecha: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 8,
  },
  iconButton: {
    padding: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
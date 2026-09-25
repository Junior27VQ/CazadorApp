import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { initDatabase } from './src/database/db';

import ListaScreen from './src/screens/ListaScreen';
import FormularioScreen from './src/screens/FormularioScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        setDbReady(true);
      } catch (e) {
        console.error('Error al preparar la app:', e);
      }
    };
    prepareApp();
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando Cazador de Sabores...</Text>
      </View>
    );
  }

  return (
    <SQLiteProvider databaseName="cazadorsabores.db" onInit={initDatabase}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Lista">
          <Stack.Screen 
            name="Lista" 
            component={ListaScreen} 
            options={{ title: 'Cazador de Sabores' }}
          />
          <Stack.Screen 
            name="Formulario" 
            component={FormularioScreen} 
            options={{ title: 'Registro' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
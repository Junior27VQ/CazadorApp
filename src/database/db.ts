import { SQLiteDatabase } from 'expo-sqlite';

// Función para inicializar la base de datos y crear la tabla obligatoria
export async function initDatabase(db: SQLiteDatabase) {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        calificacion INTEGER NOT NULL,
        comentarios TEXT NOT NULL,
        fotoBase64 TEXT NOT NULL,
        fecha TEXT NOT NULL
      );
    `);
    console.log('Base de datos inicializada correctamente y tabla "registros" lista.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}
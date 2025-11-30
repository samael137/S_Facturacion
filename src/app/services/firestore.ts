import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  QuerySnapshot
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);

  // Crear documento
  async crear<T extends object>(coleccion: string, datos: T): Promise<string> {
    try {
      const ref = collection(this.firestore, coleccion);
      const docRef = await addDoc(ref, datos);
      return docRef.id;
    } catch (error) {
      console.error('Error al crear documento:', error);
      throw error;
    }
  }

  // Actualizar documento
  async actualizar<T extends object>(coleccion: string, id: string, datos: Partial<T>): Promise<void> {
    try {
      const docRef = doc(this.firestore, coleccion, id);
      await updateDoc(docRef, datos as any);
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      throw error;
    }
  }

  // Eliminar (soft delete)
  async eliminar(coleccion: string, id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, coleccion, id);
      await updateDoc(docRef, {
        activo: false,
        fechaEliminacion: Timestamp.now()
      });
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      throw error;
    }
  }

  // Obtener por ID
  async obtenerPorId<T>(coleccion: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(this.firestore, coleccion, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener documento:', error);
      throw error;
    }
  }

  // Obtener todos
  async obtenerTodos<T>(coleccion: string): Promise<T[]> {
    try {
      const ref = collection(this.firestore, coleccion);
      const q = query(ref, where('activo', '==', true));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      throw error;
    }
  }

  // Obtener por usuario (SIN orderBy para evitar error de índice)
  async obtenerPorUsuario<T>(coleccion: string, usuarioId: string): Promise<T[]> {
    try {
      const ref = collection(this.firestore, coleccion);
      const q = query(
        ref, 
        where('usuarioId', '==', usuarioId),
        where('activo', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      
      // Ordenar en memoria - soporta ambos campos
      return docs.sort((a: any, b: any) => {
        // Intentar con fechaCreacion primero (facturas), luego fechaRegistro (clientes)
        const fechaA = a.fechaCreacion?.toDate?.() || a.fechaRegistro?.toDate?.() || 
                       new Date(a.fechaCreacion || a.fechaRegistro);
        const fechaB = b.fechaCreacion?.toDate?.() || b.fechaRegistro?.toDate?.() || 
                       new Date(b.fechaCreacion || b.fechaRegistro);
        return fechaB.getTime() - fechaA.getTime();
      });
    } catch (error) {
      console.error('Error al obtener documentos por usuario:', error);
      throw error;
    }
  }

  // ✨ Obtener por usuario en TIEMPO REAL
  obtenerPorUsuarioRealtime<T>(
    coleccion: string, 
    usuarioId: string,
    callback: (datos: T[]) => void
  ): () => void {
    const ref = collection(this.firestore, coleccion);
    const q = query(
      ref, 
      where('usuarioId', '==', usuarioId),
      where('activo', '==', true)
    );
    
    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      
      // Ordenar en memoria - soporta AMBOS campos (fechaCreacion Y fechaRegistro)
      const sorted = docs.sort((a: any, b: any) => {
        // Intentar con fechaCreacion primero (facturas), luego fechaRegistro (clientes)
        const fechaA = a.fechaCreacion?.toDate?.() || a.fechaRegistro?.toDate?.() || 
                       new Date(a.fechaCreacion || a.fechaRegistro);
        const fechaB = b.fechaCreacion?.toDate?.() || b.fechaRegistro?.toDate?.() || 
                       new Date(b.fechaCreacion || b.fechaRegistro);
        return fechaB.getTime() - fechaA.getTime();
      });
      
      callback(sorted);
    }, (error) => {
      console.error('Error en tiempo real:', error);
    });
    
    // Retornar función para cancelar la suscripción
    return unsubscribe;
  }

  // Buscar
  async buscar<T>(
    coleccion: string,
    campo: string,
    operador: any,
    valor: any,
    usuarioId?: string
  ): Promise<T[]> {
    try {
      const ref = collection(this.firestore, coleccion);
      let conditions = [where(campo, operador, valor), where('activo', '==', true)];
      
      if (usuarioId) {
        conditions.push(where('usuarioId', '==', usuarioId));
      }
      
      const q = query(ref, ...conditions);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error('Error en búsqueda:', error);
      throw error;
    }
  }
}

export { Firestore };
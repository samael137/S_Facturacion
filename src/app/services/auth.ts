import { Injectable, inject, signal } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  user,
  updateProfile
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc 
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  user$ = user(this.auth);
  currentUser = signal<Usuario | null>(null);
  loading = signal(false);

  constructor() {
    this.user$.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        await this.cargarDatosUsuario(firebaseUser.uid);
      } else {
        this.currentUser.set(null);
      }
    });
  }

  // Registro
  async registrar(email: string, password: string, datos: {
    nombre: string;
    apellido: string;
    empresa?: string;
    telefono?: string;
  }): Promise<{ success: boolean; message: string }> {
    this.loading.set(true);
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      await updateProfile(credential.user, {
        displayName: `${datos.nombre} ${datos.apellido}`
      });

      const usuario: Usuario = {
        uid: credential.user.uid,
        email: credential.user.email!,
        nombre: datos.nombre,
        apellido: datos.apellido,
        empresa: datos.empresa || '',
        telefono: datos.telefono || '',
        rol: 'usuario',
        fechaCreacion: new Date(),
        activo: true
      };

      await setDoc(doc(this.firestore, 'usuarios', usuario.uid), usuario);
      this.currentUser.set(usuario);
      
      this.router.navigate(['/dashboard']);
      return { success: true, message: 'Usuario registrado exitosamente' };
    } catch (error: any) {
      return { success: false, message: this.manejarError(error) };
    } finally {
      this.loading.set(false);
    }
  }

  // Login
  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    this.loading.set(true);
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.cargarDatosUsuario(credential.user.uid);
      
      this.router.navigate(['/dashboard']);
      return { success: true, message: 'Inicio de sesión exitoso' };
    } catch (error: any) {
      return { success: false, message: this.manejarError(error) };
    } finally {
      this.loading.set(false);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  // Cargar datos del usuario
  async cargarDatosUsuario(uid: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, 'usuarios', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.currentUser.set(docSnap.data() as Usuario);
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  }

  // Verificar autenticación
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  // Obtener UID
  getCurrentUserId(): string | null {
    return this.currentUser()?.uid || null;
  }

  // Manejo de errores
  private manejarError(error: any): string {
    const errores: { [key: string]: string } = {
      'auth/email-already-in-use': 'El email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/too-many-requests': 'Demasiados intentos. Intente más tarde',
      'auth/invalid-credential': 'Credenciales inválidas'
    };

    return errores[error.code] || 'Error en la autenticación';
  }
}

export { Auth };

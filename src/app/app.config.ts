import { ApplicationConfig,provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyAa_EnNEPYjcK9qHM3C1sMSqcVunyW_jR0",
      authDomain: "sistema-facturacion-cd4c1.firebaseapp.com",
      projectId: "sistema-facturacion-cd4c1",
      storageBucket: "sistema-facturacion-cd4c1.firebasestorage.app",
      messagingSenderId: "1091235400726",
      appId: "1:1091235400726:web:0269dce92b3d9f6f093937"

    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};
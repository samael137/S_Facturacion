import { Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar a que Firebase Auth verifique la sesión
  return authService.user$.pipe(
    take(1), // Solo tomar el primer valor
    map(user => {
      if (user) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};


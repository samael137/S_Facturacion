import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Toast } from './shared/components/toast/toast';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Toast, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('S_Facturacion');
  protected showNavbarAndFooter = signal(true);

  constructor(private router: Router) {
    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Ocultar navbar y footer en rutas de autenticación
      const authRoutes = ['/login', '/register'];
      this.showNavbarAndFooter.set(!authRoutes.includes(event.urlAfterRedirects));
    });
  }
}

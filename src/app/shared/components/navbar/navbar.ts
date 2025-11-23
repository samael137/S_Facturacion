import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  authService = inject(AuthService);
  private router = inject(Router);

  menuOpen = false;
  userMenuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.userMenuOpen = false;
    }
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.menuOpen = false;
    }
  }

  closeMenus() {
    this.menuOpen = false;
    this.userMenuOpen = false;
  }

  async logout() {
    this.closeMenus();
    await this.authService.logout();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
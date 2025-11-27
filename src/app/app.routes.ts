import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    
    // Rutas públicas
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },

   {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  
  // Rutas protegidas
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then(m => (m as any).DashboardComponent || (m as any).Dashboard || (m as any).default)
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/clientes/lista-clientes/lista-clientes')
          .then(m => m.ListaClientes)
      },
      {
        path: 'crear',
        loadComponent: () => import('./features/clientes/crear-cliente/crear-cliente')
          .then(m => m.CrearCliente)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./features/clientes/editar-cliente/editar-cliente')
          .then(m => m.EditarCliente)
      },
      {path: 'detalle/:id',
        loadComponent: () => import('./features/clientes/detalle-cliente/detalle-cliente')
          .then(m => m.DetalleCliente)
      }
    ]
  },
  {
    path: 'facturas',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/facturas/lista-facturas/lista-facturas')
          .then(m => m.ListaFacturas)
      },
      {
        path: 'crear',
        loadComponent: () => import('./features/facturas/crear-factura/crear-factura')
          .then(m => m.CrearFactura)
      },
      {
        path: 'detalle/:id',
        loadComponent: () => import('./features/facturas/detalle-factura/detalle-factura')
          .then(m => m.DetalleFactura)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./features/facturas/editar-factura/editar-factura')
          .then(m => m.EditarFactura)
      }
    ]
  },
  
  // Redirecciones
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found')
      .then(m => m.NotFound)
  }
];

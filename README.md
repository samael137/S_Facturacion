# SISTEMAS DE FACTURACIÓN

## Especificaciones de proyecto
"MAUCAYLLE CHIRCCA, YUNIOR YULIÑO": {
    "titulo": "Sistema de Facturación",
    "descripcion": "Aplicación CRUD en Angular para gestionar información relacionada con sistema de facturación.",
    "requerimientos": [
      "Implementar autenticación de usuarios con Firebase Authentication.",
      "Crear una colección principal en Firestore para almacenar datos de sistema de facturación.",
      "Permitir crear, editar y eliminar registros asociados al usuario autenticado.",
      "Agregar validaciones de formularios para campos obligatorios y formatos correctos.",
      "Permitir filtrar y buscar registros por criterios relevantes (nombre, fecha o categoría).",
      "Mostrar un listado con datos ordenados y actualizados en tiempo real desde Firestore.",
      "Crear una vista de estadísticas o resumen general con totales, promedios o estados principales."
    ]
  },

## Andamiaje de código

### PASO 1: Crear Servicios
#### 1.1 Servicio de Autenticación
ng g s services/auth 

#### 1.2 Servicio de Clientes
ng g s services/clientes 

#### 1.3 Servicio de Facturas
ng g s services/facturas 

#### 1.4 Servicio de Firestore 
ng g s services/firestore 

#### 1.5 Servicio de Toast 
ng g s services/toast

### PASO 2: Crear Interfaces (Modelos)
#### 2.1 Interface Usuario
ng g interface models/usuario

#### 2.2 Interface Cliente
ng g interface models/cliente

#### 2.3 Interface Factura
ng g interface models/factura

#### 2.4 Interface Producto (adicional necesario)
ng g interface models/producto

### PASO 3: Crear Componentes
#### 3.1 Login Component
ng g c features/auth/login 

#### 3.2 Register Component
ng g c features/auth/register 

#### 3.3 Dashboard Component
ng g c features/dashboard 

ng g c features/estadísticas

#### 3.4 Componentes de Clientes
ng g c features/clientes/lista-clientes 
ng g c features/clientes/crear-cliente 
ng g c features/clientes/editar-cliente 
ng g c features/clientes/detalle-cliente       

#### 3.5 Componentes de Facturas
ng g c features/facturas/lista-facturas 
ng g c features/facturas/crear-factura 
ng g c features/facturas/editar-factura ---- 
ng g c features/facturas/detalle-factura 

#### 3.6 Componentes Compartidos
ng g c shared/components/navbar 
ng g c shared/components/loading 
ng g c shared/components/not-found 
ng g c shared/components/toast

### PASO 4: Crear Guard
ng g guard core/guards/auth 

### PASO 5: Crear Pipes Personalizados
ng g pipe shared/pipes/currency-format 
ng g pipe shared/pipes/ruc-format 
ng g pipe shared/pipes/estado-badge  estos fueron pasos 

### PASO 6: Crear directives
ng g directive shared/directives/highlight
ng g directive shared/directives/highlight.spec

### Estructura Final de Sistemas de Facturacion 

```bash
src/app/
├── core/
│   └── guards/
│       ├── auth-guard.ts          
│       └── auth-guard.spec.ts        
│
├── models/
│   ├── cliente.ts                    
│   ├── factura.ts                    
│   ├── producto.ts                  
│   └── usuario.ts                     
│
├── services/
│   ├── auth.ts                        
│   ├── clientes.ts                   
│   ├── facturas.ts  
│   ├── firestore.ts                 
│   └── toast.ts                   
│
├── features/
│   ├── auth/
│   │   ├── login/                     
│   │   └── register/                  
│   │
│   ├── clientes/
│   │   ├── crear-cliente/           
│   │   ├── editar-cliente/         
│   │   ├── lista-clientes/    
│   │   └── detalle-cliente/        
│   │
│   ├── dashboard/                  
│   │
│   ├── facturas/
│   │   ├── crear-factura/          
│   │   ├── editar-factura/            
│   │   ├── lista-facturas/            
│   │   └── detalle-factura/         
│   │
│   └── estadisticas/                 
│       ├── estadisticas.ts
│       ├── estadisticas.html
│       ├── estadisticas.css
│       └── estadisticas.spec.ts
│
└── shared/
    ├── components/
    │   ├── loading/                  
    │   ├── navbar/                   
    │   ├── not-found/                 
    │   └── toast/                     
    │       ├── toast.ts
    │       ├── toast.html
    │       ├── toast.css
    │       └── toast.spec.ts
    │
    ├── pipes/
    │   ├── currency-format-pipe.ts    
    │   ├── estado-badge-pipe.ts      
    │   └── ruc-format-pipe.ts     
    │
    └── directives/                    
        ├── highlight.ts
        └── highlight.spec.ts   
```
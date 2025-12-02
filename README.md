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

Estructura Final de Sistemas de Facturacion 
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
│   └── firestore.ts                   
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
        ├── highlight.directive.ts
        └── highlight.directive.spec.ts

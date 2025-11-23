Estructura Correcta Final de Sistemas de Facturacion 
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
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientesService } from '../../../services/clientes';

@Component({
  selector: 'app-crear-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './crear-cliente.html',
  styleUrl: './crear-cliente.css'
})
export class CrearCliente {
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);
  private router = inject(Router);

  clienteForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  // Lista de países
  paises = [
    'Perú',
    'Argentina',
    'Bolivia',
    'Brasil',
    'Chile',
    'Colombia',
    'Ecuador',
    'Paraguay',
    'Uruguay',
    'Venezuela',
    'España',
    'México',
    'Estados Unidos'
  ];

  constructor() {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      empresa: [''],
      ruc: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', [Validators.required, Validators.minLength(2)]],
      pais: ['Perú', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const clienteData = this.clienteForm.value;
      await this.clientesService.crear(clienteData);
      
      this.success = 'Cliente creado exitosamente';
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        this.router.navigate(['/clientes']);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creando cliente:', error);
      this.error = 'Error al crear el cliente. Intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  // Getters para validaciones
  get nombre() {
    return this.clienteForm.get('nombre');
  }

  get apellido() {
    return this.clienteForm.get('apellido');
  }

  get empresa() {
    return this.clienteForm.get('empresa');
  }

  get ruc() {
    return this.clienteForm.get('ruc');
  }

  get email() {
    return this.clienteForm.get('email');
  }

  get telefono() {
    return this.clienteForm.get('telefono');
  }

  get direccion() {
    return this.clienteForm.get('direccion');
  }

  get ciudad() {
    return this.clienteForm.get('ciudad');
  }

  get pais() {
    return this.clienteForm.get('pais');
  }
}
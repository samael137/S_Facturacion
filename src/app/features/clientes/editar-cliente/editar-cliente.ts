import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientesService } from '../../../services/clientes';
import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-editar-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './editar-cliente.html',
  styleUrl: './editar-cliente.css'
})
export class EditarCliente implements OnInit {
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  clienteForm: FormGroup;
  loading = false;
  loadingData = true;
  error = '';
  success = '';
  clienteId: string | null = null;
  clienteOriginal: Cliente | null = null;

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

  async ngOnInit() {
    this.clienteId = this.route.snapshot.paramMap.get('id');
    
    if (!this.clienteId) {
      this.error = 'ID de cliente no válido';
      this.loadingData = false;
      return;
    }

    await this.cargarCliente();
  }

  async cargarCliente() {
    try {
      this.loadingData = true;
      this.error = '';

      const cliente = await this.clientesService.obtenerPorId(this.clienteId!);
      
      if (!cliente) {
        this.error = 'Cliente no encontrado';
        return;
      }

      this.clienteOriginal = cliente;

      // Cargar datos en el formulario
      this.clienteForm.patchValue({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        empresa: cliente.empresa || '',
        ruc: cliente.ruc,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        ciudad: cliente.ciudad,
        pais: cliente.pais
      });

    } catch (error) {
      console.error('Error cargando cliente:', error);
      this.error = 'Error al cargar los datos del cliente';
    } finally {
      this.loadingData = false;
    }
  }

  async onSubmit() {
    if (this.clienteForm.invalid || !this.clienteId) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const clienteData = this.clienteForm.value;
      await this.clientesService.actualizar(this.clienteId, clienteData);
      
      this.success = 'Cliente actualizado exitosamente';
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        this.router.navigate(['/clientes']);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error actualizando cliente:', error);
      this.error = 'Error al actualizar el cliente. Intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  cancelar() {
    this.router.navigate(['/clientes']);
  }

  // Verificar si el formulario tiene cambios
  get hasChanges(): boolean {
    if (!this.clienteOriginal) return false;
    
    const formValue = this.clienteForm.value;
    return (
      formValue.nombre !== this.clienteOriginal.nombre ||
      formValue.apellido !== this.clienteOriginal.apellido ||
      formValue.empresa !== (this.clienteOriginal.empresa || '') ||
      formValue.ruc !== this.clienteOriginal.ruc ||
      formValue.email !== this.clienteOriginal.email ||
      formValue.telefono !== this.clienteOriginal.telefono ||
      formValue.direccion !== this.clienteOriginal.direccion ||
      formValue.ciudad !== this.clienteOriginal.ciudad ||
      formValue.pais !== this.clienteOriginal.pais
    );
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
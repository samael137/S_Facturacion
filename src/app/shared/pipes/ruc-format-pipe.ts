import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rucFormat',
  standalone: true
})
export class RucFormatPipe implements PipeTransform {
  transform(value: string | null | undefined, tipo?: 'RUC' | 'DNI' | 'CE'): string {
    if (!value) {
      return '';
    }

    // Limpiar cualquier caracter no numérico
    const cleaned = value.replace(/\D/g, '');

    // Si es RUC (11 dígitos)
    if (cleaned.length === 11 || tipo === 'RUC') {
      // Formato: 20-12345678-9
      return cleaned.replace(/(\d{2})(\d{8})(\d{1})/, '$1-$2-$3');
    }

    // Si es DNI (8 dígitos)
    if (cleaned.length === 8 || tipo === 'DNI') {
      // Formato: 12345678 (sin guiones)
      return cleaned;
    }

    // Si es Carnet de Extranjería (12 dígitos)
    if (cleaned.length === 12 || tipo === 'CE') {
      // Formato: 1234-5678-9012
      return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    // Si no coincide con ningún formato, devolver sin formato
    return cleaned;
  }
}
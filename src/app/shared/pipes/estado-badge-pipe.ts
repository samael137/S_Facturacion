import { Pipe, PipeTransform } from '@angular/core';

export interface BadgeConfig {
  class: string;
  icon: string;
  text: string;
}

@Pipe({
  name: 'estadoBadge',
  standalone: true
})
export class EstadoBadgePipe implements PipeTransform {
  transform(estado: 'pendiente' | 'pagada' | 'vencida' | 'anulada' | string): BadgeConfig {
    const badges: Record<string, BadgeConfig> = {
      pendiente: {
        class: 'badge-warning',
        icon: 'fa-clock',
        text: 'Pendiente'
      },
      pagada: {
        class: 'badge-success',
        icon: 'fa-check-circle',
        text: 'Pagada'
      },
      vencida: {
        class: 'badge-danger',
        icon: 'fa-exclamation-triangle',
        text: 'Vencida'
      },
      anulada: {
        class: 'badge-secondary',
        icon: 'fa-times-circle',
        text: 'Anulada'
      }
    };

    return badges[estado.toLowerCase()] || {
      class: 'badge-secondary',
      icon: 'fa-question-circle',
      text: 'Desconocido'
    };
  }
}
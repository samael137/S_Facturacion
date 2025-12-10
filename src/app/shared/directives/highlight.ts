import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class Highlight {
  @Input() highlightColor: string = '#eff6ff'; // Color por defecto (azul claro)
  @Input() defaultColor: string = 'transparent'; // Color original
  @Input() highlightBorder: boolean = false; // Si debe agregar borde
  @Input() highlightScale: boolean = false; // Si debe hacer zoom suave

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.highlightColor);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight(this.defaultColor);
  }

  private highlight(color: string) {
    // Cambiar color de fondo
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
    
    // Agregar transición suave
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
    
    // Opcional: Agregar borde al hacer hover
    if (this.highlightBorder) {
      const borderColor = color === this.defaultColor ? 'transparent' : '#2563eb';
      this.renderer.setStyle(this.el.nativeElement, 'borderLeft', `3px solid ${borderColor}`);
    }
    
    // Opcional: Escalar ligeramente
    if (this.highlightScale) {
      const scale = color === this.defaultColor ? 'scale(1)' : 'scale(1.02)';
      this.renderer.setStyle(this.el.nativeElement, 'transform', scale);
    }
  }
}
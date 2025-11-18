import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoBadge'
})
export class EstadoBadgePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}

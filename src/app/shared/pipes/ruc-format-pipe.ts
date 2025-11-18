import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rucFormat'
})
export class RucFormatPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}

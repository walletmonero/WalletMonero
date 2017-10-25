import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split'
})
export class SplitPipe implements PipeTransform {

  transform(value: string): string{
    let t = value.split('');
    t.splice(Math.floor(value.length/2), 0, '\n');
    return t.join('');
  }

}

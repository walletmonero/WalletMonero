import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spread'
})
export class SpreadPipe implements PipeTransform {

  transform(value: string, length: number): any {

    let difLength:number = value.length - length;
    if(difLength <= 0) return value;

    let d = length % 2;
    let p1: string, p2: string;
    let half = Math.floor(length / 2);

      p1 = value.substr(0, half + d);
      p2 = value.substr(value.length - half, half);

    return p1+' . . . '+p2;
  }

}

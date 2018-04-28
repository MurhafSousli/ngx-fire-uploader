import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'fileSize'})
export class FileSizePipe implements PipeTransform {

  private units = [
    'B',
    'KB',
    'MB',
    'GB'
  ];

  transform(bytes: number = 0, precision: number = 1): string {
    if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes)) return '?';

    let unit = 0;

    while (bytes >= 1024) {
      bytes /= 1024;
      unit++;
    }
    return bytes.toFixed(precision) + ' ' + this.units[unit];
  }
}

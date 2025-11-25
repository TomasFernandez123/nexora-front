import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'usernameFormat',
  standalone: true
})
export class UsernameFormatPipe implements PipeTransform {

  transform(username: string, mode: 'at' | 'title' | 'lower' = 'at'): string {
    if (!username) return '';

    switch (mode) {
      case 'at':
        return '@' + username.toLowerCase();

      case 'title':
        return username
          .toLowerCase()
          .replace(/\b\w/g, char => char.toUpperCase());

      case 'lower':
        return username.toLowerCase();

      default:
        return username;
    }
  }
}

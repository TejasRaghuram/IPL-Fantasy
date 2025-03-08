import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public username: string = '';
  public name: string = '';

  constructor(private cookieService : CookieService) {
    const username = cookieService.get('username');
    const name = cookieService.get('name');
    if (username && name) {
      this.username = username;
      this.name = name;
    }
  }

  storeCookies(): void {
    this.cookieService.set('username', this.username, {expires: 7});
    this.cookieService.set('name', this.name, {expires: 7});
  }

  removeCookies(): void {
    this.cookieService.delete('username');
    this.cookieService.delete('name');
  }
}

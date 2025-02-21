import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  constructor (private router: Router) {}

  isStuck(): string {
    return this.router.url == '/' 
      || this.router.url == '/login' 
      || this.router.url == '/signup' 
      || this.router.url == '/error' 
      || (this.router.url.match(/\//g) || []).length >= 3 ? 'stuck' : '';
  }
}

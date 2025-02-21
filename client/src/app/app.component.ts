import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ResultsComponent } from './shared/results/results.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [
    ResultsComponent, 
    NavbarComponent, 
    RouterOutlet, 
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  visibleHeader(): boolean {
    return this.router.url !== '/' 
      && this.router.url !== '/login' 
      && this.router.url !== '/signup' 
      && this.router.url !== '/error'
      && (this.router.url.match(/\//g) || []).length < 3;
  }
}

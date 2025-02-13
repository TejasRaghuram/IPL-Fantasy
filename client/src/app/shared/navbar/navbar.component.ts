import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private router: Router) {}

  handleHome() {
    this.router.navigate(["/home"]);
  }

  handlePlayerRankings() {
    this.router.navigate(["/rankings"]);
  }

  handleLogOut() {
    this.router.navigate(["/"]);
  }
}

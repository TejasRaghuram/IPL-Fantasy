import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private router: Router, private userService: UserService) {}

  handleHome() {
    this.router.navigate(["/home"]);
  }

  handlePlayerRankings() {
    this.router.navigate(["/rankings"]);
  }

  handleLogOut() {
    this.userService.username = '';
    this.userService.name = '';
    this.userService.removeCookies();
    this.router.navigate(["/"]);
  }
}

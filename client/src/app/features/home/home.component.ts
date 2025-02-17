import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  name = "Name";
  selection = "League 0";

  constructor(private router: Router) {}

  handleJoinLeague(): void {
    this.router.navigate(["/join"]);
  }

  handleCreateLeague(): void {
    this.router.navigate(["/create"]);
  }
}

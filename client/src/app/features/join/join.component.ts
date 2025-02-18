import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-join',
  imports: [FormsModule],
  templateUrl: './join.component.html',
  styleUrl: './join.component.css'
})
export class JoinComponent {
  leagueName = '';
  players: string[] = [];

  constructor(private router: Router) {}

  handleVerify(name: string, password: string): void {
    this.leagueName = name;
    let numPlayers = 5;
    this.players = Array(numPlayers).fill('');
  }

  handleJoin(): void {
    this.router.navigate(["/home"]);
  }
}

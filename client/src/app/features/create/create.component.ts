import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create',
  imports: [FormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent {
  leagueName = '';
  players: string[] = [];

  constructor(private router: Router) {}
  
  handleCreate(name: string, password: string, teamSize: string): void {
    let numPlayers: number = Number(teamSize);
    this.leagueName = name;
    this.players = Array(numPlayers).fill('');
  }

  handleJoin(): void {
    this.router.navigate(["/home"]);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rankings',
  imports: [],
  templateUrl: './rankings.component.html',
  styleUrl: './rankings.component.css'
})
export class RankingsComponent {
  constructor(private router: Router) {}
  
  invalidImage(event: any): void {
    event.target.src = "https://scores.iplt20.com/ipl/images/default-player-statsImage.png?v=4";
  }

  handlePlayer(name: string): void {
    let route = "/" + name;
    this.router.navigate([route]);
  }
}

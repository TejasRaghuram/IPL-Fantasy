import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';
import { environment } from '../../../../environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rankings',
  imports: [CommonModule],
  templateUrl: './rankings.component.html',
  styleUrl: './rankings.component.css'
})
export class RankingsComponent implements OnInit, OnDestroy {
  players: Player[] = [];
  loaded = false;
  interval: any;

  constructor(private router: Router, private userService: UserService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = "#EEEEEE";
    if (this.userService.username == '') {
      this.router.navigate(['/']);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    this.loadPlayers();

    this.interval = setInterval(() => {
      this.loadPlayers();
    }, 60000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  loadPlayers(): void {
    fetch (environment.API_URL + '/api/players/all', {
      method: 'GET'
    }).then(response => {
      if (response.ok) {
        return response.json().then(data => {
          this.players = data;
          this.players.sort((a, b) => b.points - a.points);
          let rank = 1;
          for (let i = 0; i < this.players.length; i++) {
            if (i > 0 && this.players[i].points === this.players[i - 1].points) {
              this.players[i].rank = this.players[i - 1].rank;
            } else {
              this.players[i].rank = rank;
            }
            if (this.players[i].points > 0) {
              if (this.players[i].rank == 1) {
                this.players[i].class = 'player gold';
              } else if (this.players[i].rank == 2) {
                this.players[i].class = 'player silver';
              } else if (this.players[i].rank == 3) {
                this.players[i].class = 'player bronze';
              } else {
                this.players[i].class = 'player';
              }
            } else {
              this.players[i].class = 'player';
            }
            rank++;
            this.players[i].image = this.players[i].image;
          }
          this.loaded = true;
        });
      } else {
        return response.json().then(data => {
          alert(data.error);
        });
      }
    });
  }

  invalidImage(event: any): void {
    event.target.src = "https://scores.iplt20.com/ipl/images/default-player-statsImage.png?v=4";
  }

  handlePlayer(name: string): void {
    let route = "/" + name;
    this.router.navigate([route]);
  }
}

interface Player {
  name: string;
  points: number;
  position: string;
  team: string;
  foreigner: boolean;
  rank?: number;
  image?: string;
  class?: string;
}
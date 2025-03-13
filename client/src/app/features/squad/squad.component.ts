import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../user.service';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-squad',
  imports: [],
  templateUrl: './squad.component.html',
  styleUrl: './squad.component.css'
})
export class SquadComponent implements OnInit {
  loaded = false;
  league = ''
  data: Data = {
    squad: {
      name: '',
      captain: '',
      vice_captain: ''
    },
    players: [{
      name: '',
      points: 0
    }]
  };

  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = "#EEEEEE";
    if (this.userService.username == '') {
      this.router.navigate(['/']);
    }
    this.route.paramMap.subscribe(params => {
      this.league = params.get('league') || '';
      fetch (environment.API_URL + '/api/league/squad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: params.get('username') || '',
          name: params.get('league') || ''
        })
      }).then(response => {
        if (response.ok) {
          return response.json().then(data => {
            this.data = data;
            this.data.players.sort((a, b) => b.points - a.points);
            let rank = 1;
            for (let i = 0; i < this.data.players.length; i++) {
              if (i > 0 && this.data.players[i].points === this.data.players[i - 1].points) {
                this.data.players[i].rank = this.data.players[i - 1].rank;
              } else {
                this.data.players[i].rank = rank;
              }
              rank++;
              this.data.players[i].photo = 
                'https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/'
                + this.data.players[i].name.replaceAll(' ', '%20') + '.png';
              let name = this.data.players[i].name;
              if (this.data.players[i].foreigner) {
                name += ' ✈️';
              }
              if (this.data.squad.captain == this.data.players[i].name) {
                name += ' (C)';
              } else if (this.data.squad.vice_captain == this.data.players[i].name) {
                name += ' (VC)';
              }
              this.data.players[i].name = name;
            }
            this.loaded = true;
          });
        } else {
          return response.json().then(data => {
            this.router.navigate(['/error']);
          });
        }
      });
    });
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  invalidImage(event: any): void {
    event.target.src = "https://scores.iplt20.com/ipl/images/default-player-statsImage.png?v=4";
  }
}

interface Data {
  squad: Squad,
  players: [Player]
}

interface Squad {
  name: string,
  captain: string,
  vice_captain: string
}

interface Player {
  rank?: number,
  name: string,
  team?: string,
  position?: string,
  points: number,
  photo?: string,
  foreigner?: boolean
}

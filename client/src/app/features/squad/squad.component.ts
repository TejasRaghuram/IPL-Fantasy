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
            for (const player of data.players) {
              if (data.squad.captain == player.name) {
                player.points = player.points * 2;
              } else if (data.squad.vice_captain == player.name) {
                player.points = Math.round(player.points * 1.5);
              }
            }
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
            this.data.squad.strike_rate = Math.round(data.squad.strike_rate * 100) / 100;
            this.data.squad.batting_average = Math.round(data.squad.batting_average * 100) / 100;
            this.data.squad.economy = Math.round(data.squad.economy * 100) / 100;
            this.data.squad.bowling_average = Math.round(data.squad.bowling_average * 100) / 100;
            this.data.squad.bowling_strike_rate = Math.round(data.squad.bowling_strike_rate * 100) / 100;
            this.data.squad.bonuses = data.squad.bonuses.map((bonus: { [s: string]: number; }) => {
              const [name, points] = Object.entries(bonus)[0];
              return {
                'name': this.getBonus(name), 
                'points': points
              };
            });
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

  handlePlayer(name: string): void {
    let route = "/" + name.replaceAll(' (C)', '').replaceAll(' (VC)', '').replaceAll(' ✈️', '');
    this.router.navigate([route]);
  }

  getBonus(name: string): string {
    return (['strike_rate', 'batting_average', 'highest_score', 'economy', 'bowling_average', 'bowling_strike_rate']
      .includes(name) ? 'Best ' : 'Most ')
      + name.replaceAll('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');;
  }
}

interface Data {
  squad: Squad,
  players: [Player]
}

interface Squad {
  name: string,
  captain: string,
  vice_captain: string,
  points?: number,
  base_points?: number,
  bonus_points?: number,
  runs?: number,
  fours?: number,
  sixes?: number,
  ducks?: number,
  half_centuries?: number,
  centuries?: number,
  strike_rate?: number,
  not_outs?: number,
  balls_faced?: number,
  batting_average?: number,
  dismissals?: number,
  highest_score?: number,
  wickets?: number,
  dots?: number,
  four_wicket_hauls?: number,
  five_wicket_hauls?: number,
  six_wicket_hauls?: number,
  maidens?: number,
  hat_tricks?: number,
  economy?: number,
  bowling_average?: number,
  bowling_strike_rate?: number,
  balls_bowled?: number,
  runs_conceded?: number,
  catches?: number,
  stumpings?: number,
  player_of_matches?: number
  bonuses?: [{
    name: string,
    points: number
  }]
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

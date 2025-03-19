import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../user.service';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-player',
  imports: [],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent implements OnInit {
  data: Player = {
    name: '',
    team: '',
    position: '',
    runs: 0,
    fours: 0,
    sixes: 0,
    ducks: 0,
    half_centuries: 0,
    centuries: 0,
    strike_rate: 0,
    balls_faced: 0,
    batting_average: 0,
    not_outs: 0,
    dismissals: 0,
    highest_score: 0,
    wickets: 0,
    dots: 0,
    four_wicket_hauls: 0,
    five_wicket_hauls: 0,
    six_wicket_hauls: 0,
    maidens: 0,
    hat_tricks: 0,
    economy: 0,
    bowling_average: 0,
    bowling_strike_rate: 0,
    balls_bowled: 0,
    runs_conceded: 0,
    catches: 0,
    stumpings: 0,
    player_of_matches: 0,
    bonuses: [{
      name: 'hi',
      points: 0
    }],
    base_points: 0,
    bonus_points: 0,
    points: 0,
    foreigner: false
  }
  points: Points = {}
  loaded = false;

  constructor(private route: ActivatedRoute, private router: Router, private elementRef: ElementRef, private userService: UserService) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = "#EEEEEE";
    if (this.userService.username == '') {
      this.router.navigate(['/']);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    this.route.paramMap.subscribe(params => {
      let name = params.get('name') || '';
      fetch (environment.API_URL + '/api/players/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name
        })
      }).then(response => {
        if (response.ok) {
          return response.json().then(data => {
            this.data = data;
            this.data.bonuses = data.bonuses.map((bonus: { [s: string]: number; }) => {
              const [name, points] = Object.entries(bonus)[0];
              return {
                'name': this.getBonus(name), 
                'points': points
              };
            });
            this.data.bonuses.sort((a, b) => (b.points - a.points));
            const bowler = data.position == 'Pacer' || data.position == 'Spinner';
            const batsman = data.position == 'Batsman' || data.position == 'Wicketkeeper';
            this.data.photo = 
              'https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/'
              + this.data.name.replaceAll(' ', '%20') + '.png';
            this.points.runs = (bowler ? 2 : 1) * data.runs * 2;
            this.points.fours = (bowler ? 2 : 1) * data.fours * 4;
            this.points.sixes = (bowler ? 2 : 1) * data.sixes * 8;
            this.points.ducks = (bowler ? 0.5 : 1) * data.ducks * -6;
            this.points.half_centuries = (bowler ? 2 : 1) * data.half_centuries * 50;
            this.points.centuries = (bowler ? 2 : 1) * data.centuries * 100;
            this.points.not_outs = (bowler ? 2 : 1) * data.not_outs * 10;
            this.points.wickets = (batsman ? 2 : 1) * data.wickets * 50;
            this.points.dots = (batsman ? 2 : 1) * data.dots * 5;
            this.points.maidens = (batsman ? 2 : 1) * data.maidens * 150;
            this.points.hat_tricks = (batsman ? 2 : 1) * data.hat_tricks * 750;
            this.points.four_wicket_hauls = (batsman ? 2 : 1) * data.four_wicket_hauls * 250;
            this.points.five_wicket_hauls = (batsman ? 2 : 1) * data.five_wicket_hauls * 500;
            this.points.six_wicket_hauls = (batsman ? 2 : 1) * data.six_wicket_hauls * 1000;
            this.points.catches = data.catches * 25;
            this.points.stumpings = data.stumpings * 100;
            this.points.player_of_matches = data.player_of_matches * 100;

            this.data.strike_rate = Math.round(this.data.strike_rate * 100) / 100;
            this.data.batting_average = Math.round(this.data.batting_average * 100) / 100;
            this.data.economy = Math.round(this.data.economy * 100) / 100;
            this.data.bowling_average = Math.round(this.data.bowling_average * 100) / 100;
            this.data.bowling_strike_rate = Math.round(this.data.bowling_strike_rate * 100) / 100;
          
            this.loaded = true;
            if (this.data.runs >= 850) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 5000;
            } else if (this.data.runs >= 800) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 4500;
            } else if (this.data.runs >= 750) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 4000;
            } else if (this.data.runs >= 700) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 3500;
            } else if (this.data.runs >= 650) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 3000;
            } else if (this.data.runs >= 600) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 2500;
            } else if (this.data.runs >= 550) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 2000;
            } else if (this.data.runs >= 500) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 1500;
            } else if (this.data.runs >= 450) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 1000;
            } else if (this.data.runs >= 400) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 750;
            } else if (this.data.runs >= 350) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 500;
            } else if (this.data.runs >= 300) {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 250;
            } else {
              this.points.runs_aggregate = (bowler ? 2 : 1) * 0;
            }
            if (this.data.wickets >= 35) {
              this.points.wickets_aggregate = (batsman ? 2 : 1) * 5000;
            } else if (this.data.wickets >= 30) {
              this.points.wickets_aggregate = (batsman ? 2 : 1) * 4000;
            } else if (this.data.wickets >= 25) {
              this.points.wickets_aggregate = (batsman ? 2 : 1) * 3000;
            } else if (this.data.wickets >= 20) {
              this.points.wickets_aggregate = (batsman ? 2 : 1) * 2000;
            } else if (this.data.wickets >= 15) {
              this.points.wickets_aggregate = (batsman ? 2 : 1) * 1000;
            } else if (this.data.wickets >= 10) {
              this.points.wickets_aggregate = (batsman ? 2 : 1) * 500;
            } else {
              this.points.wickets_aggregate = (batsman ? 2 : 1) * 0;
            }
            if (this.data.balls_faced >= 50) {
              if (this.data.strike_rate >= 250) {
                this.points.strike_rate = (bowler ? 2 : 1) * 2000;
              } else if (this.data.strike_rate >= 235) {
                this.points.strike_rate = (bowler ? 2 : 1) * 1500;
              } else if (this.data.strike_rate >= 220) {
                this.points.strike_rate = (bowler ? 2 : 1) * 1250;
              } else if (this.data.strike_rate >= 205) {
                this.points.strike_rate = (bowler ? 2 : 1) * 1000;
              } else if (this.data.strike_rate >= 190) {
                this.points.strike_rate = (bowler ? 2 : 1) * 750;
              } else if (this.data.strike_rate >= 175) {
                this.points.strike_rate = (bowler ? 2 : 1) * 500;
              } else if (this.data.strike_rate >= 160) {
                this.points.strike_rate = (bowler ? 2 : 1) * 250;
              } else if (this.data.strike_rate >= 145) {
                this.points.strike_rate = (bowler ? 2 : 1) * 100;
              } else if (this.data.strike_rate >= 130) {
                this.points.strike_rate = (bowler ? 2 : 1) * 0;
              } else if (this.data.strike_rate >= 125) {
                this.points.strike_rate = (bowler ? 0.5 : 1) * -100;
              } else if (this.data.strike_rate >= 120) {
                this.points.strike_rate = (bowler ? 0.5 : 1) * -200;
              } else if (this.data.strike_rate >= 115) {
                this.points.strike_rate = (bowler ? 0.5 : 1) * -400;
              } else if (this.data.strike_rate >= 110) {
                this.points.strike_rate = (bowler ? 0.5 : 1) * -600;
              } else if (this.data.strike_rate >= 105) {
                this.points.strike_rate = (bowler ? 0.5 : 1) * -800;
              } else {
                this.points.strike_rate = (bowler ? 0.5 : 1) * -1000;
              }
            } else {
              this.points.strike_rate = 0;
            }
            if (this.data.balls_bowled >= 30) {
              if (this.data.economy <= 5) {
                this.points.economy = (batsman ? 2 : 1) * 2500;
              } else if (this.data.economy <= 5.5) {
                this.points.economy = (batsman ? 2 : 1) * 2000;
              } else if (this.data.economy <= 6) {
                this.points.economy = (batsman ? 2 : 1) * 1500;
              } else if (this.data.economy <= 7) {
                this.points.economy = (batsman ? 2 : 1) * 1000;
              } else if (this.data.economy <= 7.5) {
                this.points.economy = (batsman ? 2 : 1) * 500;
              } else if (this.data.economy <= 8) {
                this.points.economy = (batsman ? 2 : 1) * 250;
              } else if (this.data.economy <= 8.5) {
                this.points.economy = (batsman ? 2 : 1) * 100;
              } else if (this.data.economy <= 9.5) {
                this.points.economy = (batsman ? 2 : 1) * 0;
              } else if (this.data.economy <= 10) {
                this.points.economy = (batsman ? 0.5 : 1) * -100;
              } else if (this.data.economy <= 10.5) {
                this.points.economy = (batsman ? 0.5 : 1) * -200;
              } else if (this.data.economy <= 11) {
                this.points.economy = (batsman ? 0.5 : 1) * -400;
              } else if (this.data.economy <= 11.5) {
                this.points.economy = (batsman ? 0.5 : 1) * -600;
              } else if (this.data.economy <= 12.5) {
                this.points.economy = (batsman ? 0.5 : 1) * -800;
              } else {
                this.points.economy = (batsman ? 0.5 : 1) * -1000;
              }
            } else {
              this.points.economy = 0;
            }
          });
        } else {
          return response.json().then(data => {
            this.router.navigate(['/error']);
          });
        }
      });
    });
    
  }
  invalidImage(event: any): void {
    event.target.src = "https://scores.iplt20.com/ipl/images/default-player-statsImage.png?v=4";
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

interface Player {
  name: string,
  team: string,
  position: string,
  runs: number,
  fours: number,
  sixes: number,
  ducks: number,
  half_centuries: number,
  centuries: number,
  strike_rate: number,
  balls_faced: number,
  batting_average: number,
  not_outs: number,
  dismissals: number,
  highest_score: number,
  wickets: number,
  dots: number,
  four_wicket_hauls: number,
  five_wicket_hauls: number,
  six_wicket_hauls: number,
  maidens: number,
  hat_tricks: number,
  economy: number,
  bowling_average: number,
  bowling_strike_rate: number,
  balls_bowled: number,
  runs_conceded: number,
  catches: number,
  stumpings: number,
  player_of_matches: number,
  bonuses: [{
    'name': string,
    'points': number
  }],
  base_points: number,
  bonus_points: number,
  points: number,
  foreigner: boolean,
  photo?: string
}

interface Points {
  runs?: number,
  runs_aggregate?: number,
  fours?: number,
  sixes?: number,
  ducks?: number,
  half_centuries?: number,
  centuries?: number,
  strike_rate?: number,
  not_outs?: number,
  wickets?: number,
  wickets_aggregate?: number,
  dots?: number,
  four_wicket_hauls?: number,
  five_wicket_hauls?: number,
  six_wicket_hauls?: number,
  maidens?: number,
  hat_tricks?: number,
  economy?: number,
  catches?: number,
  stumpings?: number,
  player_of_matches?: number
}
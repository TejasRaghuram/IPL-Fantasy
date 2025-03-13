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
      name: '',
      points: 0
    }],
    base_points: 0,
    bonus_points: 0,
    points: 0,
    foreigner: false
  }
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
            this.data.photo = 
              'https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/'
              + this.data.name.replaceAll(' ', '%20') + '.png';
            this.loaded = true;
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
    name: string,
    points: number
  }],
  base_points: number,
  bonus_points: number,
  points: number,
  foreigner: boolean,
  photo?: string
}
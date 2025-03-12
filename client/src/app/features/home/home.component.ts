import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  name = '';
  league = '';
  data: League[] = []
  squads: Squad[] = []
  loaded = false;

  constructor(private router: Router, private userService: UserService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = "#EEEEEE";
    if (this.userService.username == '') {
      this.router.navigate(['/']);
    }
    this.name = this.userService.name;
    window.scrollTo(0, 0);
    fetch (environment.API_URL + '/api/user/leagues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.userService.username
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(data => {
          this.data = data;
          this.league = this.data[0].name;
          const current = this.data.find(item => item.name == this.league) || [];
          if ('name' in current) {
            current.squads.sort((a, b) => b.points - a.points);
            let rank = 1;
            for (let i = 0; i < current.squads.length; i++) {
              if (i > 0 && current.squads[i].points == current.squads[i - 1].points) {
                current.squads[i].rank = current.squads[i - 1].rank;
              } else {
                current.squads[i].rank = rank;
              }
              rank++;
            }
            const styles = 'league-team';
            for (const squad of current.squads) {
              if (squad.rank == 1 && squad.points > 0) {
                squad.class = styles + ' gold';
              } else if (squad.rank == 2 && squad.points > 0) {
                squad.class = styles + ' silver';
              } else if (squad.rank == 3 && squad.points > 0) {
                squad.class = styles + ' bronze';
              }
            }
            this.squads = current.squads;
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

  handleSelection(name: string): void {
    this.league = name;
    const current = this.data.find(item => item.name == this.league) || [];
    if ('name' in current) {
      current.squads.sort((a, b) => b.points - a.points);
      let rank = 1;
      for (let i = 0; i < current.squads.length; i++) {
        if (i > 0 && current.squads[i].points == current.squads[i - 1].points) {
          current.squads[i].rank = current.squads[i - 1].rank;
        } else {
          current.squads[i].rank = rank;
        }
        rank++;
      }
      const styles = 'league-team';
      for (const squad of current.squads) {
        if (squad.rank == 1 && squad.points > 0) {
          squad.class = styles + ' gold';
        } else if (squad.rank == 2 && squad.points > 0) {
          squad.class = styles + ' silver';
        } else if (squad.rank == 3 && squad.points > 0) {
          squad.class = styles + ' bronze';
        } else {
          squad.class = styles;
        }
        alert(squad.class);
      }
      this.squads = current.squads;
    }
  }

  handleJoinLeague(): void {
    this.router.navigate(['/join']);
  }

  handleCreateLeague(): void {
    this.router.navigate(['/create']);
  }

  handleSquad(name: string): void {
    let route = '/' + this.league + '/' + name;
    this.router.navigate([route]);
  }
}

interface League {
  name: string
  squads: [Squad]
}

interface Squad {
  username: string,
  name: string,
  points: number,
  rank?: number,
  class?: string
}
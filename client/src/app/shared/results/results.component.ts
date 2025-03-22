import { Component, OnInit } from '@angular/core';
import { ScorecardComponent } from '../scorecard/scorecard.component';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-results',
  imports: [ScorecardComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent implements OnInit {
  matchData: Match[] = []
  loaded = false;

  ngOnInit(): void {
    fetch (environment.API_URL + '/api/admin/matches', {
      method: 'GET'
    }).then(response => {
      if (response.ok) {
        return response.json().then(data => {
          for(const match of data) {
            this.matchData.push({
              title: this.getName(match.id),
              stadium: match.data.stadium.slice(match.data.stadium.lastIndexOf(', ') + 2),
              team1: match.data.team1,
              team1Score: match.data.score1,
              team2: match.data.team2,
              team2Score: match.data.score2,
              result: match.data.result
            });
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

  getName(id: number): string {
    if (id <= 70) {
      return "Match " + id + " - IPL";
    } else if (id == 71) {
      return "Qualifier 1 - IPL";
    } else if (id == 72) {
      return "Eliminator 1 - IPL";
    } else if (id == 73) {
      return "Eliminator 2 - IPL";
    } else if (id == 74) {
      return "Finals - IPL";
    } else {
      return "";
    }
  }
}

interface Match {
  title: string;
  stadium: string;
  team1: string;
  team1Score: string;
  team2: string;
  team2Score: string;
  result: string;
}
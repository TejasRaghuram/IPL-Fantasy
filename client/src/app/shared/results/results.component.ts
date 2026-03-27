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
          this.matchData = data;
          this.loaded = true;
        });
      } else {
        return response.json().then(data => {
          alert(data.error);
        });
      }
    });
  }
}

interface Match {
  title: string;
  stadium: string;
  team1: string;
  team1_score: string;
  team2: string;
  team2_score: string;
  result: string;
}
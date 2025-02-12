import { Component, OnInit } from '@angular/core';
import { ScorecardComponent } from '../scorecard/scorecard.component';

@Component({
  selector: 'app-results',
  imports: [ScorecardComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent implements OnInit {
  matchData: Match[] = []

  ngOnInit(): void {
    for (let i = 0; i < 10; i++) {
      this.matchData.push({
        title: "Title " + i,
        stadium: "Stadium",
        team1: "Team 1",
        team1Score: "Score 1",
        team2: "Team 2",
        team2Score: "Score 2",
        result: "Result"
      });
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
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scorecard',
  imports: [],
  templateUrl: './scorecard.component.html',
  styleUrl: './scorecard.component.css'
})
export class ScorecardComponent {
  @Input() title: string = "";
  @Input() stadium: string = "";
  @Input() team1: string = "";
  @Input() team1Score: string = "";
  @Input() team2: string = "";
  @Input() team2Score: string = "";
  @Input() result: string = "";
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-squad',
  imports: [],
  templateUrl: './squad.component.html',
  styleUrl: './squad.component.css'
})
export class SquadComponent implements OnInit {
  league = '';
  name = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.league = params.get('league') || '';
      this.name = params.get('name') || '';
    });
    if (this.league != 'League 0' || this.name != 'name') {
      this.router.navigate(['/error']);
    }
  }

  invalidImage(event: any): void {
    event.target.src = "https://scores.iplt20.com/ipl/images/default-player-statsImage.png?v=4";
  }
}

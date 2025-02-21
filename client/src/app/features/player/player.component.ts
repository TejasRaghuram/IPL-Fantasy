import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-player',
  imports: [],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent implements OnInit {
  name = ''
;
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.name = params.get('name') || '';
    });
    if (this.name != 'name') {
      this.router.navigate(['/error']);
    }
  }
  invalidImage(event: any): void {
    event.target.src = "https://scores.iplt20.com/ipl/images/default-player-statsImage.png?v=4";
  }
}

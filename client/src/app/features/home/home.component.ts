import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  name = '';
  league = 'League 0';

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.name = this.userService.name;
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

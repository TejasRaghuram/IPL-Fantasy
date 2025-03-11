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
  league = 'League 0';
  data = []
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
          this.loaded = true;
        });
      } else {
        return response.json().then(data => {
          alert(data.error);
        });
      }
    });
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

import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../user.service';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-join',
  imports: [FormsModule],
  templateUrl: './join.component.html',
  styleUrl: './join.component.css'
})
export class JoinComponent implements OnInit {
  leagueName = '';
  players: string[] = [];

  constructor(private router: Router, private userService: UserService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = "#EEEEEE";
    if (this.userService.username == '') {
      this.router.navigate(['/']);
    }
  }

  handleVerify(name: string, password: string): void {
    fetch (environment.API_URL + '/api/league/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        password: password
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(data => {
          this.leagueName = data.name;
          this.players = Array(data.players).fill('');
        });
      } else {
        return response.json().then(data => {
          alert(data.error);
        });
      }
    });
  }

  handleJoin(): void {
    fetch (environment.API_URL + '/api/league/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.userService.username,
        name: this.leagueName,
        players: this.players
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(data => {
          this.router.navigate(["/home"]);
        });
      } else {
        return response.json().then(data => {
          alert(data.error);
        });
      }
    });
  }
}

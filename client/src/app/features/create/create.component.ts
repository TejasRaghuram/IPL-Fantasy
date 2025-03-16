import { Component, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environment';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-create',
  imports: [FormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent implements OnInit {
  leagueName = '';
  players: string[] = [];
  name = '';

  constructor(private router: Router, private userService: UserService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = "#EEEEEE";
    if (this.userService.username == '') {
      this.router.navigate(['/']);
    }
  }
  
  handleCreate(name: string, password: string, teamSize: string): void {
    fetch (environment.API_URL + '/api/league/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        password: password,
        players: Number(teamSize)
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
        players: this.players,
        display: this.name
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

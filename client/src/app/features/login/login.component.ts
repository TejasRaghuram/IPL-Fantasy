import { NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environment';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-login',
  imports: [NgOptimizedImage, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  rememberUser = false;
  username = '';
  password = '';
  
  constructor(private elementRef: ElementRef, private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    if (this.userService.username != '') {
      this.router.navigate(['/home']);
    }
    this.elementRef.nativeElement.ownerDocument.body.style.overflow="hidden";
  }

  handleSignUp() {
    this.router.navigate(['/signup']);
  }

  handleRemember() {
    this.rememberUser = !this.rememberUser;
  }

  handleLogIn() {
    fetch (environment.API_URL + '/api/user/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.username,
        password: this.password
      })
    }).then(response => {
      if (response.ok) {
        return response.json().then(data => {
          this.userService.username = data.username;
          this.userService.name = data.name;
          if (this.rememberUser) {
            this.userService.storeCookies();
          }
          this.router.navigate(['/home']);
        });
      } else {
        return response.json().then(data => {
          alert(data.error);
        });
      }
    });
  }
}

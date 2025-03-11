import { NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environment';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-signup',
  imports: [NgOptimizedImage, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {
  rememberUser = false;
  username = '';
  name = '';
  password = '';
  
  constructor(private elementRef: ElementRef, private router: Router, private userService: UserService) {}
  
  ngOnInit(): void {
    if (this.userService.username != '') {
      this.router.navigate(['/home']);
    }
    this.elementRef.nativeElement.ownerDocument.body.style.overflow="hidden";
  }

  handleLogIn() {
    this.router.navigate(['/login']);
  }

  handleRemember() {
    this.rememberUser = !this.rememberUser;
  }

  handleSignUp() {
    fetch (environment.API_URL + '/api/user/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.username,
        name: this.name,
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

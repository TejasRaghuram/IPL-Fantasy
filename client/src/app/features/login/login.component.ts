import { NgOptimizedImage } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [NgOptimizedImage],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  rememberUser = false;
  
  constructor(private elementRef: ElementRef, private router: Router) {}

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.overflow="hidden";
  }

  handleSignUp() {
    this.router.navigate(["/signup"]);
  }

  handleRemember() {
    this.rememberUser = !this.rememberUser;
  }

  handleLogIn() {
    this.router.navigate(["/home"]);
  }
}

import { NgOptimizedImage } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [NgOptimizedImage],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  rememberUser = false;
  
  constructor(private elementRef: ElementRef, private router: Router) {}

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.overflow="hidden";
  }

  handleLogIn() {
    this.router.navigate(["/login"]);
  }

  handleRemember() {
    this.rememberUser = !this.rememberUser;
  }

  handleSignUp() {
    this.router.navigate(["/home"]);
  }
}

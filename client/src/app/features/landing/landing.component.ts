import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-landing',
  imports: [NgOptimizedImage],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit, OnDestroy {
  constructor(private elementRef: ElementRef, private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = "#FFE6BE";
    this.elementRef.nativeElement.ownerDocument.body.style.overflow="hidden";
  }

  ngOnDestroy(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = "#EEEEEE";
    this.elementRef.nativeElement.ownerDocument.body.style.overflow="auto";
  }

  handleGetStarted(): void {
    if (this.userService.username != '') {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}

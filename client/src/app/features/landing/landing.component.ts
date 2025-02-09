import { NgOptimizedImage } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [NgOptimizedImage],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit, OnDestroy {
  constructor(private elementRef: ElementRef, private router: Router) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = "#FFE6BE";
    this.elementRef.nativeElement.ownerDocument.body.style.overflow="hidden";
  }

  ngOnDestroy(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = "#EEEEEE";
    this.elementRef.nativeElement.ownerDocument.body.style.overflow="auto";
  }

  handleGetStarted(): void { 
    this.router.navigate(["/login"]);
  }
}

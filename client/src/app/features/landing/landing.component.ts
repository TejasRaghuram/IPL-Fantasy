import { NgOptimizedImage } from '@angular/common';
import { AfterViewInit, Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-landing',
  imports: [NgOptimizedImage],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements AfterViewInit {
  constructor(private elementRef : ElementRef) {}

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#FFE6BE';
    this.elementRef.nativeElement.ownerDocument.body.style.overflow="hidden";
  }
}

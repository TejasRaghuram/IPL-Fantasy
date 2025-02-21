import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  constructor(private elementRef: ElementRef, private router: Router) {}
  
  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.overflow="hidden";
  }

  handleReturn(): void {
    this.router.navigate(["/"]);
  }
}

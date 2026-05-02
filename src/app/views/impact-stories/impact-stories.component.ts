import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';

@Component({
  selector: 'app-impact-stories',
  standalone: true,
  imports: [CommonModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './impact-stories.component.html',
  styleUrl: './impact-stories.component.css',
})
export class ImpactStoriesComponent implements OnInit, AfterViewInit {
  m_sTyped1: string = '';
  m_sTyped2: string = '';
  m_sTyped3: string = '';

  m_bStoryOpen: boolean = false;
  m_bTyping1: boolean = true;
  m_bTyping2: boolean = true;
  m_bTyping3: boolean = true;
  m_bLogosVisible: boolean = false;

  m_iCurrentImageIndex: number = 0;
  m_asScreenshots: string[] = [
    '/assets/rise-assets/modal_screenshot_1.jpg',
    '/assets/rise-assets/modal_screenshot_2.jpg',
    '/assets/rise-assets/modal_screenshot_3.jpg',
    '/assets/rise-assets/modal_screenshot_4.jpg',
    '/assets/rise-assets/modal_screenshot_5.jpg'
  ];

  constructor(private m_oRouter: Router, private m_oElementRef: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.startTypingEffect();
    this.setupScrollObservers();
  }

  setupScrollObservers(): void {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.m_bLogosVisible = true;
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    const trustedSection = this.m_oElementRef.nativeElement.querySelector('.trusted-section');
    if (trustedSection) {
      observer.observe(trustedSection);
    }
  }

  startTypingEffect(): void {
    this.typeText('real-time insights', (val) => this.m_sTyped1 = val, () => this.m_bTyping1 = false, 0);
    this.typeText('respond faster', (val) => this.m_sTyped2 = val, () => this.m_bTyping2 = false, 1500);
    this.typeText('reduce costs', (val) => this.m_sTyped3 = val, () => this.m_bTyping3 = false, 3000);
  }

  typeText(text: string, updateFn: (val: string) => void, finishFn: () => void, delay: number): void {
    setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        updateFn(text.substring(0, i + 1));
        i++;
        if (i === text.length) {
          clearInterval(interval);
          finishFn();
        }
      }, 50);
    }, delay);
  }

  openStory(): void {
    this.m_bStoryOpen = true;
    this.m_iCurrentImageIndex = 0;
  }

  closeStory(): void {
    this.m_bStoryOpen = false;
  }

  nextImage(): void {
    this.m_iCurrentImageIndex = (this.m_iCurrentImageIndex + 1) % this.m_asScreenshots.length;
  }

  prevImage(): void {
    this.m_iCurrentImageIndex = (this.m_iCurrentImageIndex - 1 + this.m_asScreenshots.length) % this.m_asScreenshots.length;
  }

  navigateTo(path: string): void {
    window.scrollTo(0, 0);
    this.m_oRouter.navigateByUrl(path);
  }
}

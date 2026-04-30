import { Component } from '@angular/core';
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
export class ImpactStoriesComponent {
  m_bStoryOpen: boolean = false;
  m_iCurrentImageIndex: number = 0;
  m_asScreenshots: string[] = [
    '/assets/rise-assets/modal_screenshot_1.jpg',
    '/assets/rise-assets/modal_screenshot_2.jpg',
    '/assets/rise-assets/modal_screenshot_3.jpg',
    '/assets/rise-assets/modal_screenshot_4.jpg',
    '/assets/rise-assets/modal_screenshot_5.jpg'
  ];

  constructor(private m_oRouter: Router) {}

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
    this.m_oRouter.navigateByUrl(path);
  }
}

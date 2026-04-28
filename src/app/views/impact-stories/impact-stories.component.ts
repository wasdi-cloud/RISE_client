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

  constructor(private m_oRouter: Router) {}

  openStory(): void {
    this.m_bStoryOpen = true;
  }

  closeStory(): void {
    this.m_bStoryOpen = false;
  }

  navigateTo(path: string): void {
    this.m_oRouter.navigateByUrl(path);
  }
}

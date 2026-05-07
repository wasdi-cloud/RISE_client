import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'public-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.css',
})
export class PublicNavbarComponent {
  m_bScrolled: boolean = false;
  m_bMenuOpen: boolean = false;

  constructor(private m_oRouter: Router) {}

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.m_bScrolled = window.scrollY > 10;
  }

  toggleMenu(): void {
    this.m_bMenuOpen = !this.m_bMenuOpen;
  }

  closeMenu(): void {
    this.m_bMenuOpen = false;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }

  navigateToHome(): void {
    this.closeMenu();
    this.m_oRouter.navigate(['/']).then(() => {
      window.scrollTo(0, 0);
    });
  }
}

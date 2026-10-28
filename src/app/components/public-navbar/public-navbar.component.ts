import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConstantsService } from '../../services/constants.service';

@Component({
  selector: 'public-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.css',
})
export class PublicNavbarComponent implements OnInit {
  m_bScrolled: boolean = false;
  m_bMenuOpen: boolean = false;
  m_bLangOpen: boolean = false;
  m_sCurrentLang: string = 'EN';
  m_aoLanguages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'es', label: 'ES', name: 'Español' },
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'ar', label: 'AR', name: 'العربية' },
    { code: 'it', label: 'IT', name: 'Italiano' }
  ];

  constructor(
    private m_oRouter: Router,
    private m_oTranslateService: TranslateService,
    private m_oConstantsService: ConstantsService,
    @Inject(PLATFORM_ID) private m_oPlatformId: Object
  ) {}

  /**
   * The user is signed only when the server validated the session (user loaded in the ConstantsService)
   */
  get m_bUserIsSigned(): boolean {
    return isPlatformBrowser(this.m_oPlatformId) && !!this.m_oConstantsService.getUser();
  }

  ngOnInit(): void {
    const sCurrentLang = this.m_oTranslateService.currentLang || this.m_oTranslateService.defaultLang || 'en';
    const oLangObj = this.m_aoLanguages.find(lang => lang.code === sCurrentLang);
    if (oLangObj) {
      this.m_sCurrentLang = oLangObj.label;
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.m_bScrolled = window.scrollY > 10;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.lang-selector')) {
      this.m_bLangOpen = false;
    }
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

  toggleLangDropdown(): void {
    this.m_bLangOpen = !this.m_bLangOpen;
  }

  changeLanguage(lang: {code: string, label: string, name: string}): void {
    this.m_oTranslateService.use(lang.code);
    this.m_sCurrentLang = lang.label;
    this.m_bLangOpen = false;
  }
}

import { Component, AfterViewInit, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-platform',
  standalone: true,
  imports: [CommonModule, PublicNavbarComponent, PublicFooterComponent, TranslateModule],
  templateUrl: './platform.component.html',
  styleUrl: './platform.component.css',
})
export class PlatformComponent implements OnInit, OnDestroy, AfterViewInit {
  m_bIsConnectedVisible = false;
  m_sFullTagline = '';
  m_sVisibleTagline = '';

  m_aoFaqs: any[] = [];

  m_bVideoOpen = false;
  m_sCurrentVideoUrl = '';

  private m_oLangSubscription: Subscription | null = null;
  private m_oTaglineTimeoutRef: any = null;

  constructor(
    private m_oRouter: Router,
    private m_oElementRef: ElementRef,
    private m_oTranslateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.translateContent();
    this.m_oLangSubscription = this.m_oTranslateService.onLangChange.subscribe(() => {
      this.translateContent();
      // Restart typing effect with new language tagline
      this.typeTagline();
    });
  }

  ngOnDestroy(): void {
    if (this.m_oLangSubscription) {
      this.m_oLangSubscription.unsubscribe();
    }
    if (this.m_oTaglineTimeoutRef) {
      clearTimeout(this.m_oTaglineTimeoutRef);
    }
  }

  private translateContent(): void {
    this.m_sFullTagline = this.m_oTranslateService.instant('PLATFORM.TAGLINE') || 'Always expanding. Always portable. Always improving.';
    this.m_aoFaqs = [
      {
        question: this.m_oTranslateService.instant('PLATFORM.FAQ_Q1') || 'How can my organization get started with RISE?',
        answer: this.m_oTranslateService.instant('PLATFORM.FAQ_A1') || 'You just need one valid e-mail to start with RISE...',
        open: false
      },
      {
        question: this.m_oTranslateService.instant('PLATFORM.FAQ_Q2') || 'What are the differences between Administrator, Head Quarter or Field Operator?',
        answer: this.m_oTranslateService.instant('PLATFORM.FAQ_A2') || 'To meet the needs of larger organizations...',
        open: false
      },
      {
        question: this.m_oTranslateService.instant('PLATFORM.FAQ_Q3') || 'Which organizations or sectors is RISE designed for, and how can it improve their workflows?',
        answer: this.m_oTranslateService.instant('PLATFORM.FAQ_A3') || 'RISE is built to support a wide range of organizations...',
        open: false
      },
      {
        question: this.m_oTranslateService.instant('PLATFORM.FAQ_Q4') || 'What types of disasters can RISE monitor?',
        answer: this.m_oTranslateService.instant('PLATFORM.FAQ_A4') || 'RISE currently provides monitoring capabilities...',
        open: false
      },
      {
        question: this.m_oTranslateService.instant('PLATFORM.FAQ_Q5') || 'What sources does RISE use for its Earth Observation data?',
        answer: this.m_oTranslateService.instant('PLATFORM.FAQ_A5') || 'RISE leverages the WASDI Platform for the EO Processing...',
        open: false
      },
      {
        question: this.m_oTranslateService.instant('PLATFORM.FAQ_Q6') || 'Can RISE be used on mobile devices like tablets or smartphones?',
        answer: this.m_oTranslateService.instant('PLATFORM.FAQ_A6') || 'The RISE user interface is currently optimized for personal computers and tablets...',
        open: false
      },
      {
        question: this.m_oTranslateService.instant('PLATFORM.FAQ_Q7') || 'Does RISE support APIs or data exports?',
        answer: this.m_oTranslateService.instant('PLATFORM.FAQ_A7') || 'Yes. RISE allows users to download all maps...',
        open: false
      },
      {
        question: this.m_oTranslateService.instant('PLATFORM.FAQ_Q8') || 'What languages does RISE support at the moment?',
        answer: this.m_oTranslateService.instant('PLATFORM.FAQ_A8') || 'Currently, RISE supports the following languages...',
        open: false
      }
    ];
  }

  openVideo(videoUrl: string): void {
    this.m_sCurrentVideoUrl = videoUrl;
    this.m_bVideoOpen = true;
  }

  closeVideo(): void {
    this.m_bVideoOpen = false;
    this.m_sCurrentVideoUrl = '';
  }

  ngAfterViewInit(): void {
    // Observer for Stay Connected section
    const connectedObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.m_bIsConnectedVisible = true;
        connectedObserver.disconnect();
      }
    }, { threshold: 0.2 });

    const connectedInner = this.m_oElementRef.nativeElement.querySelector('.connected-inner');
    if (connectedInner) {
      connectedObserver.observe(connectedInner);
    }

    // Observer for Tagline typing effect
    const taglineObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.typeTagline();
        taglineObserver.disconnect();
      }
    }, { threshold: 0.8 });

    const taglineElement = this.m_oElementRef.nativeElement.querySelector('.future-tagline');
    if (taglineElement) {
      taglineObserver.observe(taglineElement);
    }
  }

  typeTagline(): void {
    if (this.m_oTaglineTimeoutRef) {
      clearTimeout(this.m_oTaglineTimeoutRef);
    }
    let i = 0;
    this.m_sVisibleTagline = '';

    const typeChar = () => {
      if (i < this.m_sFullTagline.length) {
        this.m_sVisibleTagline += this.m_sFullTagline[i];
        i++;
        this.m_oTaglineTimeoutRef = setTimeout(typeChar, 40);
      } else {
        // Pause for 3 seconds when finished, then restart
        this.m_oTaglineTimeoutRef = setTimeout(() => {
          this.m_sVisibleTagline = '';
          i = 0;
          typeChar();
        }, 3000);
      }
    };

    typeChar();
  }

  toggleFaq(index: number): void {
    this.m_aoFaqs[index].open = !this.m_aoFaqs[index].open;
  }

  navigateTo(path: string): void {
    this.m_oRouter.navigateByUrl(path);
  }
}

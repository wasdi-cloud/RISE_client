import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';

@Component({
  selector: 'app-platform',
  standalone: true,
  imports: [CommonModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './platform.component.html',
  styleUrl: './platform.component.css',
})
export class PlatformComponent implements AfterViewInit {
  m_bIsConnectedVisible = false;
  m_sFullTagline = 'Always expanding. Always portable. Always improving.';
  m_sVisibleTagline = '';

  m_aoFaqs = [
    {
      question: 'What is RISE?',
      answer: 'RISE is a cloud-based geospatial intelligence platform that provides near real-time insights for disaster risk management.',
      open: false
    },
    {
      question: 'Who can use RISE?',
      answer: 'It is designed for NGOs, government agencies, agribusinesses, and insurance companies.',
      open: false
    },
    {
      question: 'How accurate is the data?',
      answer: 'We use field-tested algorithms and high-resolution satellite data from global providers.',
      open: false
    },
    {
      question: 'Can I integrate RISE with my existing tools?',
      answer: 'Yes, we offer API integrations and support standard geospatial data formats.',
      open: false
    }
  ];

  m_bVideoOpen = false;
  m_sCurrentVideoUrl = '';

  constructor(private m_oRouter: Router, private m_oElementRef: ElementRef) {}

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
    let i = 0;
    this.m_sVisibleTagline = '';

    const typeChar = () => {
      if (i < this.m_sFullTagline.length) {
        this.m_sVisibleTagline += this.m_sFullTagline[i];
        i++;
        setTimeout(typeChar, 40);
      } else {
        // Pause for 3 seconds when finished, then restart
        setTimeout(() => {
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

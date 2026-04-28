import { Component } from '@angular/core';
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
export class PlatformComponent {
  m_aoFaqs = [
    {
      question: 'How can my organization get started with RISE?',
      answer: 'Simply register your organization, invite your team, set up your monitoring area, and start receiving near real-time satellite updates within minutes.',
      open: false,
    },
    {
      question: 'What are the differences between Administrator, Head Quarter or Field Operator?',
      answer: 'Platform Administrators have full access to all areas and settings. Field Operators are dedicated to a specific area. They can view all data exploitation for the assigned area.',
      open: false,
    },
    {
      question: 'Which organizations or sectors is RISE designed for, and how can it improve their workflows?',
      answer: 'RISE is designed for NGOs, governmental agencies, agribusinesses, and insurers who need fast, reliable geospatial intelligence for disaster response and environmental monitoring.',
      open: false,
    },
    {
      question: 'What success does RISE use for its Earth Observation data?',
      answer: 'RISE uses near real-time satellite data from multiple Earth Observation sources, processed automatically to deliver actionable hazard maps.',
      open: false,
    },
    {
      question: 'Can RISE be used on mobile devices like tablets or smartphones?',
      answer: 'Yes, RISE is optimized for cross-device access, including tablets and smartphones, ensuring teams can access critical data wherever they are.',
      open: false,
    },
    {
      question: 'How much RISE support in different languages?',
      answer: 'RISE supports multiple languages including English, French, Spanish, Arabic, and Italian, with more languages being added continuously.',
      open: false,
    },
  ];

  constructor(private m_oRouter: Router) {}

  toggleFaq(index: number): void {
    this.m_aoFaqs[index].open = !this.m_aoFaqs[index].open;
  }

  navigateTo(path: string): void {
    this.m_oRouter.navigateByUrl(path);
  }
}

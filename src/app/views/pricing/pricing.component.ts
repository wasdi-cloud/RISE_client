import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent {
  m_sBillingCycle: 'month' | 'year' = 'month';
  m_sEmail: string = '';
  m_sMessage: string = '';

  readonly m_aoPricingRows = [
    { label: 'Public Areas Only', monthly: null, ngoMonthly: null },
    { label: '1 Area',  monthly: 200,  ngoMonthly: 100  },
    { label: '3 Areas', monthly: 400,  ngoMonthly: 200  },
    { label: '5 Areas', monthly: 600,  ngoMonthly: 300  },
    { label: '10 Areas', monthly: 1000, ngoMonthly: 500 },
  ];

  constructor() {}

  getPrice(monthly: number | null): string {
    if (monthly === null) return 'FREE';
    const value = this.m_sBillingCycle === 'year' ? Math.round(monthly * 10) : monthly;
    return `€ ${value}`;
  }

  getPriceSuffix(): string {
    if (this.m_sBillingCycle === 'month') {
      return '/month';
    }
    return '/year';
  }

  sendCustomPlan(): void {
    if (!this.m_sEmail || !this.m_sMessage) {
      alert('Please fill in both your email and your message.');
      return;
    }
    const subject = encodeURIComponent('RISE Custom Plan Request');
    const body = encodeURIComponent(
      `User Email: ${this.m_sEmail}\n\n` +
      `Message:\n${this.m_sMessage}`
    );
    window.location.href = `mailto:info@wasdi.cloud?subject=${subject}&body=${body}`;
  }
}

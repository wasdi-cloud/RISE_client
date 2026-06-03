import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicNavbarComponent } from '../../components/public-navbar/public-navbar.component';
import { PublicFooterComponent } from '../../components/public-footer/public-footer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

interface PricingRow {
  labelKey: string;
  label: string;
  monthly: number | null;
  ngoMonthly: number | null;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicNavbarComponent, PublicFooterComponent, TranslateModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent implements OnInit, OnDestroy {
  m_sBillingCycle: 'month' | 'year' = 'month';
  m_sEmail: string = '';
  m_sMessage: string = '';

  m_aoPricingRows: PricingRow[] = [
    { labelKey: 'PRICING.ONLY_PUBLIC', label: 'Public Areas Only', monthly: null, ngoMonthly: null },
    { labelKey: 'PRICING.1_AREA', label: '1 Area',  monthly: 200,  ngoMonthly: 100  },
    { labelKey: 'PRICING.3_AREAS', label: '3 Areas', monthly: 400,  ngoMonthly: 200  },
    { labelKey: 'PRICING.5_AREAS', label: '5 Areas', monthly: 600,  ngoMonthly: 300  },
    { labelKey: 'PRICING.10_AREAS', label: '10 Areas', monthly: 1000, ngoMonthly: 500 },
  ];

  private m_oLangSubscription: Subscription | null = null;

  constructor(private m_oTranslateService: TranslateService) {}

  ngOnInit(): void {
    this.updateLabels();
    this.m_oLangSubscription = this.m_oTranslateService.onLangChange.subscribe(() => {
      this.updateLabels();
    });
  }

  ngOnDestroy(): void {
    if (this.m_oLangSubscription) {
      this.m_oLangSubscription.unsubscribe();
    }
  }

  private updateLabels(): void {
    this.m_aoPricingRows.forEach(row => {
      row.label = this.m_oTranslateService.instant(row.labelKey) || row.label;
    });
  }

  getPrice(monthly: number | null): string {
    if (monthly === null) {
      return this.m_oTranslateService.instant('PRICING.FREE') || 'FREE';
    }
    const value = this.m_sBillingCycle === 'year' ? Math.round(monthly * 10) : monthly;
    return `€ ${value}`;
  }

  getPriceSuffix(): string {
    if (this.m_sBillingCycle === 'month') {
      return this.m_oTranslateService.instant('PRICING.MONTHLY_SUFFIX') || '/month';
    }
    return this.m_oTranslateService.instant('PRICING.YEARLY_SUFFIX') || '/year';
  }

  sendCustomPlan(): void {
    if (!this.m_sEmail || !this.m_sMessage) {
      alert(this.m_oTranslateService.instant('PRICING.ALERT_FILL_FIELDS') || 'Please fill in both your email and your message.');
      return;
    }
    const subject = encodeURIComponent(this.m_oTranslateService.instant('PRICING.CUSTOM_SUBJECT') || 'RISE Custom Plan Request');
    const body = encodeURIComponent(
      `User Email: ${this.m_sEmail}\n\n` +
      `Message:\n${this.m_sMessage}`
    );
    window.location.href = `mailto:info@wasdi.cloud?subject=${subject}&body=${body}`;
  }
}

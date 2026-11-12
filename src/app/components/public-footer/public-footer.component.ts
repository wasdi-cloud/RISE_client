import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {BrandLogoDirective} from '../../directives/brand-logo.directive';

@Component({
  selector: 'public-footer',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslateModule, BrandLogoDirective],
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.css',
})
export class PublicFooterComponent {
  constructor(private m_oRouter: Router) {}

  navigateRoute(sRoute: string) {
    this.m_oRouter.navigate([sRoute]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  navigateToFaq() {
    this.m_oRouter.navigate(['/platform']).then(() => {
      setTimeout(() => {
        const oElement = document.getElementById('faq-section');
        if (oElement) {
          oElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    });
  }
}

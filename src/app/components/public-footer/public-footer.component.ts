import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'public-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.css',
})
export class PublicFooterComponent {

  constructor(private router: Router) {}

  navigateRoute(route: string) {
    this.router.navigate([route]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  navigateToFaq() {
    this.router.navigate(['/platform']).then(() => {
      setTimeout(() => {
        const faqEl = document.getElementById('faq-section');
        if (faqEl) {
          faqEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    });
  }
}

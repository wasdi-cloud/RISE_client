import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {PublicHomeComponent} from '../views/public-home/public-home.component';
import {BrandLogoDirective} from '../directives/brand-logo.directive';
import {BRAND_CONFIG, EMERGENCY_BRAND, RISE_BRAND} from './brand.config';

for (const oBrand of [RISE_BRAND, EMERGENCY_BRAND]) {
  describe(`${oBrand.id} public home`, () => {
    it('shows only the hero and navigation for Emergency and preserves the full RISE page', async () => {
      await TestBed.configureTestingModule({
        imports: [PublicHomeComponent, TranslateModule.forRoot()],
        providers: [provideRouter([]), {provide: BRAND_CONFIG, useValue: oBrand}],
      }).overrideComponent(PublicHomeComponent, {
        set: {
          imports: [TranslateModule, BrandLogoDirective],
          schemas: [NO_ERRORS_SCHEMA],
        },
      }).compileComponents();
      const oTranslate = TestBed.inject(TranslateService);
      oTranslate.setTranslation('en', {
        LANDING: {HERO_SUBTITLE: '{{brandName}} gives you the insights you need.'},
      });
      oTranslate.use('en');
      const oFixture = TestBed.createComponent(PublicHomeComponent);
      oFixture.detectChanges();
      const oPage: HTMLElement = oFixture.nativeElement;
      const bEmergency = oBrand.id === 'emergency';

      expect(oPage.querySelector('public-navbar')).not.toBeNull();
      expect(oPage.querySelector('.hero-title')).not.toBeNull();
      expect(oPage.querySelector('.hero-subtitle')).not.toBeNull();
      expect(oPage.querySelector('.hero-subtitle')!.textContent)
        .toBe(`${bEmergency ? 'riseforemergency.lu' : 'RISE'} gives you the insights you need.`);
      expect(oPage.querySelector('.logo-small-bianco-1')).not.toBeNull();
      expect(oPage.querySelector('.logo-small-bianco-1')!.getAttribute('src'))
        .toBe(bEmergency ? 'assets/rise-assets/emergency-logo-cropped.png' :
          'assets/rise-assets/Logo%20Small%20Bianco%201.png');
      expect(oPage.querySelector('.hero-section')!.classList.contains('emergency-hero'))
        .toBe(bEmergency);
      for (const sSelector of [
        '.rise-platform-preview-1-icon',
        '.hero-buttons', '.intro-section', '.features-section', 'public-footer',
      ]) {
        expect(oPage.querySelector(sSelector) === null).withContext(sSelector).toBe(bEmergency);
      }
      const oHeroStyle = getComputedStyle(oPage.querySelector('.hero-section')!);
      expect(oHeroStyle.animationName).toContain('cinematicPan');
      expect(oHeroStyle.backgroundImage).toContain('carles-rabada');
      oFixture.destroy();
    });
  });
}

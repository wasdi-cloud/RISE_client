import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BRAND_CONFIG, EMERGENCY_BRAND, RISE_BRAND} from '../config/brand.config';
import {BrandLogoDirective} from './brand-logo.directive';

@Component({
  standalone: true,
  imports: [BrandLogoDirective],
  template: `
    <img [riseBrandLogo]="variant" src="/assets/rise-assets/rise-logo.png" alt="RISE">
    <img riseBrandLogo="inverse" src="/assets/rise-assets/logo-white-horizontal.svg" alt="RISE">
  `,
})
class LogoHostComponent {
  variant: 'default' | 'mini' = 'default';
}

describe('BrandLogoDirective', () => {
  it('keeps existing assets and alt text for standard RISE', () => {
    TestBed.configureTestingModule({
      imports: [LogoHostComponent],
      providers: [{provide: BRAND_CONFIG, useValue: RISE_BRAND}],
    });
    const oFixture = TestBed.createComponent(LogoHostComponent);
    oFixture.detectChanges();
    const aoImages: NodeListOf<HTMLImageElement> = oFixture.nativeElement.querySelectorAll('img');

    expect(aoImages[0].getAttribute('src')).toBe('/assets/rise-assets/rise-logo.png');
    expect(aoImages[1].getAttribute('src')).toBe('/assets/rise-assets/logo-white-horizontal.svg');
    expect(aoImages[0].alt).toBe('RISE');
    oFixture.componentInstance.variant = 'mini';
    oFixture.detectChanges();
    expect(aoImages[0].getAttribute('src')).toBe('/assets/rise-assets/rise-logo.png');
  });

  it('uses the supplied emergency logo and switches to the mini logo on collapse', () => {
    TestBed.configureTestingModule({
      imports: [LogoHostComponent],
      providers: [{provide: BRAND_CONFIG, useValue: EMERGENCY_BRAND}],
    });
    const oFixture = TestBed.createComponent(LogoHostComponent);
    oFixture.detectChanges();
    const aoImages: NodeListOf<HTMLImageElement> = oFixture.nativeElement.querySelectorAll('img');

    expect(aoImages[0].getAttribute('src')).toBe('assets/rise-assets/emergency-logo-cropped.png');
    expect(aoImages[1].getAttribute('src')).toBe('assets/rise-assets/emergency-logo-cropped.png');
    expect(aoImages[0].alt).toBe('RISE for Emergency');
    expect(aoImages[1].alt).toBe('RISE for Emergency');
    oFixture.componentInstance.variant = 'mini';
    oFixture.detectChanges();
    expect(aoImages[0].getAttribute('src')).toBe('assets/rise-assets/emergency-logo-mini.png');
    oFixture.componentInstance.variant = 'default';
    oFixture.detectChanges();
    expect(aoImages[0].getAttribute('src')).toBe('assets/rise-assets/emergency-logo-cropped.png');
  });
});

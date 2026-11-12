import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BRAND_CONFIG, EMERGENCY_BRAND, RISE_BRAND} from '../config/brand.config';
import {BrandLogoDirective} from './brand-logo.directive';

@Component({
  standalone: true,
  imports: [BrandLogoDirective],
  template: `
    <img riseBrandLogo src="/assets/rise-assets/rise-logo.png" alt="RISE">
    <img riseBrandLogo="inverse" src="/assets/rise-assets/logo-white-horizontal.svg" alt="RISE">
  `,
})
class LogoHostComponent {}

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
  });

  it('uses emergency assets appropriate to light and dark backgrounds', () => {
    TestBed.configureTestingModule({
      imports: [LogoHostComponent],
      providers: [{provide: BRAND_CONFIG, useValue: EMERGENCY_BRAND}],
    });
    const oFixture = TestBed.createComponent(LogoHostComponent);
    oFixture.detectChanges();
    const aoImages: NodeListOf<HTMLImageElement> = oFixture.nativeElement.querySelectorAll('img');

    expect(aoImages[0].getAttribute('src')).toBe('assets/branding/emergency-logo.svg');
    expect(aoImages[1].getAttribute('src')).toBe('assets/branding/emergency-logo-inverse.svg');
    expect(aoImages[0].alt).toBe('RISE for Emergency');
    expect(aoImages[1].alt).toBe('RISE for Emergency');
  });
});

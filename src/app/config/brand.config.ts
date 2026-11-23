import {DOCUMENT} from '@angular/common';
import {inject, InjectionToken} from '@angular/core';

export interface BrandConfig {
  readonly id: 'rise' | 'emergency';
  readonly name: string;
  readonly favicon: string;
  readonly faviconType: string;
}

export const RISE_BRAND: BrandConfig = {
  id: 'rise',
  name: 'RISE',
  favicon: 'assets/rise-assets/logo-gold.png',
  faviconType: 'image/png',
};

export const EMERGENCY_BRAND: BrandConfig = {
  id: 'emergency',
  name: 'RISE for Emergency',
  favicon: 'assets/branding/emergency-icon.svg',
  faviconType: 'image/svg+xml',
};

export function resolveBrand(sHostname: string): BrandConfig {
  const sNormalizedHostname = sHostname.toLowerCase().replace(/\.$/, '');
  return sNormalizedHostname === 'riseforemergency.wasdi.net'
    ? EMERGENCY_BRAND
    : RISE_BRAND;
}

export const BRAND_CONFIG = new InjectionToken<BrandConfig>('Brand configuration', {
  providedIn: 'root',
  factory: () => resolveBrand(inject(DOCUMENT).location?.hostname ?? ''),
});



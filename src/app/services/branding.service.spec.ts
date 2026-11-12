import {EMERGENCY_BRAND, RISE_BRAND} from '../config/brand.config';
import {BrandingService} from './branding.service';

describe('BrandingService', () => {
  let oDocument: Document;

  beforeEach(() => {
    oDocument = document.implementation.createHTMLDocument('Original title');
    const oFavicon = oDocument.createElement('link');
    oFavicon.rel = 'icon';
    oDocument.head.append(oFavicon);
  });

  it('applies emergency identity to the document, including its favicon', () => {
    new BrandingService(oDocument, EMERGENCY_BRAND).initialize();

    expect(oDocument.documentElement.getAttribute('data-brand')).toBe('emergency');
    expect(oDocument.title).toBe('RISE for Emergency');
    expect(oDocument.querySelector('link[rel="icon"]')?.getAttribute('href'))
      .toBe('assets/branding/emergency-icon.svg');
    expect(oDocument.querySelector('link[rel="icon"]')?.getAttribute('type')).toBe('image/svg+xml');
  });

  it('restores RISE identity when initialized with the default brand', () => {
    new BrandingService(oDocument, EMERGENCY_BRAND).initialize();
    new BrandingService(oDocument, RISE_BRAND).initialize();

    expect(oDocument.documentElement.getAttribute('data-brand')).toBe('rise');
    expect(oDocument.title).toBe('RISE');
    expect(oDocument.querySelector('link[rel="icon"]')?.getAttribute('href'))
      .toBe('assets/rise-assets/logo-gold.png');
  });
});

describe('Brand color tokens', () => {
  let sOriginalBrand: string | null;

  beforeEach(() => {
    sOriginalBrand = document.documentElement.getAttribute('data-brand');
  });

  afterEach(() => {
    if (sOriginalBrand === null) {
      document.documentElement.removeAttribute('data-brand');
    } else {
      document.documentElement.setAttribute('data-brand', sOriginalBrand);
    }
  });

  function getToken(sName: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(sName).trim();
  }

  it('preserves the original RISE palette', () => {
    document.documentElement.setAttribute('data-brand', 'rise');
    expect(getToken('--rise-teal-800')).toBe('#001f28');
    expect(getToken('--rise-gold')).toBe('#efba35');
    expect(getToken('--rise-white')).toBe('#ffffff');
  });

  it('uses light surfaces, dark text, and red actions without recoloring warning semantics', () => {
    document.documentElement.setAttribute('data-brand', 'emergency');
    expect(getToken('--rise-teal-800')).toBe('#fafafa');
    expect(getToken('--rise-text-bright')).toBe('#292524');
    expect(getToken('--rise-primary-background')).toBe('#b91c1c');
    expect(getToken('--rise-primary-text')).toBe('#ffffff');
    expect(getToken('--rise-warning')).toBe('#efba35');
  });

  it('meets WCAG AA text contrast for emergency text and primary actions', () => {
    document.documentElement.setAttribute('data-brand', 'emergency');
    function luminance(sHex: string): number {
      const afChannels = [1, 3, 5].map(iOffset => {
        const fChannel = parseInt(sHex.slice(iOffset, iOffset + 2), 16) / 255;
        return fChannel <= 0.04045 ? fChannel / 12.92 : ((fChannel + 0.055) / 1.055) ** 2.4;
      });
      return afChannels[0] * 0.2126 + afChannels[1] * 0.7152 + afChannels[2] * 0.0722;
    }

    for (const [sForeground, sBackground] of [
      ['--rise-text-bright', '--rise-teal-800'],
      ['--rise-text-dim', '--rise-teal-800'],
      ['--rise-primary-text', '--rise-primary-background'],
    ]) {
      const fForeground = luminance(getToken(sForeground));
      const fBackground = luminance(getToken(sBackground));
      const fContrast = (Math.max(fForeground, fBackground) + 0.05)
        / (Math.min(fForeground, fBackground) + 0.05);
      expect(fContrast).withContext(`${sForeground} on ${sBackground}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

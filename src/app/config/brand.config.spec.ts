import {EMERGENCY_BRAND, resolveBrand, RISE_BRAND} from './brand.config';

describe('Hostname branding', () => {
  it('selects emergency branding for the configured hostname', () => {
    expect(resolveBrand('riseforemergency.wasdi.net')).toBe(EMERGENCY_BRAND);
  });

  it('normalizes hostname casing and the DNS trailing dot', () => {
    expect(resolveBrand('RISEFOREMERGENCY.WASDI.NET.')).toBe(EMERGENCY_BRAND);
  });

  for (const sHostname of [
    '', 'localhost', 'rise.wasdi.net', 'other.wasdi.net',
    'risforemergency.wasdi.net', 'riseforemergency.wasdi.net.example.org',
    'other-riseforemergency.wasdi.net', 'riseforemergency.wasdi.net@other.example.org',
  ]) {
    it(`keeps default RISE branding for "${sHostname}"`, () => {
      expect(resolveBrand(sHostname)).toBe(RISE_BRAND);
    });
  }
});

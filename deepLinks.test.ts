import { describe, it, expect } from 'vitest';
import { truemedsSearchUrl, tata1mgSearchUrl, buildDeepLinks } from '../services/deepLinks';

describe('Truemeds & Tata 1mg deep links', () => {
  it('builds Truemeds search URL for a drug', () => {
    const url = truemedsSearchUrl('Atorvastatin');
    expect(url).toContain('truemeds.in');
    expect(url).toContain(encodeURIComponent('Atorvastatin'));
  });

  it('builds Tata 1mg search URL for a drug', () => {
    const url = tata1mgSearchUrl('Metformin');
    expect(url).toContain('1mg.com');
    expect(url).toContain('Metformin');
  });

  it('buildDeepLinks returns both', () => {
    const links = buildDeepLinks('Amlodipine 5mg');
    expect(links.truemedsUrl).toMatch(/^https:\/\/www\.truemeds\.in\//);
    expect(links.tata1mgUrl).toMatch(/^https:\/\/www\.1mg\.com\//);
  });

  it('encodes special characters', () => {
    const url = tata1mgSearchUrl('Co-amoxiclav (Amox+Clav)');
    expect(url).not.toContain(' ');
    expect(url).toContain(encodeURIComponent('Co-amoxiclav (Amox+Clav)'));
  });
});

import { describe, it, expect } from 'vitest';
import {
  validateImageBytes,
  mapGatewayErrorMessage,
  isWithinSizeLimit,
  MAX_IMAGE_BYTES,
  GENERIC_OCR_ERROR,
} from '../utils/ocrSecurity';

function jpegBytes(size: number): Uint8Array {
  const buf = new Uint8Array(size);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  return buf;
}

function pngBytes(size: number): Uint8Array {
  const buf = new Uint8Array(size);
  buf[0] = 0x89;
  buf[1] = 0x50;
  buf[2] = 0x4e;
  buf[3] = 0x47;
  return buf;
}

describe('OCR image size limit protections', () => {
  it('accepts JPEG just under the byte cap', () => {
    const under = jpegBytes(MAX_IMAGE_BYTES - 1);
    const r = validateImageBytes(under);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.mime).toBe('image/jpeg');
  });

  it('rejects JPEG just over the byte cap', () => {
    const over = jpegBytes(MAX_IMAGE_BYTES + 1);
    const r = validateImageBytes(over);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('too_large');
  });

  it('accepts PNG at exactly the cap', () => {
    const exact = pngBytes(MAX_IMAGE_BYTES);
    const r = validateImageBytes(exact);
    expect(r.ok).toBe(true);
  });

  it('rejects empty buffer', () => {
    const r = validateImageBytes(new Uint8Array(0));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('empty');
  });

  it('isWithinSizeLimit matches cap', () => {
    expect(isWithinSizeLimit(MAX_IMAGE_BYTES)).toBe(true);
    expect(isWithinSizeLimit(MAX_IMAGE_BYTES + 1)).toBe(false);
    expect(isWithinSizeLimit(0)).toBe(false);
  });
});

describe('OCR invalid image headers', () => {
  it('rejects random bytes without magic header', () => {
    const junk = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
    const r = validateImageBytes(junk);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('invalid_header');
  });

  it('rejects truncated JPEG (only 2 bytes)', () => {
    const r = validateImageBytes(new Uint8Array([0xff, 0xd8]));
    // May fail header match depending on length of signature check — still not ok as full image
    expect(r.ok).toBe(false);
  });

  it('accepts valid PNG magic', () => {
    const r = validateImageBytes(pngBytes(64));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.mime).toBe('image/png');
  });
});

describe('mapGatewayErrorMessage — no leak of internal details', () => {
  const cases: { raw: unknown; expectIncludes?: string; expectNotIncludes?: string[] }[] = [
    { raw: 'ECONNREFUSED 127.0.0.1:443', expectIncludes: 'Unable to reach', expectNotIncludes: ['127.0.0.1'] },
    { raw: 'ENOTFOUND ocr-gateway.internal', expectIncludes: 'Unable to reach', expectNotIncludes: ['ocr-gateway'] },
    { raw: 'ETIMEDOUT', expectIncludes: 'Unable to reach' },
    { raw: '413 Payload Too Large', expectIncludes: 'too large' },
    { raw: 'entity too large', expectIncludes: 'too large' },
    { raw: '415 Unsupported Media Type', expectIncludes: 'Unsupported image' },
    { raw: 'invalid image format', expectIncludes: 'Unsupported image' },
    { raw: '401 Unauthorized', expectIncludes: 'temporarily unavailable' },
    { raw: '403 Forbidden', expectIncludes: 'temporarily unavailable' },
    { raw: '429 Too Many Requests', expectIncludes: 'Too many requests' },
    { raw: 'rate limit exceeded', expectIncludes: 'Too many requests' },
    { raw: '500 Internal Server Error', expectIncludes: 'temporarily unavailable' },
    { raw: '502 Bad Gateway', expectIncludes: 'temporarily unavailable' },
    { raw: '503 Service Unavailable', expectIncludes: 'temporarily unavailable' },
    { raw: 'deadline exceeded', expectIncludes: 'timed out' },
    { raw: 'timeout waiting for vision', expectIncludes: 'timed out' },
    { raw: 'ocr-gateway failed upstream', expectIncludes: 'Unable to process', expectNotIncludes: ['ocr-gateway'] },
    { raw: 'Gemini vision API quota', expectIncludes: 'Unable to process', expectNotIncludes: ['Gemini'] },
    { raw: 'OpenAI API key invalid', expectIncludes: 'Unable to process', expectNotIncludes: ['OpenAI'] },
    { raw: new Error('network socket hang up'), expectIncludes: 'Unable to reach' },
    { raw: { message: '413 payload too large from CDN' }, expectIncludes: 'too large' },
    { raw: 'completely unknown failure xyz', expectIncludes: GENERIC_OCR_ERROR.slice(0, 20) },
  ];

  for (const c of cases) {
    it(`maps ${JSON.stringify(String(c.raw).slice(0, 40))} safely`, () => {
      const msg = mapGatewayErrorMessage(c.raw);
      if (c.expectIncludes) expect(msg.toLowerCase()).toContain(c.expectIncludes.toLowerCase());
      if (c.expectNotIncludes) {
        for (const bad of c.expectNotIncludes) {
          expect(msg.toLowerCase()).not.toContain(bad.toLowerCase());
        }
      }
      // Never return empty
      expect(msg.length).toBeGreaterThan(10);
    });
  }
});

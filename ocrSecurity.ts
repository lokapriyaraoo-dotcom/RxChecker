/**
 * OCR gateway security helpers.
 * Prevents oversized payloads and invalid image headers from reaching the OCR service.
 */

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB hard cap
export const MAX_IMAGE_BYTES_SOFT = 6 * 1024 * 1024; // preferred soft limit

/** Known magic-byte signatures for allowed image types */
const SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF....WEBP
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
];

export type ImageValidationResult =
  | { ok: true; mime: string; size: number }
  | { ok: false; reason: 'too_large' | 'invalid_header' | 'empty' };

/**
 * Validate raw image bytes before they leave the device / enter the OCR gateway.
 */
export function validateImageBytes(buffer: ArrayBuffer | Uint8Array): ImageValidationResult {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  if (bytes.byteLength === 0) {
    return { ok: false, reason: 'empty' };
  }
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, reason: 'too_large' };
  }
  for (const sig of SIGNATURES) {
    if (sig.bytes.every((b, i) => bytes[i] === b)) {
      // WebP needs extra check for WEBP at offset 8
      if (sig.mime === 'image/webp') {
        const webp = [0x57, 0x45, 0x42, 0x50];
        if (webp.every((b, i) => bytes[8 + i] === b)) {
          return { ok: true, mime: sig.mime, size: bytes.byteLength };
        }
        continue;
      }
      return { ok: true, mime: sig.mime, size: bytes.byteLength };
    }
  }
  return { ok: false, reason: 'invalid_header' };
}

/**
 * Map internal / gateway error codes to a single safe user-facing message.
 * Never leak stack traces, hostnames, or internal service names.
 */
const GATEWAY_PATTERNS: { match: RegExp | string; message: string }[] = [
  { match: /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|network/i, message: 'Unable to reach the analysis service. Please try again.' },
  { match: /413|payload too large|entity too large/i, message: 'The image is too large. Please use a clearer photo under 8 MB.' },
  { match: /415|unsupported media|invalid image/i, message: 'Unsupported image format. Please use JPEG or PNG.' },
  { match: /401|403|unauthorized|forbidden/i, message: 'Service temporarily unavailable. Please try again later.' },
  { match: /429|rate limit|too many requests/i, message: 'Too many requests. Please wait a moment and try again.' },
  { match: /500|502|503|504|internal server|bad gateway/i, message: 'Analysis service is temporarily unavailable. Please try again.' },
  { match: /timeout|deadline exceeded/i, message: 'The request timed out. Please try again with a clearer image.' },
  { match: /ocr.?gateway|vision.?api|gemini|openai/i, message: 'Unable to process the prescription right now. Please try again.' },
];

export const GENERIC_OCR_ERROR =
  'We could not read the prescription. Please retake the photo or enter medicines manually.';

/**
 * Returns a generic, non-leaking message for any known gateway failure pattern.
 */
export function mapGatewayErrorMessage(raw: unknown): string {
  const text =
    typeof raw === 'string'
      ? raw
      : raw instanceof Error
        ? raw.message
        : raw && typeof raw === 'object' && 'message' in (raw as object)
          ? String((raw as { message: unknown }).message)
          : String(raw ?? '');

  for (const { match, message } of GATEWAY_PATTERNS) {
    if (typeof match === 'string' ? text.includes(match) : match.test(text)) {
      return message;
    }
  }
  // Never return the raw error
  return GENERIC_OCR_ERROR;
}

/**
 * Convenience: check a File / Blob size before reading bytes (web / RN blob paths).
 */
export function isWithinSizeLimit(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_IMAGE_BYTES;
}

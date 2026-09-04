/**
 * Deep links / search URLs for Indian pharmacy platforms.
 * Opens in external browser / app if installed.
 */

export function truemedsSearchUrl(drugName: string): string {
  const q = encodeURIComponent(drugName.trim());
  // Truemeds search
  return `https://www.truemeds.in/search/${q}`;
}

export function tata1mgSearchUrl(drugName: string): string {
  const q = encodeURIComponent(drugName.trim());
  return `https://www.1mg.com/search/all?name=${q}`;
}

export function buildDeepLinks(drugName: string) {
  return {
    truemedsUrl: truemedsSearchUrl(drugName),
    tata1mgUrl: tata1mgSearchUrl(drugName),
  };
}

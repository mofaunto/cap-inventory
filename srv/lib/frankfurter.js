const FRANKFURTER_URL = 'https://api.frankfurter.dev/v2/rate/EUR/USD';
const TIMEOUT_MS = 3000;

export async function getEurToUsd() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(FRANKFURTER_URL, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      console.warn(`[frankfurter] HTTP ${response.status}`);
      return null;
    }

    const body = await response.json();
    const rate = body?.rate;

    if (typeof rate !== 'number') {
      console.warn('[frankfurter] unexpected response shape:', body);
      return null;
    }

    return rate;
  } catch (err) {
    console.warn('[frankfurter] request failed:', err.message);
    return null;
  }
}
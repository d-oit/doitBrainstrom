// src/utils/createEmotionCache.ts
import createCache from '@emotion/cache';

export default function createEmotionCache() {
  return createCache({ key: 'mind-map-pwa' });
}

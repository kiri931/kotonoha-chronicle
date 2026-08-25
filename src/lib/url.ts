/**
 * koukou-jouhou.org ではサブパス配下（/kotonoha-chronicle/）で公開するため、
 * サイト内リンクは必ずこのヘルパーを通す。
 * import.meta.env.BASE_URL は astro.config.mjs の base（末尾スラッシュ付き）。
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** 例: link('/people/dogen/') -> '/kotonoha-chronicle/people/dogen/' */
export const link = (path: string) => `${BASE}${path.startsWith('/') ? path : '/' + path}`;

/**
 * 画像を用意できない人物のための抽象プレースホルダーSVG。
 * 実在の家紋を模写せず、value の色から幾何パターンを組み立てる。
 * 同じ id なら常に同じ絵になる（決定的）。
 */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export type PlaceholderKind = 'kamon' | 'nami' | 'kasane';

export function placeholderSvg(
  seed: string,
  colors: string[],
  opts: { size?: number } = {}
): string {
  const size = opts.size ?? 400;
  const h = hash(seed);
  const rand = rng(h);
  const kinds: PlaceholderKind[] = ['kamon', 'nami', 'kasane'];
  const kind = kinds[h % kinds.length];
  const c0 = colors[0] ?? '#5A5A4E';
  const c1 = colors[1] ?? c0;
  const c2 = colors[2] ?? c1;
  const cx = size / 2;
  const cy = size / 2;
  const parts: string[] = [];

  parts.push(`<rect width="${size}" height="${size}" fill="${c0}" fill-opacity="0.10"/>`);

  if (kind === 'kamon') {
    const petals = 5 + (h % 4); // 5〜8枚
    const r = size * 0.3;
    const pr = size * (0.09 + rand() * 0.03);
    for (let i = 0; i < petals; i++) {
      const a = (Math.PI * 2 * i) / petals - Math.PI / 2;
      parts.push(
        `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${pr.toFixed(1)}" fill="${c1}" fill-opacity="0.55"/>`
      );
    }
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${(size * 0.11).toFixed(1)}" fill="${c2}" fill-opacity="0.75"/>`);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${(size * 0.4).toFixed(1)}" fill="none" stroke="${c0}" stroke-opacity="0.35" stroke-width="${(size * 0.012).toFixed(1)}"/>`);
  } else if (kind === 'nami') {
    const rings = 5 + (h % 3);
    for (let i = rings; i >= 1; i--) {
      const r = (size * 0.44 * i) / rings;
      parts.push(
        `<circle cx="${cx}" cy="${(cy + size * 0.06).toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${i % 2 ? c1 : c2}" stroke-opacity="${(0.25 + 0.35 * (i / rings)).toFixed(2)}" stroke-width="${(size * 0.02).toFixed(1)}"/>`
      );
    }
    parts.push(`<circle cx="${cx}" cy="${(cy + size * 0.06).toFixed(1)}" r="${(size * 0.05).toFixed(1)}" fill="${c0}" fill-opacity="0.6"/>`);
  } else {
    // kasane: 重ねた菱形
    const n = 3 + (h % 3);
    for (let i = 0; i < n; i++) {
      const s = size * (0.36 - i * 0.07);
      const rot = 45 + i * (10 + rand() * 10);
      const col = [c0, c1, c2][i % 3];
      parts.push(
        `<rect x="${(cx - s / 2).toFixed(1)}" y="${(cy - s / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" fill="${col}" fill-opacity="${(0.22 + i * 0.14).toFixed(2)}" transform="rotate(${rot.toFixed(1)} ${cx} ${cy})" rx="${(size * 0.02).toFixed(1)}"/>`
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style="display:block" role="img" aria-hidden="true" focusable="false">${parts.join('')}</svg>`;
}

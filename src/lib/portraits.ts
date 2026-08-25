/**
 * src/assets/portraits/ に置いた肖像画像を、JSON の image.src 文字列から引く。
 * astro:assets に渡すため、URL文字列ではなく ImageMetadata を返す。
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/portraits/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(modules)) {
  const file = path.split('/').pop()!;
  byName.set(file, mod.default);
}

/** 見つからなければ null（呼び出し側でプレースホルダーへ） */
export function portrait(src: string | undefined | null): ImageMetadata | null {
  if (!src) return null;
  const file = src.split('/').pop()!;
  return byName.get(file) ?? null;
}

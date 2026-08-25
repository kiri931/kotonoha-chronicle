import { getCollection, type CollectionEntry } from 'astro:content';
import { eras } from '../data/eras';

export type Person = CollectionEntry<'people'>;

/** 生年（不明なら没年から概算）で並べるためのキー */
export function sortKey(p: Person): number {
  const d = p.data;
  if (d.birth !== null) return d.birth;
  if (d.death !== null) return d.death - 60;
  return 9999;
}

export async function allPeople(): Promise<Person[]> {
  const list = await getCollection('people');
  return list.sort((a, b) => sortKey(a) - sortKey(b));
}

export async function peopleByEra(eraId: string): Promise<Person[]> {
  return (await allPeople()).filter((p) => p.data.eraId === eraId);
}

export async function peopleByValue(valueId: string): Promise<Person[]> {
  return (await allPeople()).filter((p) => p.data.values.includes(valueId));
}

export function lifeLabel(p: Person): string {
  const { birth, death } = p.data;
  if (birth === null && death === null) return '生没年不詳';
  const b = birth === null ? '生年不詳' : `${birth}`;
  const d = death === null ? '没年不詳' : `${death}`;
  return `${b}–${d}`;
}

/** 年表用：年代ごとに人物をまとめる（人物がいない年代は落とす） */
export async function timeline() {
  const list = await allPeople();
  return eras
    .map((era) => ({ era, people: list.filter((p) => p.data.eraId === era.id) }))
    .filter((g) => g.people.length > 0)
    .sort((a, b) => a.era.order - b.era.order);
}

/** 全名言をフラットに */
export async function allQuotes() {
  const list = await allPeople();
  return list.flatMap((p) =>
    p.data.quotes.map((q, i) => ({ person: p, quote: q, index: i }))
  );
}

/**
 * 「今日の一言」：日付を種にした決定的な選択。
 * ビルド時ではなくブラウザ側で日付を見るのではなく、
 * ページ生成時のUTC日付で決める（静的サイトなので再ビルドまで固定）。
 */
export function pickByDate<T>(items: T[], date: Date): T {
  const key = Number(
    `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`
  );
  // 単純な混ぜ合わせ（決定的・依存なし）
  let h = key ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h = (h ^ (h >>> 16)) >>> 0;
  return items[h % items.length];
}

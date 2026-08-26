/**
 * 本文に自動でふりがな（ルビ）を付ける。
 *
 * 形態素解析（kuromoji）で読みを取り、漢字を含む語だけにルビを振る。
 * 機械が付ける読みなので、古文・人名・地名では間違えることがある。
 * 間違いは src/data/reading-overrides.ts に1行足して直す（そちらが常に優先される）。
 *
 * ビルド時にだけ動く。ブラウザへは <ruby> の結果だけが渡る。
 */
import kuromoji from 'kuromoji';
import { readingOverrides } from '../data/reading-overrides';

export type Segment =
  | { kind: 'plain'; text: string }
  | { kind: 'ruby'; text: string; reading: string };

type Tokenizer = { tokenize(t: string): Array<{ surface_form: string; reading?: string }> };

let tokenizerPromise: Promise<Tokenizer> | null = null;

function getTokenizer(): Promise<Tokenizer> {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: 'node_modules/kuromoji/dict' })
        .build((err: unknown, tokenizer: Tokenizer) => (err ? reject(err) : resolve(tokenizer)));
    });
  }
  return tokenizerPromise;
}

const katakanaToHiragana = (s: string) =>
  s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

const hasKanji = (s: string) => /[一-龯㐀-䶿]/.test(s);
const isKana = (c: string) => /[ぁ-ゟァ-ヿー]/.test(c);

/**
 * 送り仮名にはルビを振らない。
 * 「及ばず」なら「及」だけに「およ」を振る。前後の仮名は外に出す。
 */
function trimOkurigana(surface: string, reading: string): Segment[] {
  if (!reading || !hasKanji(surface)) return [{ kind: 'plain', text: surface }];

  let head = 0;
  while (head < surface.length && isKana(surface[head]) && surface[head] === reading[head]) head++;

  let tail = 0;
  while (
    tail < surface.length - head &&
    isKana(surface[surface.length - 1 - tail]) &&
    surface[surface.length - 1 - tail] === reading[reading.length - 1 - tail]
  ) {
    tail++;
  }

  const core = surface.slice(head, surface.length - tail);
  const coreReading = reading.slice(head, reading.length - tail);
  if (!core || !coreReading || !hasKanji(core)) return [{ kind: 'plain', text: surface }];
  if (core === coreReading) return [{ kind: 'plain', text: surface }];

  const out: Segment[] = [];
  if (head) out.push({ kind: 'plain', text: surface.slice(0, head) });
  out.push({ kind: 'ruby', text: core, reading: coreReading });
  if (tail) out.push({ kind: 'plain', text: surface.slice(surface.length - tail) });
  return out;
}

/** 上書き表を長い語から順に当てる。当たった部分は解析にかけない。 */
const overrideEntries = Object.entries(readingOverrides).sort((a, b) => b[0].length - a[0].length);

function splitByOverrides(
  text: string,
  extra?: Record<string, string>
): Array<{ text: string; reading?: string }> {
  let parts: Array<{ text: string; reading?: string }> = [{ text }];
  const entries = extra
    ? [...Object.entries(extra), ...overrideEntries].sort((a, b) => b[0].length - a[0].length)
    : overrideEntries;
  for (const [word, reading] of entries) {
    const next: typeof parts = [];
    for (const p of parts) {
      if (p.reading !== undefined || !p.text.includes(word)) {
        next.push(p);
        continue;
      }
      const chunks = p.text.split(word);
      chunks.forEach((c, i) => {
        if (c) next.push({ text: c });
        if (i < chunks.length - 1) next.push({ text: word, reading });
      });
    }
    parts = next;
  }
  return parts;
}

export async function annotate(
  text: string,
  /** その人物のページでだけ効かせたい読み。同じ語でも文脈で読みが変わるときに使う */
  extra?: Record<string, string>
): Promise<Segment[]> {
  if (!text || !hasKanji(text)) return [{ kind: 'plain', text }];
  const tokenizer = await getTokenizer();
  const out: Segment[] = [];

  for (const part of splitByOverrides(text, extra)) {
    if (part.reading !== undefined) {
      out.push(
        part.reading === ''
          ? { kind: 'plain', text: part.text }
          : { kind: 'ruby', text: part.text, reading: part.reading }
      );
      continue;
    }
    for (const token of tokenizer.tokenize(part.text)) {
      const surface = token.surface_form;
      if (!hasKanji(surface)) {
        out.push({ kind: 'plain', text: surface });
        continue;
      }
      const reading = token.reading ? katakanaToHiragana(token.reading) : '';
      out.push(...trimOkurigana(surface, reading));
    }
  }

  // 連続する plain はまとめる。
  // 隣り合うルビどうしも、間に仮名が無ければ1つにまとめる。
  // 「五《ご》十《じゅう》年《ねん》」のように1文字ずつ割れると読みにくいため。
  // つなげても読み方は変わらない（surface と reading を同じ順で連結するだけ）。
  const allKanji = (t: string) => /^[一-龯々〆ヶ]+$/.test(t);
  const merged: Segment[] = [];
  for (const s of out) {
    const last = merged[merged.length - 1];
    if (s.kind === 'plain' && last && last.kind === 'plain') {
      last.text += s.text;
    } else if (
      s.kind === 'ruby' && last && last.kind === 'ruby' &&
      allKanji(last.text) && allKanji(s.text)
    ) {
      last.text += s.text;
      last.reading += s.reading;
    } else {
      merged.push({ ...s });
    }
  }
  return merged;
}

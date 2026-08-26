/** ふりがなの付き方を検査する。漢字なのに読みが付かない箇所と、
 *  1文字ずつに割れている箇所（区切りの失敗）を洗い出す。 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { annotate } from '../src/lib/furigana.ts';

const dir = 'src/content/people';
const files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
const showAll = process.argv.includes('--all');
const kanji = /[一-龯]/;
let missing = 0, split = 0, total = 0;

for (const f of files) {
  const d = JSON.parse(await readFile(path.join(dir, f), 'utf-8'));
  for (const q of d.quotes) {
    const segs = await annotate(q.text, d.rubyOverrides);
    total++;
    const line = segs.map((s) => (s.kind === 'ruby' ? `${s.text}《${s.reading}》` : s.text)).join('');
    const noRuby = segs.filter((s) => s.kind === 'plain' && kanji.test(s.text));
    // 1文字ルビが3つ以上続くのは、区切りに失敗している可能性が高い
    let run = 0, badRun = false;
    for (const s of segs) {
      if (s.kind === 'ruby' && s.text.length === 1) { run++; if (run >= 3) badRun = true; }
      else if (s.kind === 'plain' && s.text.length <= 1) { /* 助詞は無視 */ }
      else run = 0;
    }
    if (noRuby.length) { missing++; console.log('読み無し', d.id.padEnd(20), noRuby.map((s) => s.text).join(' / '), '→', line); }
    else if (badRun) { split++; console.log('細切れ  ', d.id.padEnd(20), line); }
    else if (showAll) console.log('        ', d.id.padEnd(20), line);
  }
}
console.log(`--- 名言 ${total} 件中、読み無し ${missing} 件 / 細切れ ${split} 件`);

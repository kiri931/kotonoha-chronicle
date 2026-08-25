/**
 * 配色のコントラスト比と、ビルド成果物の基本的なアクセシビリティを機械的に確認する。
 * WCAG 2.1: 本文テキスト 4.5:1 以上、非テキスト（境界線・図形）3:1 以上。
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const hex = (h) => {
  const s = h.replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lum = (h) => {
  const [r, g, b] = hex(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const light = { paper: '#FBF9F4', raised: '#FFFFFF', ink: '#1F1B16', inkMuted: '#5A5248', rule: '#E0D8C9', ruleStrong: '#C6BAA6', control: '#6E6355', accent: '#7A2E2E', focus: '#1B4D8F' };
const dark = { paper: '#14120F', raised: '#1E1B17', ink: '#F2EDE4', inkMuted: '#BDB3A4', rule: '#322D26', ruleStrong: '#4C443A', control: '#8A8072', accent: '#E8A9A9', focus: '#8FBEFF' };
// 軸の色。ダークモードでは明度を上げた値（--v-<id>）を使う。
light.values = {
  wa: '#4A7C6F', makoto: '#8C3A3A', takumi: '#7A5C2E', manabi: '#34568B',
  rita: '#6B4C7A', nebari: '#5A5A4E', bi: '#A66B7E', shinshu: '#B5702A',
};
dark.values = {
  wa: '#4A7C6F', makoto: '#B64E4E', takumi: '#8D6A35', manabi: '#436FB4',
  rita: '#876099', nebari: '#707061', bi: '#A66B7E', shinshu: '#B5702A',
};

let failed = 0;
const check = (label, fg, bg, min) => {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'OK ' : 'NG '} ${label.padEnd(42)} ${r.toFixed(2)}:1 （必要 ${min}:1）`);
};

for (const [name, t] of [['ライト', light], ['ダーク', dark]]) {
  console.log(`\n== ${name}モード ==`);
  check(`本文 ink / paper`, t.ink, t.paper, 4.5);
  check(`本文 ink / paper-raised`, t.ink, t.raised, 4.5);
  check(`補助 ink-muted / paper`, t.inkMuted, t.paper, 4.5);
  check(`補助 ink-muted / paper-raised`, t.inkMuted, t.raised, 4.5);
  check(`見出し accent / paper`, t.accent, t.paper, 4.5);
  check(`反転チップ paper / ink`, t.paper, t.ink, 4.5);
  check(`操作要素の枠線 control / paper（非テキスト）`, t.control, t.paper, 3);
  check(`操作要素の枠線 control / paper-raised（非テキスト）`, t.control, t.raised, 3);
  check(`フォーカス輪郭 / paper（非テキスト）`, t.focus, t.paper, 3);
  for (const [id, c] of Object.entries(t.values)) {
    // 軸の色は目印（非テキスト）として使う。文字色には使わない。
    check(`軸の色 ${id} / paper-raised（非テキスト）`, c, t.raised, 3);
  }
}

// ビルド成果物の確認（あれば）
const dist = path.join(root, 'dist');
try {
  const pages = [];
  const walk = async (dir) => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.name.endsWith('.html')) pages.push(p);
    }
  };
  await walk(dist);
  console.log(`\n== ビルド成果物 ${pages.length} ページ ==`);
  let noAlt = 0, noLang = 0, noH1 = 0, noSkip = 0;
  for (const p of pages) {
    const html = await readFile(p, 'utf-8');
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\balt=/.test(m[0])) { noAlt++; console.log('   alt 無しの img:', path.relative(dist, p)); }
    }
    if (!/<html[^>]+lang="ja"/.test(html)) { noLang++; console.log('   lang 属性なし:', path.relative(dist, p)); }
    if (!/<h1[\s>]/.test(html)) { noH1++; console.log('   h1 なし:', path.relative(dist, p)); }
    if (!/skip-link/.test(html)) { noSkip++; console.log('   スキップリンクなし:', path.relative(dist, p)); }
  }
  console.log(`alt 無し ${noAlt} 件／lang 無し ${noLang} 件／h1 無し ${noH1} 件／スキップリンク無し ${noSkip} 件`);
  failed += noAlt + noLang + noH1 + noSkip;
} catch {
  console.log('\n（dist が無いため、ページの検査は省略しました。先に npm run build を実行してください）');
}

console.log(failed ? `\n${failed} 件の指摘があります` : '\nコントラスト・基本項目：問題なし');
process.exit(failed ? 1 : 0);

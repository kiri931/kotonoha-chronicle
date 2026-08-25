/**
 * OGP画像（1200x630 PNG）をビルド前に生成して public/og/ に置く。
 * SVGを sharp でPNG化する。日本語のフォントは実行環境のものを使うため、
 * 日本語フォントのある環境（macOS など）で実行して、生成物をリポジトリに含める。
 */
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const peopleDir = path.join(root, 'src/content/people');
const outDir = path.join(root, 'public/og');

const VALUE_COLORS = {
  wa: '#4A7C6F', makoto: '#8C3A3A', takumi: '#7A5C2E', manabi: '#34568B',
  rita: '#6B4C7A', nebari: '#5A5A4E', bi: '#A66B7E', shinshu: '#B5702A',
};

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 日本語は単語区切りが無いので、文字数で折り返す */
function wrap(text, perLine, maxLines) {
  const lines = [];
  for (let i = 0; i < text.length && lines.length < maxLines; i += perLine) {
    lines.push(text.slice(i, i + perLine));
  }
  if (text.length > perLine * maxLines) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, perLine - 1) + '…';
  }
  return lines;
}

const SERIF = "'Hiragino Mincho ProN','Noto Serif JP','Yu Mincho',serif";
const SANS = "'Hiragino Sans','Noto Sans JP','Yu Gothic',sans-serif";

function card({ title, sub, body, accent }) {
  const bodyLines = wrap(body, 22, 3);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FBF9F4"/>
  <rect x="0" y="0" width="18" height="630" fill="${accent}"/>
  <rect x="60" y="536" width="1080" height="1" fill="#C6BAA6"/>
  <text x="72" y="120" font-family="${SANS}" font-size="26" fill="#5A5248">${esc(sub)}</text>
  <text x="72" y="216" font-family="${SERIF}" font-size="76" font-weight="700" fill="#1F1B16">${esc(title)}</text>
  ${bodyLines
    .map(
      (l, i) =>
        `<text x="72" y="${320 + i * 62}" font-family="${SERIF}" font-size="40" fill="#1F1B16">${esc(l)}</text>`
    )
    .join('\n  ')}
  <text x="72" y="586" font-family="${SANS}" font-size="28" fill="#5A5248">ことのは年代記</text>
</svg>`;
}

async function render(svg, file) {
  await sharp(Buffer.from(svg)).png().toFile(file);
}

const files = (await readdir(peopleDir)).filter((f) => f.endsWith('.json'));
await mkdir(outDir, { recursive: true });

let n = 0;
for (const f of files) {
  const d = JSON.parse(await readFile(path.join(peopleDir, f), 'utf-8'));
  const accent = VALUE_COLORS[d.values[0]] ?? '#5A5A4E';
  const svg = card({
    title: d.name,
    sub: d.headline,
    body: d.quotes[0].text,
    accent,
  });
  await render(svg, path.join(outDir, `${d.id}.png`));
  n++;
}

await render(
  card({
    title: 'ことのは年代記',
    sub: '日本の偉人の言葉と歩み',
    body: '千年をこえて、まだ残っている言葉があります。',
    accent: '#7A2E2E',
  }),
  path.join(outDir, 'default.png')
);

console.log(`OGP画像を ${n + 1} 枚生成しました → public/og/`);

# -*- coding: utf-8 -*-
"""人物名の読みを src/data/person-readings.ts に書き出す。
JSON の kana をそのまま使うので、人名の読みは機械任せにならない。"""
import json, glob, os

rows = []
for f in sorted(glob.glob('src/content/people/*.json')):
    d = json.load(open(f, encoding='utf-8'))
    kana = d['kana'].replace(' ', '').replace('　', '')
    rows.append((d['name'], kana))

out = ['// 自動生成: python3 scripts/gen_person_readings.py',
       '// 出どころは各人物 JSON の kana。手で直さず、JSON 側を直して作り直すこと。',
       'export const personReadings: Record<string, string> = {']
for name, kana in rows:
    out.append(f"  '{name}': '{kana}',")
out.append('};')
open('src/data/person-readings.ts', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(f'{len(rows)}名の読みを書き出しました')

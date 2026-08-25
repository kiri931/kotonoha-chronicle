# -*- coding: utf-8 -*-
"""公開文の自己検査（仕様 §11）。"""
import json, glob, re, sys, os

BASE = os.path.join(os.path.dirname(__file__), '..', 'src', 'content', 'people')
files = sorted(glob.glob(os.path.join(BASE, '*.json')))
problems = []
# 本文に混ざってはいけない文字（キリル文字・ハングル・ラテン小文字の連続語）
CYRILLIC = re.compile(r'[Ѐ-ӿ]')
HANGUL = re.compile(r'[가-힯]')
LATIN_WORD = re.compile(r'[A-Za-z]{3,}')
BIG_SUBJECT = re.compile(r'日本人(は|が|だけ|のみ|こそ)')
PRAISE = re.compile(r'(世界一|人類史上|最も偉大|偉大な英雄|唯一無二の精神|日本だけが)')

TEXT_FIELDS = ['headline', 'summaryShort', 'history']
people = []
for f in files:
    d = json.load(open(f, encoding='utf-8'))
    people.append(d)
    texts = [d[k] for k in TEXT_FIELDS]
    texts += [n for n in (d.get('valueNotes') or {}).values()]
    for q in d['quotes']:
        texts += [q['text'], q.get('reading', ''), q['meaning'], q['source']]
    for t in texts:
        if CYRILLIC.search(t) or HANGUL.search(t):
            problems.append(f"{d['id']}: 日本語以外の文字が混入 -> {t[:40]}")
        for w in LATIN_WORD.findall(t):
            problems.append(f"{d['id']}: ラテン文字語「{w}」が本文に混入")
        if BIG_SUBJECT.search(t):
            problems.append(f"{d['id']}: 「日本人は〜」型の断定 -> {t[:40]}")
        if PRAISE.search(t):
            problems.append(f"{d['id']}: 過度な賛辞の表現 -> {t[:40]}")
    if not d['refs']:
        problems.append(f"{d['id']}: refs が空")
    if d['image']:
        for k in ('credit', 'license', 'sourceUrl'):
            if not d['image'].get(k):
                problems.append(f"{d['id']}: image.{k} が空")

ids = {d['id'] for d in people}
for d in people:
    for r in d['related']:
        if r not in ids:
            problems.append(f"{d['id']}: related の「{r}」が存在しません")

# 収録バランス
women = {'murasaki-shikibu', 'tsuda-umeko', 'yosano-akiko', 'higuchi-ichiyo', 'hirooka-asako'}
n_women = len(ids & women)
warriors = {'oda-nobunaga','toyotomi-hideyoshi','tokugawa-ieyasu','takeda-shingen','uesugi-kenshin'}
n_war = len(ids & warriors)
print(f"人物 {len(people)}名／名言 {sum(len(d['quotes']) for d in people)}件")
print(f"女性 {n_women}名（2名以上が必要）／武将 {n_war}名（半数未満が必要：{len(people)//2}名まで）")
if n_women < 2: problems.append('女性が2名未満です')
if n_war * 2 >= len(people): problems.append('武将の比率が半数以上です')

conf = {}
for d in people:
    for q in d['quotes']:
        conf[q['confidence']] = conf.get(q['confidence'], 0) + 1
print('確度の内訳:', conf)
print('肖像あり:', sum(1 for d in people if d['image']), '／なし:', sum(1 for d in people if not d['image']))

if problems:
    print('\n--- 問題 ---')
    for p in problems: print(' -', p)
    sys.exit(1)
print('\n自己検査：問題なし')

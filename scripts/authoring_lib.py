# -*- coding: utf-8 -*-
"""人物JSONを書き出す共通処理。文字数チェック付き。"""
import json, os, re, sys

OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'content', 'people')

def jlen(s: str) -> int:
    """改行を除いた文字数"""
    return len(re.sub(r'\s', '', s))

def write(p: dict, warn=True):
    errs = []
    if len(p['headline']) > 30: errs.append(f"headline {len(p['headline'])}字 >30")
    n = jlen(p['summaryShort'])
    if not (55 <= n <= 90): errs.append(f"summaryShort {n}字 (目安60-80)")
    paras = [x for x in p['history'].split('\n') if x.strip()]
    if len(paras) != 3: errs.append(f"history {len(paras)}段落 (3段落)")
    h = jlen(p['history'])
    if not (380 <= h <= 640): errs.append(f"history {h}字 (目安400-600)")
    for i, q in enumerate(p['quotes']):
        m = jlen(q['meaning'])
        if not (78 <= m <= 130): errs.append(f"quote[{i}] meaning {m}字 (目安80-120)")
    if not (1 <= len(p['values']) <= 3): errs.append('values 1-3')
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, p['id'] + '.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(p, f, ensure_ascii=False, indent=2)
        f.write('\n')
    status = 'OK ' if not errs else 'NG '
    print(status + p['id'] + ('' if not errs else '  ' + ' / '.join(errs)))
    return errs

WIKI = lambda title: {"title": f"ウィキペディア日本語版「{title}」", "url": "https://ja.wikipedia.org/wiki/" + title.replace(' ', '_'), "license": "CC BY-SA 4.0"}
WQ = lambda title: {"title": f"ウィキクォート日本語版「{title}」", "url": "https://ja.wikiquote.org/wiki/" + title.replace(' ', '_'), "license": "CC BY-SA 4.0"}

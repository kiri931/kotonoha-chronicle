# -*- coding: utf-8 -*-
"""ウィキペディア日本語版の代表画像を調べ、ライセンス条件を満たすものだけを取得する。

条件（仕様 §9.2）:
  - パブリックドメイン、CC0、CC BY のいずれかであること
  - ローカルに保存し、credit / license / sourceUrl を JSON に記録すること
ホットリンクはしない。条件を満たさない場合は image を null のままにする。
"""
import json, glob, os, sys, time, urllib.error, urllib.parse, urllib.request

UA = 'KotonohaChronicle/1.0 (educational static site; portrait licence check)'
BASE = os.path.join(os.path.dirname(__file__), '..')
PEOPLE = sorted(glob.glob(os.path.join(BASE, 'src/content/people/*.json')))
OUT = os.path.join(BASE, 'src/assets/portraits')

# ja.wikipedia の記事名（JSON の refs 先頭から取る）
def article_title(d):
    url = d['refs'][0]['url']
    return urllib.parse.unquote(url.rsplit('/', 1)[-1])

def api(host, params, tries=5):
    q = urllib.parse.urlencode(params)
    req = urllib.request.Request(f'https://{host}/w/api.php?{q}', headers={'User-Agent': UA})
    delay = 1.5
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.load(r)
            time.sleep(2.5)  # 相手のサーバーに負荷をかけない
            return data
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and i < tries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            raise

# ja.wikipedia の代表画像が花押（署名）や像の写真になってしまう人物は、
# コモンズ上の肖像画を直接指定する。
OVERRIDE = {
    'oda-nobunaga': 'Odanobunaga.jpg',
    'tokugawa-ieyasu': 'Tokugawa Ieyasu2.JPG',
    'fukuzawa-yukichi': 'Fukuzawa Yukichi 1891.jpg',
    'murasaki-shikibu': 'Murasaki Shikibu.jpg',
}

OK_LICENSES = ('public domain', 'pd-', 'cc0', 'cc by', 'cc-by')
NG_MARK = 'sa'  # CC BY-SA は表示継承のため今回は使わない（PD/CC0/CC BY のみ）

def acceptable(lic: str) -> bool:
    l = (lic or '').strip().lower()
    if not l:
        return False
    if l.startswith('cc by-sa') or l.startswith('cc-by-sa'):
        return False
    return any(l.startswith(p) for p in OK_LICENSES)

def strip_html(s):
    import re
    return re.sub(r'<[^>]+>', '', s or '').strip()

def main(dry=False):
    os.makedirs(OUT, exist_ok=True)
    report = []
    for path in PEOPLE:
        d = json.load(open(path, encoding='utf-8'))
        if d.get('image') and not dry:
            report.append((d['id'], 'have', '取得済み'))
            continue
        title = article_title(d)
        try:
            r = api('ja.wikipedia.org', {
                'action': 'query', 'prop': 'pageimages', 'piprop': 'original|name',
                'titles': title, 'format': 'json', 'formatversion': '2',
            })
            page = r['query']['pages'][0]
            fname = OVERRIDE.get(d['id']) or page.get('pageimage')
            if not fname:
                report.append((d['id'], 'skip', '代表画像なし'))
                continue
            info = api('commons.wikimedia.org', {
                'action': 'query', 'prop': 'imageinfo',
                'iiprop': 'url|extmetadata|mime', 'iiurlwidth': '900',
                'titles': 'File:' + fname, 'format': 'json', 'formatversion': '2',
            })
            p2 = info['query']['pages'][0]
            if 'imageinfo' not in p2:
                report.append((d['id'], 'skip', 'コモンズに無い（ローカル画像）'))
                continue
            ii = p2['imageinfo'][0]
            meta = ii.get('extmetadata', {})
            lic = strip_html(meta.get('LicenseShortName', {}).get('value', ''))
            artist = strip_html(meta.get('Artist', {}).get('value', '')) or '作者不明'
            credit = strip_html(meta.get('Credit', {}).get('value', ''))
            mime = ii.get('mime', '')
            if not acceptable(lic):
                report.append((d['id'], 'reject', f'ライセンス「{lic}」は条件外'))
                continue
            if mime not in ('image/jpeg', 'image/png'):
                report.append((d['id'], 'reject', f'形式 {mime}'))
                continue
            ext = '.jpg' if mime == 'image/jpeg' else '.png'
            url = ii.get('thumburl') or ii['url']
            dest = os.path.join(OUT, d['id'] + ext)
            if not dry:
                req = urllib.request.Request(url, headers={'User-Agent': UA})
                with urllib.request.urlopen(req, timeout=60) as rr, open(dest, 'wb') as f:
                    f.write(rr.read())
                d['image'] = {
                    'src': f'src/assets/portraits/{d["id"]}{ext}',
                    'credit': (artist + ('／' + credit if credit and credit != artist else ''))[:200],
                    'license': lic,
                    'sourceUrl': 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote('File:' + fname),
                }
                json.dump(d, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
                open(path, 'a', encoding='utf-8').write('\n')
            report.append((d['id'], 'ok', f'{fname} / {lic}'))
            time.sleep(0.4)
        except Exception as e:
            report.append((d['id'], 'error', str(e)[:80]))
    for r in report:
        print('\t'.join(r))
    print('---')
    print('取得:', sum(1 for r in report if r[1] == 'ok'), '／ 見送り:', sum(1 for r in report if r[1] != 'ok'))

if __name__ == '__main__':
    main(dry='--dry' in sys.argv)

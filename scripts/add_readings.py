# -*- coding: utf-8 -*-
"""reading（読み・現代語）が入っていない名言に追記する。
文語・旧かなは現代語訳、現代語のものは難読語のふりがなを含む言い換えを入れる。"""
import json, glob, os, sys

READINGS = {
 ("matsuo-basho",0): "古池（ふるいけ）に、蛙（かわず）が飛びこむ。その水の音。",
 ("miyazawa-kenji",0): "わたしという存在は、仮に置かれた電灯がひとつ青く光っているようなものです。",
 ("miyazawa-kenji",1): "みんなの本当の幸せを求めてのことなら、このまま真っ暗な海に閉じこめられても、悔やんではいけない。",
 ("natsume-soseki",0): "理屈で動けば人と衝突し、感情に流されれば押し流され、意地を通せば息苦しい。とかく人の世は住みにくい。",
 ("shibusawa-eiichi",0): "富を生む大もとは何かといえば、思いやりと道理である。道理に合った富でなければ、その富は長く続かない。",
 ("shibusawa-eiichi",2): "道徳の書である論語と、利益を数える算盤（そろばん）は、遠いようでいて実は近い。",
 ("nitobe-inazo",1): "勇気が心に宿っているとき、それは落ち着きとして外に現れる。",
 ("nitobe-inazo",2): "物事には明るい面と暗い面の両方がある。私は明るいほうから見たい。",
 ("ninomiya-sontoku",2): "道徳を欠いた経済は罪であり、経済を欠いた道徳は寝言にすぎない。",
 ("ino-tadataka",0): "ここまで来られたのは高橋至時（たかはしよしとき）先生のおかげだから、死んだあとは先生のそばで眠りたい。",
 ("kitasato-shibasaburo",0): "医者の役目は、病気を治すことより先に、病気にならないようにすることだ。",
 ("tsuda-umeko",0): "新しい苗木が芽を出すためには、一粒の種が砕けなければならない。",
 ("tsuda-umeko",1): "自分のことをいつまでも思い悩むのはやめよう。",
 ("yanagi-muneyoshi",0): "使うためであることと、美しいことが結びついたもの。それが工芸である。",
 ("yanagi-muneyoshi",1): "反抗する彼らよりも、もっと愚かなのは、押さえつけている私たちのほうだ。",
 ("makino-tomitaro",0): "日本には植物学者が少ないのだから、志す人にはできるだけ便宜をはかり、先輩が後輩を引き立てるのが筋だろう。",
 ("makino-tomitaro",1): "私は植物の精（せい）そのものだ。",
 ("okamoto-taro",0): "芸術とは、内にたまったものが外へ一気に出ることだ。",
 ("okamoto-taro",1): "既にある「形」でない形を、既にある「色」でない色を、自分で打ち出すべきだ。",
 ("kurosawa-akira",0): "監督になりたいなら、まず脚本（シナリオ）を書きなさい。",
 ("kurosawa-akira",1): "人は、自分自身のことになると正直には語れない。",
 ("tezuka-osamu",0): "お願いだから、仕事をさせてほしい。",
 ("tezuka-osamu",1): "描きたい案なら、安売りしてもいいくらい余っているんだ。",
 ("yukawa-hideki",1): "一日を生きるということが、そのまま一歩前へ進むことであってほしい。",
 ("hirooka-asako",1): "女性の教育をおろそかにする国は、栄えることがない。",
 ("kobayashi-ichizo",0): "下足番（げそくばん＝客の履物を預かる係）を命じられたら、日本一の下足番になってみろ。そうすれば誰も君を下足番のままにしておかない。",
 ("kobayashi-ichizo",1): "乗る人がいないのなら、沿線に住む人のほうを増やせばよい。",
 ("idemitsu-sazo",1): "一人も解雇してはならない。",
 ("matsushita-konosuke",0): "松下電器は人を育てるところです。あわせて電気器具も作っています。",
 ("matsushita-konosuke",1): "雨が降れば傘をさす。当たり前のことを、当たり前にやる。",
 ("matsushita-konosuke",2): "思い込みを先に置かず、ありのままを見る心になりましょう。",
 ("toyoda-kiichiro",0): "必要なものを、必要なときに、必要な数だけ作って流す。",
 ("toyoda-kiichiro",1): "外国から買うのではなく、日本人自身の知恵と手で自動車を作る。",
 ("honda-soichiro",0): "いまの私が成功と呼ばれるのなら、そこに至る過去は失敗の連続だった。",
 ("honda-soichiro",1): "人には失敗する権利がある。ただし失敗には、振り返って考えるという義務がついてくる。",
 ("ibuka-masaru",1): "他社の真似（まね）はやらないでおこう。",
 ("morita-akio",0): "消費者は、何ができるようになるかをまだ知らない。それを知っているのは我々のほうだ。",
 ("morita-akio",1): "自分たちの名前で売れないのなら、いつまでたっても下請け（したうけ）のままだ。",
 ("ando-momofuku",1): "何かを始めるのに、遅すぎるということはない。",
 ("inamori-kazuo",1): "人生や仕事の結果は、考え方と熱意と能力の掛け算で決まる。",
}

changed = 0
for f in sorted(glob.glob('src/content/people/*.json')):
    d = json.load(open(f, encoding='utf-8'))
    hit = False
    for i, q in enumerate(d['quotes']):
        key = (d['id'], i)
        if key in READINGS and not q.get('reading'):
            # text の直後に reading が来るように並べ直す
            new = {}
            for k, v in q.items():
                new[k] = v
                if k == 'text':
                    new['reading'] = READINGS[key]
            d['quotes'][i] = new
            hit = True
            changed += 1
    if hit:
        json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
        open(f, 'a', encoding='utf-8').write('\n')
print('reading を追加:', changed, '件')

missing = []
for f in sorted(glob.glob('src/content/people/*.json')):
    d = json.load(open(f, encoding='utf-8'))
    for i, q in enumerate(d['quotes']):
        if not q.get('reading'):
            missing.append(f"{d['id']}[{i}]")
print('まだ未設定:', missing if missing else 'なし')

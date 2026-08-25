# ことのは年代記（Kotonoha Chronicle）

日本の歴史上の人物の「名言」「人物史の要約」「肖像」を年代別にまとめた静的サイトです。
仕様は [`docs/SPEC.md`](docs/SPEC.md) にあります。

サイト名は仕様 §0 の候補から **1「ことのは年代記（Kotonoha Chronicle）」** を選びました
（和名と英名を併記でき、年代軸というこのサイトの構造をそのまま名前にできるため）。

現在の収録：**人物83名 / 名言178件 / 肖像53点（残り30名はプレースホルダー）**

肖像が無い人が多いのは、近年に亡くなった方や存命の方の肖像を使わない方針（仕様 §9.3）によるものです。

---

## 動かす

```sh
npm install
npm run dev            # http://localhost:4321/kotonoha-chronicle/
npm run build          # astro build → dist/ → pagefind が検索インデックスを作る
npm run preview        # ビルド結果の確認（Pagefind 検索はこちらでのみ動く）
```

補助コマンド：

```sh
npm run lint:content   # 公開文の自己検査（仕様 §11 のチェック）
npm run check:a11y     # 配色のコントラストと dist の基本項目
npm run og             # OGP画像を再生成（後述。日本語フォントのある環境で）
npm run portraits      # 肖像をライセンス確認のうえ取得（image が null の人だけ）
```

---

## 構成

```
src/
  content/people/*.json     人物データ（1人1ファイル）
  content.config.ts         Zod スキーマ
  data/eras.ts              年代区分とリード文
  data/values.ts            八つの軸（色つき）
  lib/people.ts             取得・並べ替え・「今日の一言」
  lib/placeholder.ts        肖像が無いときの抽象パターンSVG
  lib/portraits.ts          ローカル画像の解決（astro:assets へ渡す）
  components/               Portrait / QuoteBlock / PersonCard / Timeline ほか
  pages/                    / · /eras/[eraId] · /people/[id] · /values/[valueId] · /quotes · /about
  assets/portraits/         肖像画像（ローカル保存。ホットリンクはしない）
public/og/                  OGP画像（生成物をリポジトリに含めています）
scripts/                    執筆用・検査用のスクリプト
docs/SPEC.md                仕様書
```

---

## 人物を追加する手順

1. `src/content/people/<id>.json` を作ります。`id` はローマ字の slug（例 `shibusawa-eiichi`）。
   既存ファイルをコピーして書き換えるのが早いです。
2. 書く内容と長さの目安：

   | フィールド | 目安 |
   |---|---|
   | `headline` | 30字以内。肩書ではなく、その人を一言で |
   | `summaryShort` | 60〜80字。一覧カードに出ます |
   | `history` | 400〜600字・3段落。①生まれと転機 ②中心の仕事（数字や固有名を入れる）③残したもの |
   | `quotes[].meaning` | 80〜120字。【状況】【意味】【今日へ】の3要素 |
   | `values` | 八つの軸から1〜3個 |
   | `valueNotes` | 任意。軸ごとに「この人の場合」を1文 |
   | `refs` | 参照した記事とライセンス。最低1件 |

3. 長さと禁止表現を確認します。

   ```sh
   npm run lint:content
   ```

   `scripts/lint_content.py` が、文字数・段落数・関連人物の存在・
   「日本人は〜」型の断定・過度な賛辞・日本語以外の文字の混入・
   収録バランス（女性2名以上、武将が半数未満）を見ます。

4. 肖像を取りにいきます（条件を満たすものだけ入ります）。

   ```sh
   npm run portraits
   ```

5. OGP画像を作り直します。

   ```sh
   npm run og
   ```

6. ビルドして確認します。

   ```sh
   npm run build && npm run preview && npm run check:a11y
   ```

`scripts/batch01.py` 〜 `batch06.py` は、今回の30名を書いたときの原稿です。
同じ形式で追記すれば、まとめて書き出せます（`python3 scripts/batchXX.py`）。

---

## 文言ガイドの要点

- **主語を大きくしない。** 「日本人は〜だ」ではなく「この人はこうした」。
- **他国と比べて優劣をつけない。** 事実を並べて、読み手に判断してもらう。
- **評価が割れる人物は断定しない。** 「〜と評される」「諸説ある」と書く。
- **敬体（です・ます）でそろえる。** 読者は中学生以上。
- **名言の解説は説教にしない。** 最後の一文は「こう読むこともできます」の温度で止める。
- 称える言葉を足すより、具体的な数字・地名・年号を足す。そのほうが伝わります。

---

## 出典と権利の方針

- 人物解説は日本語版ウィキペディアなどを読んで**要約・再構成**したものです。原文の転載はしていません。
  参照先は各人物の `refs` に記録し、`CC BY-SA 4.0` を明記しています。/about にも説明を置いています。
- **名言の確度を3段階で表示します。** 確実（本人の著作・記録で確認できる）／諸説あり（本人の言葉とされるが異説がある）／
  伝承（後世に伝わったもの。本人の発言とは確認できていない）。出典がまったく確認できない言葉は収録していません。
  たとえば「鳴かぬなら鳴かせてみせよう」は秀吉本人の言葉ではなく江戸期の句である、と本文に明記しています。
- **肖像は パブリックドメイン / CC0 / CC BY のものだけ** をローカルに保存して使います。ホットリンクはしません。
  取得時に Wikimedia Commons のライセンス情報を機械的に確認し（`scripts/fetch_portraits.py`）、
  条件を満たさないものは落として `image: null` のままにします。
- 画像のある人物ページには credit / license / 出典ページへのリンクを表示します。

---

## 仕様から変えた点・判断した点

| 箇所 | 仕様 | 実際 | 理由 |
|---|---|---|---|
| Astro のバージョン | Astro 5 | **Astro 7** | `npm create astro` の現行版。Content Collections（`glob` ローダー + Zod）と `astro:assets` は仕様どおりに使えるため、あえて古い版を固定しませんでした |
| スキーマ | 仕様どおり | **`valueNotes` を任意で追加** | 人物ページ「この言葉が映すもの」で、軸ごとに「この人の場合」を1文添えるため。無くても表示は壊れません |
| 軸の色 | 8色を固定 | **ダーク用の色を別に持つ**（`colorDark` / CSS変数 `--v-<id>`） | 仕様の色をそのまま暗い背景に置くと、非テキストに必要な 3:1 を6色が下回ったため。ライトモードは仕様の色そのままです |
| フォント | 可変フォントを subset | **Google Fonts の CSS2 を読み込み** | Google Fonts は日本語を unicode-range で細かく分割して配信するため、実質的に必要な分だけが読み込まれます。ビルド時の subset ツール（pyftsubset 等）への依存を増やさない判断です |
| OGP画像 | 自動生成 | **`npm run og` で生成し、生成物をリポジトリに含める** | sharp の SVG 描画は実行環境の日本語フォントに依存します。日本語フォントの無い CI で生成すると文字が豆腐になるため、生成はローカルで行い、`public/og/` を成果物として持ちます。`npm run build` は OG 生成に依存しません |
| 「今日の一言」 | 日付をシードに決定的に選ぶ | **ビルド時の UTC 日付をシードにする** | 静的サイトなので、再ビルドまでは同じ言葉が出ます。日替わりにするには1日1回ビルドしてください（クライアント側で日付を見る方式は、初回表示のちらつきと JS 依存が増えるため採らず） |
| 肖像 | 条件を満たすものを収集 | **26/30名。行基・世阿弥・石田梅岩・良寛はプレースホルダー** | 行基・石田梅岩は Commons のライセンスが CC BY-SA（表示継承のため今回は使わない方針）、世阿弥・良寛は条件を満たす肖像が見つかりませんでした |
| 織田信長・徳川家康・福沢諭吉・紫式部の肖像 | — | **Commons のファイルを直接指定** | ウィキペディアの代表画像が花押（署名）などになるため、`scripts/fetch_portraits.py` の `OVERRIDE` で肖像画を指定しています |

---

## アクセシビリティ

- 本文16px以上、行間1.9。テキストのコントラストは 4.5:1 以上、境界線などの非テキストは 3:1 以上を
  ライト・ダーク両方で満たしています（`npm run check:a11y` で数値を出せます）。
- 軸は色だけでなく、名前と説明を必ず併記しています。色が見えなくても区別できます。
- スキップリンク、`aria-current`、フォーカス表示（3pxの輪郭）、
  プレースホルダー画像への説明文（`role="img"` + `aria-label`）を入れています。
- 表示テーマは「自動 / 明るい / 暗い」の3状態を切り替えられます（既定は自動＝OSの設定）。
- `prefers-reduced-motion` を尊重します。

---

## 公開先とデプロイ

**https://koukou-jouhou.org/kotonoha-chronicle/**

1ツール = 1 Cloudflare Worker の形で、サブパス配下に置いています
（学校のフィルタリング対策のため、ドメイン直下やサブドメインでは公開しない方針）。

```sh
npm run build          # dist/ を作り、pagefind が検索インデックスを入れる
npx wrangler deploy    # 本番を直接更新する。実行前に必ず一声かける
```

仕組みと注意点：

- `astro.config.mjs` に `base: '/kotonoha-chronicle'` を設定し、サイト内リンクは
  すべて `src/lib/url.ts` の `link()` を通しています。`href="/..."` を直書きすると
  サブパスから外れて404になります。
- `src/worker.ts` がURLからサブパスを剥がして `ASSETS` に渡します。
- `wrangler.jsonc` に **`"html_handling": "none"`** が必要です。既定のままだと
  Assets が `/foo/index.html` を `/foo` へ307リダイレクトし、その Location には
  サブパスが入らないため、本番で全ページが404になります（ローカルの `astro dev` では再現しません）。
  代わりに worker 側で `/` 終わりのパスに `index.html` を明示的に付けています。
- デプロイ後の確認は必ず本番URLに対して行ってください。

```sh
/usr/bin/curl -s -o /dev/null -w "%{http_code}\n" "https://koukou-jouhou.org/kotonoha-chronicle/"
```

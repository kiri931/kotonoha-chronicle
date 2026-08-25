export type ValueDef = {
  id: string;
  name: string;
  meaning: string;
  /** アクセント色（仕様 §6）。ライトモードの値 */
  color: string;
  /**
   * ダークモードで使う明度を上げた色。
   * 仕様の色をそのまま暗い背景に置くとコントラストが 3:1 を下回るため用意した。
   * 実際の描画では CSS 変数 --v-<id> を使う（cssColor を参照）。
   */
  colorDark: string;
  lead: string;
};

/** テーマに応じて切り替わる色。style 属性にはこちらを使う。 */
export const cssColor = (id: string) => `var(--v-${id})`;

export const values: ValueDef[] = [
  { id: 'wa', name: '和', meaning: '対立を調停し、場を保つ', color: '#4A7C6F', colorDark: '#4A7C6F',
    lead: '意見が割れたとき、勝ち負けをつけずに場を保つ。そのために言葉を選んだ人たちです。' },
  { id: 'makoto', name: '誠', meaning: '言と行を一致させる', color: '#8C3A3A', colorDark: '#B64E4E',
    lead: '言ったことを、そのままやる。単純ですが、続けた人は多くありません。' },
  { id: 'takumi', name: '匠', meaning: '手仕事を極める、細部への敬意', color: '#7A5C2E', colorDark: '#8D6A35',
    lead: '手を動かして覚えたことは、言葉にすると短くなります。細部を軽んじない人の言葉です。' },
  { id: 'manabi', name: '学', meaning: '学び続ける、外から学ぶ柔軟さ', color: '#34568B', colorDark: '#436FB4',
    lead: '知らないことを知らないと認め、外から取り入れる。その姿勢が残した言葉です。' },
  { id: 'rita', name: '利他', meaning: '公のために働く', color: '#6B4C7A', colorDark: '#876099',
    lead: '自分の取り分より先に、まわりのことを考えた人たち。理想論ではなく、実務としてそうしています。' },
  { id: 'nebari', name: '粘', meaning: '諦めず積み上げる', color: '#5A5A4E', colorDark: '#707061',
    lead: '一日で終わらないことを、何十年も続けた人がいます。その時間そのものが言葉になっています。' },
  { id: 'bi', name: '美', meaning: '簡素・余白・見立て', color: '#A66B7E', colorDark: '#A66B7E',
    lead: '足すのではなく、引く。空いた場所に意味を置く。日本の美意識がよく出ている言葉です。' },
  { id: 'shinshu', name: '進取', meaning: '未知へ踏み出す', color: '#B5702A', colorDark: '#B5702A',
    lead: '前例がないところへ、最初に足を踏み入れた人たちの言葉です。' },
];

export const valueMap = new Map(values.map((v) => [v.id, v]));
export const getValue = (id: string) => valueMap.get(id);

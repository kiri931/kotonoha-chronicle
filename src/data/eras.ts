export type Era = {
  id: string;
  name: string;
  rangeLabel: string;
  from: number;
  to: number;
  lead: string;
  /** 年表での並び順 */
  order: number;
};

export const eras: Era[] = [
  {
    id: 'ancient',
    name: '古代・飛鳥奈良',
    rangeLabel: '〜794',
    from: -100,
    to: 794,
    order: 1,
    lead: '国のかたちがまだ定まっていない時代です。大陸から来た制度や思想を、どう自分たちのものにするか。手探りのなかで選ばれた言葉が、のちの千年の土台になりました。',
  },
  {
    id: 'heian',
    name: '平安',
    rangeLabel: '794–1185',
    from: 794,
    to: 1185,
    order: 2,
    lead: '都に文化が集まり、仮名が生まれ、人の心を書きとめる方法が育ちました。信仰も学問も文学も、同じ都のなかで隣り合っています。',
  },
  {
    id: 'kamakura-muromachi',
    name: '鎌倉・室町',
    rangeLabel: '1185–1573',
    from: 1185,
    to: 1573,
    order: 3,
    lead: '戦乱と災害が続くなかで、一人ひとりが救いや芸の道を探した時代です。坐ること、演じること、笑うこと。それぞれの方法で答えが出されました。',
  },
  {
    id: 'sengoku',
    name: '戦国・安土桃山',
    rangeLabel: '1467–1603',
    from: 1467,
    to: 1603,
    order: 4,
    lead: '明日をも知れない時代に、人はどう決断したのか。乱世の言葉には、迷いを断つための強さと、意外なほどの繊細さが同居しています。',
  },
  {
    id: 'edo',
    name: '江戸',
    rangeLabel: '1603–1853',
    from: 1603,
    to: 1853,
    order: 5,
    lead: '大きな戦のない二百数十年です。だからこそ、道を究めること、数えること、耕すことに時間をかけられました。日常のなかの言葉が多く残っています。',
  },
  {
    id: 'bakumatsu',
    name: '幕末・維新',
    rangeLabel: '1853–1868',
    from: 1853,
    to: 1868,
    order: 6,
    lead: '十五年ほどのあいだに、国のしくみが根本から変わりました。先が見えないなかで動いた人たちの言葉は、いまも短く、速いままです。',
  },
  {
    id: 'meiji',
    name: '明治',
    rangeLabel: '1868–1912',
    from: 1868,
    to: 1912,
    order: 7,
    lead: '学び、迷い、それでも前へ。外の世界と出会った日本が、何を取り入れ、何を守ろうとしたのか。その葛藤が、そのまま言葉になっています。',
  },
  {
    id: 'taisho-showa',
    name: '大正・昭和（文化・学術）',
    rangeLabel: '1912–1989',
    from: 1912,
    to: 1989,
    order: 8,
    lead: '戦争をはさんだ激しい時代に、詩や研究や絵が続けられました。役に立つかどうかとは別の場所で、人が何かを作り続けた記録です。',
  },
  {
    id: 'keiei',
    name: '近現代の経営者',
    rangeLabel: '1900–',
    from: 1900,
    to: 2100,
    order: 9,
    lead: 'ものをつくり、人を育て、会社を続ける。その現場から生まれた言葉は、飾りがないぶん、いまも直接届きます。',
  },
  {
    id: 'gendai-gijutsu',
    name: '現代の技術者',
    rangeLabel: '1945–',
    from: 1945,
    to: 2100,
    order: 10,
    lead: '設計し、作り、動かす人たちの言葉です。ものが小さく速くなっても、決めることの中身は変わっていません。何を選んで、何を捨てるか。現場から出た言い方はいつも短いです。',
  },
];

export const eraMap = new Map(eras.map((e) => [e.id, e]));
export const getEra = (id: string) => eraMap.get(id);

/**
 * koukou-jouhou.org/kotonoha-chronicle/ 配下で配信するための Worker。
 * サブパスを剥がしてから Assets に渡す。
 */
const APP_BASE_PATH = '/kotonoha-chronicle';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

// 「HTMLを返す相手か」を Accept ヘッダで判定してはいけない。
//
// 以前は accept に text/html が入っているかで見ていた。ブラウザの画面遷移は必ず
// text/html を送るので日常の利用では問題が出なかったが、**Accept: */* で取りに来る
// 相手には末尾スラッシュ無しURLが全部404を返していた**（実測: 2026-09-07 時点の本番で
// /kotonoha-chronicle/people/dogen が Accept:*/* で404、Accept:text/html で200）。
// Search Console の URL 検査ツールが Accept:*/* で来るので、ライブテストが
// 「見つかりませんでした(404)」になり、インデックス登録をリクエストできない。
// しかも Googlebot 側には 200 が返るため、レポートの分類からは原因に辿り着けない。
//
// Accept は相手が何を送ってくるか当てにできない。代わりに「拡張子があるか」で見る。
// 拡張子付き(/_astro/*.js, /og/*.png など)は実在しなければ404が正しい。
// 拡張子なしはページのルート。
function isPageRoute(request: Request, pathname: string) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return !/\.[a-zA-Z0-9]+$/.test(pathname);
}

function stripAppBase(pathname: string) {
  if (pathname === APP_BASE_PATH) return '/';
  if (pathname.startsWith(`${APP_BASE_PATH}/`)) return pathname.slice(APP_BASE_PATH.length) || '/';
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === APP_BASE_PATH) {
      url.pathname = `${APP_BASE_PATH}/`;
      return Response.redirect(url.toString(), 308);
    }

    // workers.dev で / を開いたとき用（本番の routes には影響しない）
    if (url.pathname === '/') {
      url.pathname = `${APP_BASE_PATH}/`;
      return Response.redirect(url.toString(), 302);
    }

    const rewrittenPath = stripAppBase(url.pathname);
    if (rewrittenPath === null) return new Response('Not Found', { status: 404 });

    const assetUrl = new URL(request.url);
    assetUrl.pathname = rewrittenPath.endsWith('/') ? `${rewrittenPath}index.html` : rewrittenPath;
    const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, request));
    if (assetResponse.status !== 404) return assetResponse;

    if (isPageRoute(request, rewrittenPath)) {
      // 末尾スラッシュ無しURL（/kotonoha-chronicle/people/dogen）は、
      // 中身を返さず **301 でスラッシュ有りへ寄せる**。
      //
      // ここで index.html の中身を返すと、同じ内容がスラッシュ有無の2つのURLで
      // 配信され、canonical が指していない方が Search Console に積み上がる。
      // 301 を返して初めて Google は元のURLを手放す（307/308 では手放さない）。
      //
      // **リダイレクト先には必ず APP_BASE_PATH を付け直すこと。**
      // ASSETS の 3xx をそのまま返すと、サブパスを剥がした側のパスで正規化されて
      // /sekigae/support → /support/ のような別ページへの誘導になる。
      const probeUrl = new URL(request.url);
      probeUrl.pathname = `${rewrittenPath}/index.html`;
      const probe = await env.ASSETS.fetch(new Request(probeUrl, { method: 'HEAD' }));
      if (probe.status === 200) {
        const withSlash = new URL(url);
        withSlash.pathname = `${APP_BASE_PATH}${rewrittenPath}/`;
        return Response.redirect(withSlash.toString(), 301);
      }

      // 実体が無いページルートは 404 ページを返す
      const notFound = new URL(request.url);
      notFound.pathname = '/404.html';
      const nf = await env.ASSETS.fetch(new Request(notFound, request));
      return new Response(nf.body, { status: 404, headers: nf.headers });
    }

    return assetResponse;
  },
};

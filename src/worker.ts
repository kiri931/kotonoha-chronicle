/**
 * koukou-jouhou.org/kotonoha-chronicle/ 配下で配信するための Worker。
 * サブパスを剥がしてから Assets に渡す。
 */
const APP_BASE_PATH = '/kotonoha-chronicle';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

function isHtmlNavigation(request: Request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  return (request.headers.get('accept') ?? '').includes('text/html');
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

    // 拡張子なしURL（/kotonoha-chronicle/about など）のフォールバック
    if (isHtmlNavigation(request)) {
      const indexUrl = new URL(request.url);
      indexUrl.pathname = rewrittenPath.replace(/\/?$/, '/index.html');
      const r = await env.ASSETS.fetch(new Request(indexUrl, request));
      if (r.status !== 404) return r;
      // 404 ページを返す
      const notFound = new URL(request.url);
      notFound.pathname = '/404.html';
      const nf = await env.ASSETS.fetch(new Request(notFound, request));
      return new Response(nf.body, { status: 404, headers: nf.headers });
    }
    return assetResponse;
  },
};

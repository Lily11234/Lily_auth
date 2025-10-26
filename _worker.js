import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const target = url.pathname.replace(/^\/api/, '');
      const newUrl = new URL(target, request.url);
      return env.lily_auth.fetch(new Request(newUrl, request));
    }

    try {
      const res = await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
        }
      );
      return res;
    } catch (err) {
      console.error('Asset fetch error:', err);
      const index = await getAssetFromKV(
        {
          request: new Request(`${url.origin}/index.html`, request),
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
        }
      );
      return index;
    }
  },
};
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
      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
        }
      );
    } catch (err) {
      return new Response('Not found', { status: 404 });
    }
  },
};
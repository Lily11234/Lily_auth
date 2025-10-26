export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/verify") {
      return env.ASSETS.fetch(request);
    }

    return router.fetch(request, env, ctx);
  },
};
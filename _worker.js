export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const targetPath = url.pathname.replace(/^\/api/, "");
      const newUrl = new URL(targetPath, request.url);

      return env.lily_auth.fetch(new Request(newUrl, request));
    }

    return env.ASSETS.fetch(request);
  },
};
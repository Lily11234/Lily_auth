export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ✅ 转发 API 请求
    if (url.pathname.startsWith("/api/")) {
      const target = url.pathname.replace(/^\/api/, "");
      const newUrl = new URL(target, request.url);
      return env.lily_auth.fetch(new Request(newUrl, request));
    }

    // ✅ 其他静态文件交给 Pages
    return env.ASSETS.fetch(request);
  },
};
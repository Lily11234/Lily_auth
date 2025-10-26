export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/verify") {
      const code = url.searchParams.get("code");

      const record = await env.AUTH_DB.get(code);

      if (record) {
        const data = JSON.parse(record);
        return new Response(JSON.stringify({
          ok: true,
          message: "档案验证成功",
          hash: data.hash,
          date: data.date
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        ok: false,
        message: "未查到对应档案记录"
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return env.ASSETS.fetch(request);
  },
};
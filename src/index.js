export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/verify")) {
      const key = url.searchParams.get("key");
      if (!key) return new Response("❌ 缺少 key 参数", { status: 400 });

      const value = await env.ARCHIVE_KV.get(key);
      if (!value)
        return new Response("❌ 未找到对应档案", { status: 404 });

      const data = JSON.parse(value);

      return new Response(JSON.stringify({
        status: "✅ 验证成功",
        key: key,
        ...data
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("📦 Lily Archive Verification Worker 正常运行");
  }
};
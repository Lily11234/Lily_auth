export default {
  async fetch(request, env) {
    const { pathname, searchParams } = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (pathname.startsWith("/api/verify")) {
      const key = searchParams.get("key");
      if (!key) {
        return jsonResponse({ success: false, message: "❌ 缺少哈希参数 key" });
      }

      try {
        const record = await env.LILY_ARCHIVE_DB.get(key, { type: "json" });
        if (!record) {
          return jsonResponse({ success: false, message: "❌ 未找到对应记录" });
        }

        return jsonResponse({
          success: true,
          message: "✅ 验证成功",
          key,
          ...record,
        });
      } catch (err) {
        return jsonResponse({
          success: false,
          message: "⚠️ 查询失败：" + err.message,
        });
      }
    }

    if (pathname === "/" || pathname === "/status") {
      return new Response("Lily Archive Verification Worker 正常运行", {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("404 Not Found", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  },
};

function jsonResponse(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
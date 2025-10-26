export async function onRequestGet({ request, env }) {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie.split("auth=")[1];
  if (token !== env.ADMIN_TOKEN)
    return new Response("Unauthorized", { status: 401 });

  const list = await env.AUTH_DB.list({ prefix: "log-" });
  const logs = [];
  for (const item of list.keys) {
    const record = await env.AUTH_DB.get(item.name);
    if (record) logs.push(JSON.parse(record));
  }

  const html = `
  <!DOCTYPE html><html lang="zh-CN"><head>
  <meta charset="UTF-8"><title>审计日志 · Lily-auth</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;
    background:#f8f9fa;margin:0;padding:30px;}
    table{border-collapse:collapse;width:100%;max-width:960px;margin:auto;}
    th,td{border:1px solid #ccc;padding:8px 10px;font-size:13px;}
    th{background:#eee;}
    tr:hover{background:#f6f6f6;}
    h1{text-align:center;}
    footer{text-align:center;margin-top:30px;font-size:13px;color:#777;}
  </style>
  </head><body>
    <h1>Lily-auth 审计日志</h1>
    <p style="text-align:center;">共 ${logs.length} 条记录 · <a href="/admin/api/logs?json=1">导出 JSON</a></p>
    <table>
      <tr><th>时间</th><th>校验码</th><th>结果</th><th>说明</th><th>IP</th><th>User-Agent</th></tr>
      ${logs
        .map(
          (l) =>
            `<tr><td>${l.timestamp}</td><td>${l.code}</td><td>${
              l.valid ? "✅通过" : "❌失败"
            }</td><td>${l.reason}</td><td>${l.ip}</td><td>${
              l.ua.split(" ")[0]
            }</td></tr>`
        )
        .join("")}
    </table>
    <footer>由 Cloudflare Pages 提供支持 · Lily-auth 审计模块</footer>
  </body></html>`;

  const url = new URL(request.url);
  if (url.searchParams.get("json")) {
    return new Response(JSON.stringify(logs, null, 2), {
      headers: { "Content-Type": "application/json;charset=utf-8" },
    });
  }

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=utf-8" },
  });
}
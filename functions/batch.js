export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const batch = url.searchParams.get("batch");
  const now = new Date();
  const timeStr = now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  let results = [];
  let error = null;

  try {
    if (!batch) throw new Error("未提供批次号。");

    const list = await env.AUTH_DB.list();
    for (const item of list.keys) {
      const record = await env.AUTH_DB.get(item.name);
      if (!record) continue;
      const data = JSON.parse(record);
      if (data.batch === batch) {
        results.push({
          code: item.name,
          filename: data.filename,
          batch: data.batch,
        });
      }
    }
  } catch (e) {
    error = e.message;
  }

  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>${batch ? batch + " · 批次验证记录" : "批次查询"} · Lily-auth</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: #f8f9fa;
        margin: 0;
        padding: 40px;
        text-align: center;
      }
      h1 { color: #202124; font-size: 1.8rem; margin-bottom: 24px; }
      table {
        margin: 0 auto;
        border-collapse: collapse;
        width: 80%;
        max-width: 720px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 10px 14px;
        font-size: 14px;
      }
      th {
        background: #f2f2f2;
        font-weight: 600;
      }
      tr:hover { background: #f9f9f9; }
      a { color: #0069c2; text-decoration: none; }
      a:hover { text-decoration: underline; }
      footer { margin-top: 32px; font-size: 13px; color: #777; }
    </style>
  </head>
  <body>
    <h1>${batch ? "批次：" + batch : "批次查询"}</h1>
    <p>更新时间：${timeStr}</p>
    ${
      error
        ? `<p style="color:#d93025;">错误：${error}</p>`
        : results.length
        ? `<table><tr><th>校验码</th><th>文件名</th><th>操作</th></tr>
          ${results
            .map(
              (r) => `<tr>
                        <td><code>${r.code}</code></td>
                        <td>${r.filename}</td>
                        <td><a href="/verify?code=${r.code}">查看验证</a></td>
                      </tr>`
            )
            .join("")}
          </table>`
        : `<p>未找到与此批次号对应的记录。</p>`
    }
    <footer>
      <p>Lily-auth 系统 · <a href="https://auth.lishunyun.net">返回首页</a></p>
    </footer>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
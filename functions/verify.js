export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const now = new Date();
  const timeStr = now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  let isValid = false;
  let reason = "未提供检验码。";
  let data = null;

  if (code) {
    let exists = await env.AUTH_DB.get(code);
    if (!exists) exists = await env.AUTH_DB.get(code.toLowerCase());
    if (!exists) exists = await env.AUTH_DB.get(code.toUpperCase());

    if (exists) {
      try {
        data = JSON.parse(exists);
        isValid = true;
        reason = `验证通过：${data.filename}（${data.batch}）`;
      } catch {
        reason = "KV 数据格式错误，无法解析。";
      }
    } else {
      reason = "未检索到此哈希值。";
    }
  }

  const jsonData = {
    code: code || null,
    valid: isValid,
    result: reason,
    filename: data?.filename || null,
    batch: data?.batch || null,
    timestamp: timeStr,
    server: "Cloudflare Pages Functions · Lily-auth v2",
  };

  const accept = request.headers.get("accept") || "";
  if (accept.includes("application/json")) {
    return new Response(JSON.stringify(jsonData, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>哈希验证结果 · Lily-auth</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: #f7f8fa;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
      }
      .card {
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 4px 18px rgba(0,0,0,0.08);
        padding: 36px 48px;
        max-width: 540px;
        text-align: center;
        line-height: 1.7;
      }
      .emoji {
        font-size: 2.8rem;
        margin-bottom: 12px;
      }
      h1 {
        color: ${isValid ? "#0f9d58" : "#d93025"};
        font-size: 1.8rem;
        margin-bottom: 22px;
      }
      p {
        font-size: 15px;
        color: #333;
        margin: 8px 0;
      }
      code {
        background: #f2f3f5;
        padding: 3px 6px;
        border-radius: 5px;
        font-size: 0.95em;
        color: #555;
      }
      footer {
        margin-top: 28px;
        font-size: 13px;
        color: #777;
      }
      footer a {
        color: #0069c2;
        text-decoration: none;
      }
      footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="emoji">${isValid ? "✅" : "❌"}</div>
      <h1>${isValid ? "验证通过" : "验证失败"}</h1>
      <p><b>校验码：</b><code>${code || "(空)"}</code></p>
      <p><b>校验时间：</b>${timeStr}</p>
      ${data ? `<p><b>文件名：</b>${data.filename}</p><p><b>批次号：</b>${data.batch}</p>` : ""}
      <footer>
        <p>由 <b>Cloudflare Pages</b> 提供验证支持<br>
        Lily-auth 系统 · <a href="https://lily-auth.pages.dev">返回首页</a></p>
      </footer>
    </div>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}


export async function onRequestPost({ request }) {
  const formData = await request.formData();
  const token = formData.get('cf-turnstile-response');

  const secret = "0x4AAAAAAB8msMU3LQdN-tcy";
  const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const response = await fetch(verifyUrl, {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
  });

  const outcome = await response.json();
  if (outcome.success) {
    return new Response("验证成功", { status: 200 });
  } else {
    return new Response("验证失败", { status: 403 });
  }
}
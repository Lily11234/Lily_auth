export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const code = formData.get("code");
  const token = formData.get("cf-turnstile-response");

  if (!code || !token) {
    return new Response("缺少参数", { status: 400 });
  }

  const verifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const secret = env.TURNSTILE_SECRET;

  const response = await fetch(verifyURL, {
    method: "POST",
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  const outcome = await response.json();

  if (!outcome.success) {
    console.log("❌ Turnstile 验证失败：", outcome);
    return new Response(
      "Turnstile 验证失败，请返回重试。",
      { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  return Response.redirect(`/verify?code=${encodeURIComponent(code)}`, 302);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const timeStr = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  if (!code) {
    return new Response("缺少防伪码参数", { status: 400 });
  }

  let data = null;
  let isValid = false;
  let reason = "";

  try {
    const lower = await env.AUTH_DB.get(code.toLowerCase());
    const upper = await env.AUTH_DB.get(code.toUpperCase());
    const exists = lower || upper;

    if (exists) {
      try {
        data = JSON.parse(exists);
        isValid = true;
        reason = `验证通过：${data.filename || "无文件名"}（批次：${data.batch || "无批次号"}）`;
      } catch (e) {
        reason = "KV 数据解析失败：" + e.message;
      }
    } else {
      reason = "未找到匹配的防伪码记录。";
    }
  } catch (err) {
    reason = "KV 读取异常：" + err.message;
  }

  const jsonData = {
    code,
    valid: isValid,
    reason,
    filename: data?.filename || null,
    batch: data?.batch || null,
    timestamp: timeStr,
    server: "Lily Auth · Pages Function v2.1",
  };

  const accept = request.headers.get("Accept") || "";
  if (accept.includes("application/json")) {
    return new Response(JSON.stringify(jsonData, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>验证结果 | Lily Auth</title>
    <style>
      body {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        background: #f6f6f6;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .card {
        background: #fff;
        padding: 40px 60px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        width: 90%;
        max-width: 600px;
      }
      h1 { font-size: 26px; margin-bottom: 15px; }
      p { color: #444; font-size: 15px; margin: 6px 0; }
      .ok { color: #008000; font-weight: bold; }
      .fail { color: #d00; font-weight: bold; }
      .footer {
        margin-top: 20px;
        font-size: 13px;
        color: #777;
        border-top: 1px solid #eee;
        padding-top: 10px;
      }
      a { color: #333; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${isValid ? "✅ 验证通过" : "❌ 验证失败"}</h1>
      <p><b>防伪码：</b>${code}</p>
      <p><b>验证结果：</b><span class="${isValid ? "ok" : "fail"}">${reason}</span></p>
      ${data ? `<p><b>文件名：</b>${data.filename || "—"}</p>
                <p><b>批次号：</b>${data.batch || "—"}</p>` : ""}
      <p><b>验证时间：</b>${timeStr}</p>
      <div class="footer">
        <p>档案真实性验证系统 · Lily Auth © 2025</p>
        <p><a href="/">返回首页</a></p>
      </div>
    </div>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
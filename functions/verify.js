export async function onRequestGet({ request }) {
  // 1️⃣ 解析 URL 参数
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // 2️⃣ 获取时间戳
  const now = new Date();
  const timeStr = now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  // 3️⃣ 模拟验证逻辑（你可以替换成哈希验证逻辑）
  let isValid = false;
  let reason = "未提供验证码";

  if (code) {
    if (/^[a-f0-9]{6,}$/i.test(code)) {
      // 示例：简单规则，长度大于6且符合16进制格式
      isValid = true;
      reason = "哈希格式正确，校验通过";
    } else {
      reason = "格式不正确，校验失败";
    }
  }

  // 4️⃣ 生成响应内容
  const jsonData = {
    code: code || null,
    valid: isValid,
    reason,
    timestamp: timeStr,
    server: "Cloudflare Pages Functions",
  };

  // 判断是否为程序访问（返回 JSON）
  const accept = request.headers.get("accept") || "";
  const wantsJSON = accept.includes("application/json");

  if (wantsJSON) {
    return new Response(JSON.stringify(jsonData, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // 浏览器访问返回 HTML
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>哈希验证中心</title>
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        background: #fafafa;
        margin: 3em auto;
        max-width: 600px;
        padding: 2em;
        border-radius: 12px;
        border: 1px solid #ddd;
      }
      h1 { color: ${isValid ? "#2e8b57" : "#b22222"}; }
      code { background: #f0f0f0; padding: 2px 5px; border-radius: 4px; }
      footer { margin-top: 2em; font-size: 0.8em; color: #666; }
    </style>
  </head>
  <body>
    <h1>${isValid ? "✅ 验证通过" : "❌ 验证失败"}</h1>
    <p><b>校验码：</b> <code>${code || "（无）"}</code></p>
    <p><b>结果说明：</b> ${reason}</p>
    <p><b>校验时间：</b> ${timeStr}</p>
    <footer>
      由 Cloudflare Pages 提供验证服务<br/>
      Lily-auth 系统 | <a href="https://auth.lishuyun.net">返回首页</a>
    </footer>
  </body>
  </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
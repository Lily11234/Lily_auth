export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const timeStr = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  let isValid = false;
  let data = null;
  let reason = "";

  if (!code) {
    return new Response("缺少防伪码参数", { status: 400 });
  }

  try {
    const lower = await env.AUTH_DB.get(code.toLowerCase());
    const upper = await env.AUTH_DB.get(code.toUpperCase());
    const exists = lower || upper;

    if (exists) {
      data = JSON.parse(exists);
      isValid = true;
      reason = `验证通过：${data.filename}【${data.batch}】`;
    } else {
      reason = "未找到匹配的防伪码记录";
    }
  } catch (err) {
    reason = "KV 数据读取异常：" + err.message;
  }

  const jsonData = {
    code,
    valid: isValid,
    reason,
    filename: data?.filename || null,
    batch: data?.batch || null,
    timestamp: timeStr,
    server: "Lily Auth · Pages Function v2.1"
  };

  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head><meta charset="UTF-8"><title>验证结果</title></head>
  <body>
    <div style="text-align:center;margin-top:4em;">
      <h1>${isValid ? "✅ 验证通过" : "❌ 验证失败"}</h1>
      <p><b>防伪码：</b>${code}</p>
      <p><b>结果：</b>${reason}</p>
      <p><b>时间：</b>${timeStr}</p>
      <p><a href="/">返回验证页</a></p>
    </div>
  </body>
  </html>`;

  const accept = request.headers.get("Accept") || "";
  if (accept.includes("application/json")) {
    return new Response(JSON.stringify(jsonData, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
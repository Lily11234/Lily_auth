import { sha256 } from 'js-sha256';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response(await errorPage("未提供防伪码", "请返回主页输入后再试。"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const recordJSON = await env.AUTH_DB.get(code);
    if (!recordJSON) {
      return new Response(await errorPage("未找到该编号", "请检查输入是否正确。"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const record = JSON.parse(recordJSON);
    const secret = env.AUTH_SECRET || "LILY-2025-KEY";
    const expected = sha256(record.filename + record.batch + secret);

    if (record.hash && record.hash === expected) {
      return new Response(await successPage(record), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } else {
      return new Response(await errorPage("签名校验失败", "此数据可能已被篡改。"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  },
};

async function successPage(record) {
  return `
  <html lang="zh">
  <head>
    <meta charset="utf-8">
    <title>验证成功 | 档案验证系统</title>
    <style>
      body { font-family: "宋体", "PingFang SC", sans-serif; background:#f6f8f6; text-align:center; padding:60px; }
      .card { background:white; border:1px solid #bbb; display:inline-block; padding:30px 60px; box-shadow:0 3px 10px rgba(0,0,0,0.08); }
      h1 { color:#006633; font-size:22px; margin-bottom:20px; }
      table { margin:auto; text-align:left; border-collapse:collapse; font-size:15px; }
      td { padding:6px 12px; border-bottom:1px solid #ddd; }
      .footer { margin-top:25px; color:#666; font-size:13px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>✅ 文件验证通过</h1>
      <table>
        <tr><td><b>文件名：</b></td><td>${record.filename}</td></tr>
        <tr><td><b>批次号：</b></td><td>${record.batch}</td></tr>
        <tr><td><b>状态：</b></td><td>系统签名验证通过</td></tr>
      </table>
      <div class="footer">档案验证系统 · Cloudflare Workers</div>
    </div>
  </body>
  </html>`;
}

async function errorPage(title, message) {
  return `
  <html lang="zh">
  <head>
    <meta charset="utf-8">
    <title>${title} | 档案验证系统</title>
    <style>
      body { font-family: "宋体", "PingFang SC", sans-serif; background:#f9f5f5; text-align:center; padding:60px; }
      .card { background:white; border:1px solid #d93025; display:inline-block; padding:30px 60px; box-shadow:0 3px 10px rgba(0,0,0,0.08); }
      h1 { color:#d93025; font-size:22px; margin-bottom:20px; }
      .msg { color:#666; font-size:15px; }
      .footer { margin-top:25px; color:#999; font-size:13px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${title}</h1>
      <div class="msg">${message}</div>
      <div class="footer">档案验证系统 · Cloudflare Workers</div>
    </div>
  </body>
  </html>`;
}
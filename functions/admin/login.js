export async function onRequestGet() {
  return new Response(`
  <!DOCTYPE html><html lang="zh-CN"><head>
  <meta charset="UTF-8"><title>后台登录 · Lily-auth</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;
    display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f6fa;}
    form{background:#fff;padding:40px 50px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.08);text-align:center;}
    input{padding:10px 14px;font-size:15px;border:1px solid #ccc;border-radius:6px;width:220px;}
    button{margin-top:16px;padding:10px 16px;border:none;border-radius:6px;background:#0f9d58;color:#fff;cursor:pointer;}
  </style></head><body>
    <form method="POST"><h2>Lily-auth 管理登录</h2>
      <p><input name="token" type="password" placeholder="输入访问令牌" required></p>
      <button type="submit">登录</button>
    </form>
  </body></html>`, { headers: { "Content-Type": "text/html;charset=utf-8" } });
}

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const token = form.get("token");
  if (token === env.ADMIN_TOKEN) {
    const res = new Response(`<script>location.href='/admin/dashboard'</script>`, {
      headers: { "Set-Cookie": `auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax` }
    });
    return res;
  } else {
    return new Response(`<p>❌ 访问令牌错误。</p>`, { headers: { "Content-Type": "text/html;charset=utf-8" } });
  }
}
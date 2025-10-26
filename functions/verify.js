export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const token = body.token;
    const code = body.code;

    const secret = "0x4AAAAAAB8msEdkjmlt0lYu2gQicmjkkOQ";

    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);

    const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

    const verifyResult = await verifyResponse.json();
    if (!verifyResult.success) {
      return new Response(
        JSON.stringify({ success: false, reason: "人机验证失败" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    const record = await env.AUTH_DB.get(code.toLowerCase());
    if (!record) {
      return new Response(
        JSON.stringify({ success: false, reason: "未查询到档案记录" }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    const data = JSON.parse(record);
    return new Response(
      JSON.stringify({
        success: true,
        reason: `验证成功：${data.filename}（批次：${data.batch || "无" }）`,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, reason: `服务器错误：${err.message}` }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const token = body["cf-turnstile-response"];
    const secret = "0x4AAAAAAB8msMU3LQdN-tcy";

    const formData = new FormData();
    formData.append("secret", env.TURNSTILE_SECRET);
    formData.append("response", token);

    const verifyResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.success) {
      return new Response(
        JSON.stringify({ success: false, reason: "验证码验证失败" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    const record = await env.AUTH_DB.get(code.toLowerCase());
    if (!record) {
      return new Response(
        JSON.stringify({ success: false, reason: "未找到对应的防伪记录" }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    const data = JSON.parse(record);
    return new Response(
      JSON.stringify({
        success: true,
        reason: `验证通过：${data.filename || "未知文件"}（批次号：${data.batch || "无批次号"}）`,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, reason: `系统错误：${err.message}` }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
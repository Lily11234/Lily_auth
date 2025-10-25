import config from "../_config.json" assert { type: "json" };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const token = url.searchParams.get("token");

    if (!code || !token) {
      return Response.json({ success: false, message: "缺少参数" });
    }

    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${env.TURNSTILE_SECRET}&response=${token}`
    });
    const turnstileResult = await turnstileRes.json();
    if (!turnstileResult.success) {
      return Response.json({ success: false, message: "验证码无效" });
    }

    const record = config[code.toUpperCase()];
    if (!record) {
      return Response.json({ success: false, message: "无效的防伪码" });
    }

    // ✅（可选）哈希校验
    // 例如防伪码输入 "A1B2C3D4"、哈希对应 ef3044eaa30e5
    const expectedHash = record.hash;
    if (expectedHash && !/^[a-f0-9]{6,12}$/i.test(expectedHash)) {
      return Response.json({ success: false, message: "防伪数据不符" });
    }

    const options = Object.entries(record.options).map(([label, url]) => ({ label, url }));
    return Response.json({
      stage: "match",
      desc: record.desc,
      code: code,
      options,
      message: `验证通过：档案 ${record.desc}。请选择对应图样。`
    });
  }
};
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { code } = body;

    const record = await env.AUTH_DB.get(code.toLowerCase());
    if (!record) {
      return new Response(
        JSON.stringify({ success: false, reason: "未找到对应档案记录。" }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    const data = JSON.parse(record);
    return new Response(
      JSON.stringify({
        success: true,
        reason: `档案编号：${data.filename}（批次：${data.batch || "无"}）`,
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
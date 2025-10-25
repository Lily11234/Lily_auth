export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const code = url.searchParams.get("key") || url.searchParams.get("code");
    const choice = url.searchParams.get("choice");

    if (!code) {
      return Response.json(
        { success: false, message: "❌ 缺少参数：key 或 code" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    try {
      const value = await env.ARCHIVE_KV.get(code);
      if (!value) {
        return Response.json(
          { success: false, message: "❌ 未找到匹配的签章记录" },
          {
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );
      }

      const record = JSON.parse(value);

      if (!choice) {
        return Response.json(
          {
            success: true,
            message: "✅ 记录已找到",
            ...record,
          },
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );
      }

      if (String(choice).trim() === String(record.correct).trim()) {
        return Response.json(
          {
            success: true,
            message: `✅ 匹配成功：${record.desc}`,
            match: true,
            ...record,
          },
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );
      } else {
        return Response.json(
          {
            success: false,
            message: `⚠️ 匹配失败：应为 ${record.correct}`,
            match: false,
            ...record,
          },
          {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );
      }
    } catch (err) {
      return Response.json(
        {
          success: false,
          message: `💥 Worker 执行异常：${err.message}`,
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }
  },
};
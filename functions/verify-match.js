import config from "../_config.json" assert { type: "json" };

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const choice = url.searchParams.get("choice");

    const record = config[code.toUpperCase()];
    if (!record) {
      return Response.json({ success: false, message: "无效的档案防伪码" });
    }

    if (choice === record.correct) {
      return Response.json({
        success: true,
        message: `验证成功：${record.desc}（匹配图样：${record.correct}）`
      });
    } else {
      return Response.json({
        success: false,
        message: `图文匹配错误。正确答案为 ${record.correct}`
      });
    }
  }
};
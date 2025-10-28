document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector("#codeInput");
  const button = document.querySelector("#verifyBtn");
  const message = document.querySelector("#message");

  async function verify() {
    const code = input.value.trim().toUpperCase();
    message.textContent = "正在验证，请稍候...";

    if (!/^[A-Z0-9]{8,20}$/.test(code)) {
      message.textContent = "系统错误：请输入 8–20 位大写英数字组成的防伪码。";
      return;
    }

    try {
      const res = await fetch(`/api/verify?code=${code}`);
      const data = await res.json();

      if (data.valid) {
        message.innerHTML = `✅ 验证成功：${data.result}`;
      } else {
        message.innerHTML = `⚠️ 验证失败：${data.result}`;
      }
    } catch (err) {
      message.textContent = "网络错误或服务器暂不可用。";
    }
  }

  button.addEventListener("click", verify);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") verify();
  });
});
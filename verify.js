let turnstileValid = false;
let turnstileToken = null;

function onTurnstileCompleted(token) {
  console.log("✅ Turnstile 验证成功:", token);
  turnstileValid = true;
  turnstileToken = token;
}

document.getElementById("verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const code = document.getElementById("codeInput").value.trim();

  if (!turnstileValid) {
    alert("请先完成验证码验证");
    return;
  }

  if (!code) {
    alert("请输入档案防伪码");
    return;
  }

  const button = e.target.querySelector("button");
  button.disabled = true;
  button.textContent = "验证中...";

  try {
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, token: turnstileToken }),
    });

    const data = await res.json();
    alert(data.reason || "验证完成");
  } catch (err) {
    console.error("❌ 验证失败：", err);
    alert("网络错误，请稍后再试");
  } finally {
    button.disabled = false;
    button.textContent = "验证";
  }
});
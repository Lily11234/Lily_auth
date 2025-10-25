document.getElementById("verify-btn").addEventListener("click", async () => {
  const key = document.getElementById("verify-input").value.trim();
  const resultBox = document.getElementById("verify-result");

  if (!key) {
    resultBox.innerHTML = "⚠️ 请输入编号。";
    return;
  }

  resultBox.innerHTML = "⏳ 正在验证，请稍候...";

  try {
    const apiBase = "https://lily_auth.lemon101ash.workers.dev";
    const res = await fetch(`${apiBase}/api/verify?key=${encodeURIComponent(key)}`);  
    const data = await res.json();

    if (data.success) {
    resultBox.innerHTML = `
      <p>${data.message}</p>
      <p>📄 描述：${data.desc || "无说明"}</p>
      <p>📦 批次：${data.batch || "无记录"}</p>
      ${
        data.image
          ? `<img src="${data.image}" alt="签章样本" style="max-width:180px;margin:10px;border-radius:6px;" />`
          : ""
      }
      ${
        data.qrcode
          ? `<img src="${data.qrcode}" alt="二维码" style="max-width:120px;margin-top:10px;border:1px dashed #aaa;padding:4px;border-radius:6px;" />`
          : ""
      }
      <p style="font-size:13px;color:gray;">🕓 更新时间：${data.created_at || "未知"}</p>
    `;
  } else {
      resultBox.innerHTML = `❌ ${data.message}`;
    }
  } catch (err) {
    resultBox.innerHTML = `💥 网络错误：${err.message}`;
  }
});
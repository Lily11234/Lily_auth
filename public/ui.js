document.getElementById("verify-btn").addEventListener("click", async () => {
  const key = document.getElementById("verify-input").value.trim();
  const resultBox = document.getElementById("verify-result");

  if (!key) {
    resultBox.innerHTML = "⚠️ 请输入哈希码。";
    return;
  }

  // 使用绑定服务，Pages 会自动转发到 lily_auth Worker
  const apiBase = "/api";

  try {
    resultBox.innerHTML = "⌛ 正在验证，请稍候...";
    const res = await fetch(`${apiBase}/verify?key=${encodeURIComponent(key)}`);
    const data = await res.json();

    if (data.success) {
      resultBox.innerHTML = `
        ✅ ${data.message}<br>
        <p>描述：${data.desc || "—"}</p>
        <p>批次号：${data.batch || "—"}</p>
        ${
          data.image
            ? `<img src="${data.image}" alt="签章样本" style="max-width:200px;margin-top:10px;border-radius:6px;" />`
            : ""
        }
        ${
          data.qrcode
            ? `<img src="${data.qrcode}" alt="二维码" style="max-width:120px;margin-top:10px;border:1px dashed #444;padding:4px;" />`
            : ""
        }
        <p style="font-size:13px;color:#888;">更新时间：${data.created_at || "未知"}</p>
      `;
    } else {
      resultBox.innerHTML = `❌ ${data.message}`;
    }
  } catch (err) {
    resultBox.innerHTML = `⚠️ 网络错误：${err.message}`;
  }
});
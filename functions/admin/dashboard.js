export async function onRequestGet({ request, env }) {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie.split("auth=")[1];
  if (token !== env.ADMIN_TOKEN) {
    return new Response(`<script>location.href='/admin/login'</script>`, {
      headers: { "Content-Type": "text/html;charset=utf-8" },
    });
  }

  const list = await env.AUTH_DB.list();
  const entries = [];
  for (const item of list.keys) {
    const record = await env.AUTH_DB.get(item.name);
    if (!record) continue;
    const data = JSON.parse(record);
    entries.push({ code: item.name, ...data });
  }

  // 批次统计
  const batchStats = {};
  for (const e of entries) {
    batchStats[e.batch] = (batchStats[e.batch] || 0) + 1;
  }

  const html = `
  <!DOCTYPE html><html lang="zh-CN"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Lily-auth 后台控制台</title>
  <style>
    :root {
      --bg: #f8f9fa;
      --text: #202124;
      --table-border: #ddd;
      --link: #0069c2;
    }
    [data-theme="dark"] {
      --bg: #181a1b;
      --text: #e8eaed;
      --table-border: #333;
      --link: #8ab4f8;
    }
    body {
      font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;
      background: var(--bg); color: var(--text);
      margin:0;padding:30px;
      transition: background 0.3s,color 0.3s;
    }
    h1{text-align:center;margin-bottom:10px;}
    .top{text-align:center;margin-bottom:20px;}
    input{
      padding:6px 10px;
      border:1px solid var(--table-border);
      border-radius:6px;
      font-size:14px;
      width:220px;
      background:transparent;
      color:var(--text);
    }
    table{
      width:100%;max-width:880px;margin:auto;border-collapse:collapse;
    }
    th,td{
      border:1px solid var(--table-border);
      padding:8px 10px;
      font-size:14px;
    }
    th{background:rgba(0,0,0,0.05);cursor:pointer;}
    tr:hover{background:rgba(0,0,0,0.04);}
    a{color:var(--link);text-decoration:none;}
    a:hover{text-decoration:underline;}
    footer{text-align:center;margin-top:25px;font-size:13px;opacity:0.7;}
    .stat{margin:0 auto 20px auto;max-width:400px;}
    .theme-toggle{position:absolute;top:15px;right:20px;cursor:pointer;font-size:13px;opacity:0.8;}
  </style>
  </head>
  <body>
    <div class="theme-toggle" onclick="toggleTheme()">🌗 切换主题</div>
    <h1>Lily-auth 后台控制台</h1>
    <div class="top">
      <p>总计 <b>${entries.length}</b> 条记录 · <a href="/admin/api/export">导出 JSON</a></p>
      <input type="text" id="search" placeholder="搜索 文件名 / 批次 / 校验码">
    </div>

    <div class="stat">
      <h3>📊 批次统计</h3>
      <ul style="list-style:none;padding-left:0;">
        ${Object.entries(batchStats)
          .map(([batch, count]) => `<li>${batch}：${count} 条</li>`)
          .join("")}
      </ul>
    </div>

    <table id="data-table">
      <thead>
        <tr>
          <th onclick="sortTable(0)">#</th>
          <th onclick="sortTable(1)">校验码</th>
          <th onclick="sortTable(2)">文件名</th>
          <th onclick="sortTable(3)">批次</th>
        </tr>
      </thead>
      <tbody>
        ${entries
          .map(
            (e, i) =>
              `<tr><td>${i + 1}</td><td>${e.code}</td><td>${e.filename}</td><td>${e.batch}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
    <footer>由 Cloudflare Pages 提供支持 · Lily-auth 管理界面</footer>

    <script>
      // 主题切换
      function toggleTheme(){
        const html=document.documentElement;
        const current=html.getAttribute("data-theme")==="dark"?"light":"dark";
        html.setAttribute("data-theme",current);
        localStorage.setItem("theme",current);
      }
      if(localStorage.getItem("theme")==="dark"){
        document.documentElement.setAttribute("data-theme","dark");
      }

      // 搜索功能
      const search=document.getElementById("search");
      search.addEventListener("keyup",()=>{
        const val=search.value.toLowerCase();
        const rows=document.querySelectorAll("#data-table tbody tr");
        rows.forEach(r=>{
          r.style.display=r.innerText.toLowerCase().includes(val)?"":"none";
        });
      });

      // 表格排序
      function sortTable(col){
        const table=document.getElementById("data-table");
        const rows=Array.from(table.rows).slice(1);
        const asc=table.dataset.sortAsc==="true"?false:true;
        rows.sort((a,b)=>{
          const A=a.cells[col].innerText.toLowerCase();
          const B=b.cells[col].innerText.toLowerCase();
          return asc?A.localeCompare(B):B.localeCompare(A);
        });
        rows.forEach(r=>table.tBodies[0].appendChild(r));
        table.dataset.sortAsc=asc;
      }

      // 快捷键
      document.addEventListener("keydown",(e)=>{
        if(e.metaKey && e.key==="f"){e.preventDefault();search.focus();}
        if(e.metaKey && e.key==="e"){e.preventDefault();location.href="/admin/api/export";}
      });
    </script>
  </body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
}
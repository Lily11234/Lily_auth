export async function onRequestGet({ request, env }) {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie.split("auth=")[1];
  if (token !== env.ADMIN_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  const list = await env.AUTH_DB.list();
  const data = [];
  for (const item of list.keys) {
    const record = await env.AUTH_DB.get(item.name);
    if (!record) continue;
    data.push({ code: item.name, ...JSON.parse(record) });
  }

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Content-Disposition": `attachment; filename="lily-auth-export.json"`,
    },
  });
}
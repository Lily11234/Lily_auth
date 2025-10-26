export async function onRequestGet({ request, env }) {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie.split("auth=")[1];

  if (token === env.ADMIN_TOKEN) {
    return Response.redirect("https://lily-auth.pages.dev/admin/dashboard", 302);
  }

  return Response.redirect("https://lily-auth.pages.dev/admin/login", 302);
}
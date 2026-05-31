export async function onRequestPost({ request, env }) {
  const { username, password } = await request.json();

  const user = await env.DB
    .prepare("SELECT * FROM users WHERE username = ? AND password = ?")
    .bind(username, password)
    .first();

  if (!user) {
    return Response.json({ ok: false }, { status: 401 });
  }

  // tạo session đơn giản
  return Response.json({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "GET") {
    const { results } = await env.DB
      .prepare("SELECT * FROM posts ORDER BY id DESC")
      .all();

    return Response.json(results);
  }

  return new Response("OK");
}

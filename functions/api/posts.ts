export default {
  async fetch(request, env) {
    const result = await env.DB.prepare(
      "SELECT * FROM [Order] ORDER LIMIT 100",
    ).run();
    return new Response(JSON.stringify(result));
  }
}

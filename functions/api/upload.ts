export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const file = form.get("file");

  if (!file) {
    return new Response("No file", { status: 400 });
  }

  const filename = Date.now() + "-" + file.name;

  await env.IMAGES.put(filename, file.stream(), {
    httpMetadata: {
      contentType: file.type
    }
  });

  const url = `https://pub-xxxxx.r2.dev/${filename}`;

  return Response.json({ url });
}

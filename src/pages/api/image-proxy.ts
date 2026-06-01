import type { APIRoute } from 'astro';
import { env } from "cloudflare:workers";

export const GET: APIRoute = async ({ request }) => {
  const { R2_BUCKET } = env;

  if (!R2_BUCKET) {
    return new Response("Lỗi: Không kết nối được kho lưu trữ R2", { status: 500 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';
  
  const object = await R2_BUCKET.get(key);
  if (!object) return new Response('Không tìm thấy hình ảnh trong kho R2', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cache-Control', 'public, max-age=31536000'); 
  
  return new Response(object.body, { headers });
};
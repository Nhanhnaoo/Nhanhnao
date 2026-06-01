import type { APIRoute } from 'astro';
import { strToU8, zipSync } from 'fflate';
import { env } from "cloudflare:workers";

export const GET: APIRoute = async () => {
  const { DB, R2_BUCKET, AI } = env;

  if (!DB || !R2_BUCKET || !AI) {
    return new Response(JSON.stringify({ error: "Thiếu kết nối dịch vụ Cloudflare" }), { status: 500 });
  }

  try {
    const RSS_URL = "https://vnexpress.net/rss/khoa-hoc.rss";
    const response = await fetch(RSS_URL);
    const xmlText = await response.text();
    
    const titleMatch = xmlText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const descMatch = xmlText.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);

    if (!titleMatch) {
      return new Response(JSON.stringify({ error: "Không tìm thấy bài viết mới" }), { status: 400 });
    }

    const originalTitle = titleMatch[1];
    const originalContent = descMatch ? descMatch[1].replace(/<[^>]*>/g, '') : "Nội dung thông tin bài báo gốc...";
    const rawImgUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa"; 

    const existPost = await DB.prepare("SELECT id FROM articles WHERE title = ?").bind(originalTitle).first();
    if (existPost) {
      return new Response(JSON.stringify({ status: "Bỏ qua: Bài viết này đã được cào trước đó" }));
    }

    const aiResponse = await AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: 'Bạn là một biên tập viên báo chí Việt Nam chuyên nghiệp. Hãy viết lại tiêu đề và nội dung bài viết bằng tiếng Việt chuẩn, đổi cấu trúc câu chữ sinh động tránh trùng lặp SEO. Trả về định dạng JSON gồm: title và content.' },
        { role: 'user', content: `Tiêu đề gốc: ${originalTitle}. Nội dung gốc: ${originalContent}` }
      ],
      response_format: { type: "json_object" }
    });
    
    const rewritten = JSON.parse(aiResponse.response);

    const cleanSlug = rewritten.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^a-z0-9\s])/g, '')
      .replace(/(\s+)/g, '-') + '-' + Date.now().toString().slice(-4);

    const imgRes = await fetch(rawImgUrl);
    const imgBlob = await imgRes.blob();
    const imgKey = `media/baomoi_${cleanSlug}.jpg`;
    await R2_BUCKET.put(imgKey, imgBlob, { httpMetadata: { contentType: 'image/jpeg' } });
    const finalImgUrl = `/api/image-proxy?key=${imgKey}`; 

    const textBuffer = strToU8(rewritten.content);
    const zippedData = zipSync({ "article.txt": textBuffer }, { level: 9 });
    const compressedBase64 = btoa(String.fromCharCode.apply(null, [...new Uint8Array(zippedData)]));

    await DB.prepare(`
      INSERT INTO articles (category_id, title, slug, sapo, content, image_url) 
      VALUES (1, ?, ?, ?, ?, ?)
    `).bind(
      rewritten.title, 
      cleanSlug, 
      rewritten.content.slice(0, 140) + '...', 
      compressedBase64, 
      finalImgUrl
    ).run();

    return new Response(JSON.stringify({ status: "Thành công", slug: cleanSlug }));
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
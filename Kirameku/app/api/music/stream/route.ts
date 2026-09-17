import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** 只允许中转网易云音乐的音频，避免这个接口变成公开代理被人白嫖 */
const ALLOWED_HOST = /(^|\.)music\.126\.net$/i;

/**
 * 音频中转。
 *
 * 浏览器直连网易云 CDN 会踩到「URL过滤」反爬页（表现就是点了播放没反应），
 * 所以统一由服务器去取，再回传给浏览器。这样做同时解决了：
 *   - 网易云对不同客户端 IP 的间歇性拦截
 *   - Referer / 防盗链问题
 *   - 混合内容与跨域问题
 *
 * 完整转发 Range 请求，保证拖动进度条能正常 seek。
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");

  if (!target) {
    return new Response("missing url", { status: 400 });
  }

  let host = "";
  try {
    host = new URL(target).hostname;
  } catch {
    return new Response("invalid url", { status: 400 });
  }

  if (!ALLOWED_HOST.test(host)) {
    return new Response("forbidden host", { status: 403 });
  }

  const range = req.headers.get("range");

  try {
    const upstream = await fetch(target, {
      headers: {
        "User-Agent": UA,
        Referer: "https://music.163.com/",
        ...(range ? { Range: range } : {}),
      },
      cache: "no-store",
    });

    const contentType = (upstream.headers.get("content-type") || "").toLowerCase();

    // 上游返回错误页（例如「URL过滤」），直接告诉前端失败，让它换源/跳歌
    if (
      !upstream.ok ||
      contentType.includes("text/html") ||
      contentType.includes("application/json") ||
      contentType.includes("text/plain")
    ) {
      return new Response("upstream unavailable", { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", "audio/mpeg");
    headers.set("Cache-Control", "public, max-age=3600");

    // 网易云 CDN 通常不理会 Range 请求（直接返回 200 + 完整文件），
    // 只有上游真的支持分段时才对外声明 Accept-Ranges，避免浏览器误以为可跳转。
    const isPartial = upstream.status === 206;
    if (isPartial) {
      headers.set("Accept-Ranges", "bytes");
      const contentRange = upstream.headers.get("content-range");
      if (contentRange) headers.set("Content-Range", contentRange);
    }

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(upstream.body, {
      status: isPartial ? 206 : 200,
      headers,
    });
  } catch {
    return new Response("upstream error", { status: 502 });
  }
}

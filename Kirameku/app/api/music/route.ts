import { NextRequest, NextResponse } from "next/server";
import Meting from "@meting/core";

export const dynamic = "force-dynamic";

interface SongData {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  lrcUrl: string;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const AUDIO_TIMEOUT_MS = 8000;

/**
 * 校验音源地址是不是真的能播。
 *
 * 网易云对 VIP / 版权受限的歌曲会返回一个 HTTP 200 的「URL过滤」HTML 错误页，
 * 播放器拿到它只会静默失败（点了播放没反应）。所以这里只取开头一小段数据，
 * 按文件头判断是不是音频，不是的话就把这首歌从歌单里剔除。
 */
async function isPlayableAudio(url: string): Promise<boolean> {
  if (!url) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AUDIO_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Range: "bytes=0-2047" },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) return false;

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    // 明确的非音频类型直接判死
    if (
      contentType.includes("text/html") ||
      contentType.includes("application/json") ||
      contentType.includes("text/plain")
    ) {
      return false;
    }

    const reader = res.body?.getReader();
    if (!reader) return contentType.includes("audio");

    const { value } = await reader.read();
    reader.cancel().catch(() => {});

    if (!value || value.length < 3) return false;

    // "ID3" 标签 或 MPEG 帧同步
    const isId3 = value[0] === 0x49 && value[1] === 0x44 && value[2] === 0x33;
    const isFrameSync = value[0] === 0xff && (value[1] & 0xe0) === 0xe0;

    return isId3 || isFrameSync;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get("id");
  const songIds = searchParams.get("ids");

  if (!playlistId && !songIds) {
    return NextResponse.json(
      { error: "需要提供 id (歌单ID) 或 ids (歌曲ID,逗号分隔)" },
      { status: 400 }
    );
  }

  const meting = new Meting("netease");
  meting.format(true);

  try {
    let tracks: { id: string; name: string; artist: string[]; pic_id: string; url_id: string; lyric_id: string }[] = [];

    if (playlistId) {
      const raw = await meting.playlist(playlistId);
      const parsed = JSON.parse(raw as string);
      tracks = Array.isArray(parsed) ? parsed : [];
    } else if (songIds) {
      const ids = songIds.split(",").map((s) => s.trim()).filter(Boolean);
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const raw = await meting.song(id);
            const parsed = JSON.parse(raw as string);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [];
          }
        })
      );
      tracks = results.flat();
    }

    // 批量获取 URL（取不到有效音源的歌曲标记出来）
    const results = await Promise.all(
      tracks.map(async (track): Promise<{ song: SongData; playable: boolean } | null> => {
        let src = "";
        try {
          const urlRaw = await meting.url(track.url_id, 320);
          const urlData = JSON.parse(urlRaw as string);
          src = (urlData.url || "").replace(/^http:\/\//, "https://");
        } catch {
          // ignore
        }

        if (!src) return null;

        const playable = await isPlayableAudio(src);

        let cover = "";
        try {
          const picRaw = await meting.pic(track.pic_id, 300);
          const picData = JSON.parse(picRaw as string);
          cover = (picData.url || "").replace(/^http:\/\//, "https://");
        } catch {
          // ignore
        }

        return {
          playable,
          song: {
            id: String(track.id),
            title: track.name || "未知歌曲",
            artist: Array.isArray(track.artist) ? track.artist.join(", ") : String(track.artist || "未知歌手"),
            cover,
            src,
            lrcUrl: track.lyric_id
              ? `https://api.injahow.cn/meting/?server=netease&type=lrc&id=${track.lyric_id}`
              : "",
          },
        };
      })
    );

    const all = results.filter((r): r is { song: SongData; playable: boolean } => r !== null);
    const playableSongs = all.filter((r) => r.playable).map((r) => r.song);
    // 兜底：万一校验环节整体失败（例如服务器到 CDN 网络异常），
    // 宁可保留原始列表交给前端容错跳过，也不要返回空歌单。
    const songs = playableSongs.length > 0 ? playableSongs : all.map((r) => r.song);

    return NextResponse.json(songs, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Meting error:", err);
    return NextResponse.json(
      { error: "获取音乐数据失败" },
      { status: 500 }
    );
  }
}

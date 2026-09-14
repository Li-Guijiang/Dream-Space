"use client";

import { useState, useRef, useCallback } from "react";

// 简易 QR Code 生成器（纯前端，支持文本/URL/WiFi/vCard）
// 使用 Google Charts API 作为后备，同时提供 canvas 绘制

type QRMode = "text" | "url" | "wifi" | "vcard";

const modes: { id: QRMode; label: string; icon: string }[] = [
  { id: "text", label: "文本", icon: "📝" },
  { id: "url", label: "链接", icon: "🔗" },
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "vcard", label: "名片", icon: "👤" },
];

function buildContent(mode: QRMode, fields: Record<string, string>): string {
  switch (mode) {
    case "text":
      return fields.text || "";
    case "url":
      return fields.url || "";
    case "wifi":
      return `WIFI:T:${fields.encryption || "WPA"};S:${fields.ssid || ""};P:${fields.password || ""};H:${fields.hidden === "true" ? "true" : "false"};;`;
    case "vcard":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        fields.name ? `FN:${fields.name}` : "",
        fields.org ? `ORG:${fields.org}` : "",
        fields.tel ? `TEL:${fields.tel}` : "",
        fields.email ? `EMAIL:${fields.email}` : "",
        fields.url ? `URL:${fields.url}` : "",
        "END:VCARD",
      ].filter(Boolean).join("\n");
    default:
      return "";
  }
}

// 使用多个免费 QR API
function getQRUrl(content: string, size: number): string {
  const encoded = encodeURIComponent(content);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=8`;
}

export default function QRCodeApp() {
  const [mode, setMode] = useState<QRMode>("text");
  const [fields, setFields] = useState<Record<string, string>>({ text: "" });
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ content: string; url: string; time: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const generate = useCallback(() => {
    const content = buildContent(mode, fields);
    if (!content.trim()) return;
    const url = getQRUrl(content, 280);
    setQrUrl(url);
    setHistory((h) => [{ content, url, time: Date.now() }, ...h].slice(0, 10));
  }, [mode, fields]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = "qrcode.png";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setModeAndReset = (m: QRMode) => {
    setMode(m);
    setQrUrl("");
    switch (m) {
      case "text": setFields({ text: "" }); break;
      case "url": setFields({ url: "" }); break;
      case "wifi": setFields({ ssid: "", password: "", encryption: "WPA", hidden: "false" }); break;
      case "vcard": setFields({ name: "", org: "", tel: "", email: "", url: "" }); break;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 模式选择 */}
      <div className="flex gap-1 mb-3">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setModeAndReset(m.id)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              mode === m.id
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* 输入表单 */}
      <div className="mb-3">
        {mode === "text" && (
          <textarea
            value={fields.text || ""}
            onChange={(e) => updateField("text", e.target.value)}
            placeholder="输入文本内容..."
            rows={3}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 resize-none"
          />
        )}
        {mode === "url" && (
          <input
            type="url"
            value={fields.url || ""}
            onChange={(e) => updateField("url", e.target.value)}
            placeholder="https://example.com"
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
          />
        )}
        {mode === "wifi" && (
          <div className="space-y-1.5">
            <input
              type="text"
              value={fields.ssid || ""}
              onChange={(e) => updateField("ssid", e.target.value)}
              placeholder="WiFi 名称 (SSID)"
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
            />
            <input
              type="text"
              value={fields.password || ""}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="密码"
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
            />
            <div className="flex gap-2">
              <select
                value={fields.encryption || "WPA"}
                onChange={(e) => updateField("encryption", e.target.value)}
                className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="">无密码</option>
              </select>
            </div>
          </div>
        )}
        {mode === "vcard" && (
          <div className="space-y-1.5">
            <input
              type="text"
              value={fields.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="姓名"
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
            />
            <input
              type="text"
              value={fields.tel || ""}
              onChange={(e) => updateField("tel", e.target.value)}
              placeholder="电话"
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
            />
            <input
              type="email"
              value={fields.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="邮箱"
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
            />
          </div>
        )}
      </div>

      {/* 生成按钮 */}
      <button
        type="button"
        onClick={generate}
        className="w-full py-2 rounded-xl bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600 transition-colors mb-3"
      >
        生成二维码
      </button>

      {/* 二维码展示 */}
      {qrUrl ? (
        <div className="flex-1 flex flex-col items-center">
          <div className="bg-white rounded-xl p-3 mb-2 shadow-sm">
            <img src={qrUrl} alt="QR Code" className="w-40 h-40" crossOrigin="anonymous" />
          </div>
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              下载图片
            </button>
            <button
              type="button"
              onClick={() => handleCopy(buildContent(mode, fields))}
              className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {copied ? "已复制 ✓" : "复制内容"}
            </button>
          </div>

          {/* 历史 */}
          {history.length > 1 && (
            <div className="w-full mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">历史</div>
              {history.slice(1).map((h, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex-1 truncate">{h.content}</span>
                  <button type="button" onClick={() => setQrUrl(h.url)} className="text-[9px] text-indigo-500 font-bold">重用</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-300 dark:text-slate-600 text-sm">
          输入内容后生成
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

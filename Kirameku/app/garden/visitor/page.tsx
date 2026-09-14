"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } },
};

interface VisitorInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  org: string;
  timezone: string;
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: string;
  screen: string;
  language: string;
  cookies: boolean;
  online: boolean;
  time: string;
  darkMode: boolean;
}

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

const icons = {
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 4.9 14.5M12 2a8 8 0 0 0-4.9 14.5M2 12h20M12 2c2.5 2.8 3.9 6.3 3.9 10s-1.4 7.2-3.9 10c-2.5-2.8-3.9-6.3-3.9-10S9.5 4.8 12 2Z",
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z",
  wifi: "M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM12 6v6l4 2",
  monitor: "M2 3h20v14H2V3Zm3 17h14M8 21h8M12 17v4",
  cpu: "M4 4h16v16H4V4Zm2 2v12h12V6H6Zm4 4h4v4h-4v-4ZM9 2v2m6-2v2M9 20v2m6-2v2M2 9h2m-2 6h2m16-6h2m-2 6h2",
  phone: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm5 18h.01",
  lang: "M5 8l6 10M2 8h10M4 18h10M13 4l7 16m0-16-4 9m4-9 4 0",
  cookie: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-3 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-3 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
  online: "M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0Zm6 0l3 3 5-6",
  theme: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z",
};

export default function VisitorPage() {
  const [info, setInfo] = useState<VisitorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    let bv = "";
    if (ua.includes("Firefox/")) { browser = "Firefox"; bv = ua.split("Firefox/")[1]?.split(" ")[0] ?? ""; }
    else if (ua.includes("Edg/")) { browser = "Edge"; bv = ua.split("Edg/")[1]?.split(" ")[0] ?? ""; }
    else if (ua.includes("Chrome/")) { browser = "Chrome"; bv = ua.split("Chrome/")[1]?.split(" ")[0] ?? ""; }
    else if (ua.includes("Safari/")) { browser = "Safari"; bv = ua.split("Version/")[1]?.split(" ")[0] ?? ""; }

    let os = "Unknown";
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    const localInfo: Partial<VisitorInfo> = {
      browser, browserVersion: bv, os,
      deviceType: /Mobi|Android|iPhone/i.test(ua) ? "手机" : "电脑",
      screen: `${screen.width} × ${screen.height}`,
      language: navigator.language,
      cookies: navigator.cookieEnabled,
      online: navigator.onLine,
      time: new Date().toLocaleString("zh-CN"),
      darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
    };

    fetch("https://api.db-ip.com/v2/free/self")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setInfo({
          ...localInfo,
          ip: data.ipAddress,
          city: data.city,
          region: data.stateProv,
          country: data.countryName,
          org: data.isp ?? "未知",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        } as VisitorInfo);
        setLoading(false);
      })
      .catch(() => { setInfo(localInfo as VisitorInfo); setLoading(false); });
  }, []);

  const cards = info ? [
    { icon: icons.globe, label: "IP 地址", value: info.ip ?? "未知" },
    { icon: icons.pin, label: "位置", value: [info.city, info.region, info.country].filter(Boolean).join(", ") || "未知" },
    { icon: icons.wifi, label: "运营商", value: info.org ?? "未知" },
    { icon: icons.clock, label: "时区", value: info.timezone ?? "未知" },
    { icon: icons.monitor, label: "浏览器", value: `${info.browser} ${info.browserVersion}` },
    { icon: icons.cpu, label: "系统", value: info.os },
    { icon: icons.phone, label: "设备", value: info.deviceType },
    { icon: icons.monitor, label: "屏幕", value: info.screen },
    { icon: icons.lang, label: "语言", value: info.language },
    { icon: icons.cookie, label: "Cookie", value: info.cookies ? "已启用" : "已禁用" },
    { icon: icons.online, label: "状态", value: info.online ? "在线" : "离线" },
    { icon: icons.theme, label: "主题", value: info.darkMode ? "深色模式" : "浅色模式" },
  ] : [];

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show" className="p-4 md:p-6 lg:p-8 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">访客信息</h1>
        <p className="text-xs text-slate-400">看看你自己的网络和设备信息</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring" as const, stiffness: 300, damping: 20 }}
              className="group bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-slate-200/50 dark:border-white/5 shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-default"
            >
              <div className="flex items-center gap-4">
                <Icon d={c.icon} className="w-5 h-5 text-sky-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {c.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && info && (
        <p className="text-center text-[10px] text-slate-400">查询时间：{info.time}</p>
      )}
    </motion.div>
  );
}

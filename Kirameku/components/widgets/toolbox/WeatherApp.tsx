"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = "https://uapis.cn/api/v1/misc/weather";

interface WeatherData {
  province: string;
  city: string;
  district?: string;
  weather: string;
  weather_icon: string;
  temperature: number;
  wind_direction: string;
  wind_power: string;
  humidity: number;
  report_time: string;
  feels_like?: number;
  visibility?: number;
  pressure?: number;
  uv?: number;
  aqi?: number;
  aqi_level?: number;
  aqi_category?: string;
  aqi_primary?: string;
  air_pollutants?: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  temp_max?: number;
  temp_min?: number;
  forecast?: {
    date: string;
    week: string;
    temp_max: number;
    temp_min: number;
    weather_day: string;
    weather_night: string;
    sunrise?: string;
    sunset?: string;
    humidity?: number;
    uv_index?: number;
  }[];
  hourly_forecast?: {
    time: string;
    temperature: number;
    weather: string;
    humidity?: number;
    pop?: number;
  }[];
  life_indices?: Record<string, { level: string; brief: string; advice: string }>;
}

// Modern SVG Weather Icons
function WeatherIcon({ code, size = 40 }: { code: string; size?: number }) {
  const s = size;
  // Sunny / Clear
  if (code === "100") return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="9" fill="#FBBF24" />
      <g stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round">
        <line x1="24" y1="5" x2="24" y2="10" /><line x1="24" y1="38" x2="24" y2="43" />
        <line x1="5" y1="24" x2="10" y2="24" /><line x1="38" y1="24" x2="43" y2="24" />
        <line x1="10.6" y1="10.6" x2="14.1" y2="14.1" /><line x1="33.9" y1="33.9" x2="37.4" y2="37.4" />
        <line x1="10.6" y1="37.4" x2="14.1" y2="33.9" /><line x1="33.9" y1="14.1" x2="37.4" y2="10.6" />
      </g>
    </svg>
  );
  // Partly cloudy
  if (["101", "102", "103"].includes(code)) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="18" cy="16" r="7" fill="#FBBF24" />
      <g stroke="#FBBF24" strokeWidth="2" strokeLinecap="round">
        <line x1="18" y1="4" x2="18" y2="7" /><line x1="18" y1="25" x2="18" y2="28" />
        <line x1="6" y1="16" x2="9" y2="16" /><line x1="27" y1="16" x2="30" y2="16" />
      </g>
      <path d="M16 34a8 8 0 01-2-15.8A10 10 0 0133.5 22 7 7 0 0136 34H16z" fill="#E2E8F0" />
    </svg>
  );
  // Cloudy
  if (code === "104") return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path d="M12 34a8 8 0 01-2-15.8A10 10 0 0129.5 22 7 7 0 0132 34H12z" fill="#94A3B8" />
      <path d="M22 28a6 6 0 01-1.5-11.8A8 8 0 0135 19a5.5 5.5 0 012 10.5" fill="#CBD5E1" opacity="0.7" />
    </svg>
  );
  // Night clear
  if (code === "150") return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path d="M30 12a14 14 0 100 24 10 10 0 010-24z" fill="#A78BFA" />
      <circle cx="34" cy="14" r="1" fill="#C4B5FD" /><circle cx="38" cy="20" r="0.8" fill="#C4B5FD" /><circle cx="30" cy="8" r="0.6" fill="#C4B5FD" />
    </svg>
  );
  // Night cloudy
  if (["151", "153"].includes(code)) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path d="M28 10a10 10 0 100 18 7 7 0 010-18z" fill="#818CF8" opacity="0.6" />
      <path d="M14 36a7 7 0 01-1.5-13.8A9 9 0 0130 25a6 6 0 011.5 11" fill="#94A3B8" />
    </svg>
  );
  // Light rain
  if (["300", "301", "305", "306", "309", "399"].includes(code)) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path d="M12 26a8 8 0 01-2-15.8A10 10 0 0129.5 14 7 7 0 0132 26H12z" fill="#94A3B8" />
      <g stroke="#60A5FA" strokeWidth="2" strokeLinecap="round">
        <line x1="16" y1="30" x2="14" y2="36" /><line x1="24" y1="30" x2="22" y2="36" /><line x1="32" y1="30" x2="30" y2="36" />
      </g>
    </svg>
  );
  // Heavy rain
  if (["307", "308", "310", "311", "312", "313"].includes(code)) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path d="M12 24a8 8 0 01-2-15.8A10 10 0 0129.5 12 7 7 0 0132 24H12z" fill="#64748B" />
      <g stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round">
        <line x1="14" y1="28" x2="11" y2="36" /><line x1="22" y1="28" x2="19" y2="36" /><line x1="30" y1="28" x2="27" y2="36" />
        <line x1="18" y1="32" x2="16" y2="38" /><line x1="26" y1="32" x2="24" y2="38" />
      </g>
    </svg>
  );
  // Thunderstorm
  if (["302", "303", "304"].includes(code)) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path d="M12 22a8 8 0 01-2-15.8A10 10 0 0129.5 10 7 7 0 0132 22H12z" fill="#475569" />
      <path d="M22 24l-4 8h6l-3 8 8-10h-5l4-6h-6z" fill="#FBBF24" />
    </svg>
  );
  // Snow
  if (code.startsWith("4")) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path d="M12 24a8 8 0 01-2-15.8A10 10 0 0129.5 12 7 7 0 0132 24H12z" fill="#94A3B8" />
      <g fill="#DBEAFE">
        <circle cx="15" cy="32" r="2" /><circle cx="24" cy="30" r="2" /><circle cx="33" cy="32" r="2" />
        <circle cx="19" cy="36" r="1.5" /><circle cx="29" cy="37" r="1.5" />
      </g>
    </svg>
  );
  // Fog / Haze
  if (code.startsWith("5")) return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <g stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round">
        <line x1="8" y1="16" x2="40" y2="16" /><line x1="12" y1="22" x2="36" y2="22" />
        <line x1="8" y1="28" x2="40" y2="28" /><line x1="14" y1="34" x2="34" y2="34" />
      </g>
    </svg>
  );
  // Hot
  if (code === "900") return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="20" r="10" fill="#EF4444" opacity="0.8" />
      <g stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
        <line x1="24" y1="2" x2="24" y2="6" /><line x1="38" y1="10" x2="35" y2="13" />
        <line x1="42" y1="20" x2="38" y2="20" /><line x1="10" y1="20" x2="6" y2="20" />
        <line x1="14" y1="10" x2="11" y2="13" />
      </g>
    </svg>
  );
  // Cold
  if (code === "901") return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <g stroke="#60A5FA" strokeWidth="2" strokeLinecap="round">
        <line x1="24" y1="6" x2="24" y2="42" />
        <line x1="14" y1="12" x2="24" y2="18" /><line x1="34" y1="12" x2="24" y2="18" />
        <line x1="14" y1="36" x2="24" y2="30" /><line x1="34" y1="36" x2="24" y2="30" />
        <line x1="10" y1="24" x2="16" y2="24" /><line x1="38" y1="24" x2="32" y2="24" />
      </g>
      <circle cx="24" cy="24" r="3" fill="#93C5FD" />
    </svg>
  );
  // Default
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx="20" cy="18" r="7" fill="#FBBF24" />
      <path d="M16 34a7 7 0 01-1.5-13.8A9 9 0 0133 23a6 6 0 011 11H16z" fill="#CBD5E1" />
    </svg>
  );
}

// Detail icons
const DetailIcon = {
  wind: <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" /></svg>,
  humidity: <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" /></svg>,
  temp: <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" /></svg>,
  visibility: <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  pressure: <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  uv: <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" /></svg>,
};

// Life index icons
const IndexIcon: Record<string, React.ReactNode> = {
  clothing: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 2L2 6.5l3.5 3.5L8 8l2 10h4L16 8l2.5 2L22 6.5 17.5 2l-3 3a2 2 0 01-3 0l-3-3z" /></svg>,
  uv: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" /></svg>,
  umbrella: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 12a11.05 11.05 0 00-22 0zm-5 7a3 3 0 01-6 0v-7" /></svg>,
  exercise: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2" /><path d="M10 22V18l-2-3 4-5 2 3h3l1 4v3" /></svg>,
  cold_risk: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5z" /><circle cx="12" cy="7" r="1.5" fill="currentColor" /></svg>,
  comfort: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" /></svg>,
  travel: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5 7.5 5.6-3.1 3.1-2.5-.8-1.7 1.4 3.5 2.6 2.6 3.5 1.4-1.7-.8-2.5 3.1-3.1 5.6 7.5.5-.3c.4-.2.6-.6.5-1.1z" /></svg>,
  mood: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" /></svg>,
};

function LocationIcon() {
  return <svg className="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}

function SunriseIcon() {
  return <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 18a5 5 0 00-10 0" /><line x1="12" y1="9" x2="12" y2="2" /><line x1="4.22" y1="10.22" x2="5.64" y2="11.64" /><line x1="1" y1="18" x2="3" y2="18" /><line x1="21" y1="18" x2="23" y2="18" /><line x1="18.36" y1="11.64" x2="19.78" y2="10.22" /><polyline points="8 2 12 6 16 2" /></svg>;
}

function SunsetIcon() {
  return <svg className="w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 18a5 5 0 00-10 0" /><line x1="12" y1="2" x2="12" y2="9" /><line x1="4.22" y1="10.22" x2="5.64" y2="11.64" /><line x1="1" y1="18" x2="3" y2="18" /><line x1="21" y1="18" x2="23" y2="18" /><line x1="18.36" y1="11.64" x2="19.78" y2="10.22" /><polyline points="16 14 12 18 8 14" /></svg>;
}

function getAqiColor(level?: number): string {
  if (!level) return "text-slate-400";
  if (level === 1) return "text-green-500";
  if (level === 2) return "text-yellow-500";
  if (level === 3) return "text-orange-500";
  if (level === 4) return "text-red-500";
  if (level === 5) return "text-purple-500";
  return "text-rose-700";
}

function getAqiBg(level?: number): string {
  if (!level) return "bg-slate-100 dark:bg-slate-800";
  if (level === 1) return "bg-green-50 dark:bg-green-900/20";
  if (level === 2) return "bg-yellow-50 dark:bg-yellow-900/20";
  if (level === 3) return "bg-orange-50 dark:bg-orange-900/20";
  if (level === 4) return "bg-red-50 dark:bg-red-900/20";
  if (level === 5) return "bg-purple-50 dark:bg-purple-900/20";
  return "bg-rose-50 dark:bg-rose-900/20";
}

function formatHour(time: string): string {
  try {
    const d = new Date(time);
    return `${d.getHours().toString().padStart(2, "0")}:00`;
  } catch {
    return time;
  }
}

function getWeekday(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return days[d.getDay()];
  } catch {
    return "";
  }
}

const indexKeys = ["clothing", "uv", "umbrella", "exercise", "cold_risk", "comfort", "travel", "mood"];

const STORAGE_KEY = "weather-city";

export default function WeatherApp() {
  const savedCity = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  const [city, setCity] = useState("");
  const [inputCity, setInputCity] = useState(savedCity || "");
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"now" | "forecast" | "indices">("now");
  const inited = useRef(false);

  const fetchWeather = useCallback(async (query?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        extended: "true",
        forecast: "true",
        hourly: "true",
        indices: "true",
        lang: "zh",
      });

      if (query) {
        params.set("city", query);
      } else {
        // 尝试浏览器定位 → 反解城市名
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator.geolocation) return reject(new Error("不支持定位"));
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000, maximumAge: 600000, enableHighAccuracy: true });
          });
          const { latitude, longitude } = pos.coords;
          // Nominatim 免费反向地理编码，支持中文
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=zh-CN`
          );
          if (geoRes.ok) {
            const geo = await geoRes.json();
            const addr = geo.address || {};
            const cityName = addr.city || addr.town || addr.county || addr.state;
            if (cityName) params.set("city", cityName);
          }
        } catch {
          // 浏览器定位失败，不设 city，走 IP 定位
        }
      }

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `请求失败 (${res.status})`);
      }
      const json = await res.json();
      setData(json);
      setCity(json.city);
      localStorage.setItem(STORAGE_KEY, json.city);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "获取天气失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    fetchWeather(savedCity || undefined);
  }, [fetchWeather, savedCity]);

  const handleSearch = () => {
    const q = inputCity.trim();
    if (q) fetchWeather(q);
  };

  const tabs: { id: typeof tab; label: string }[] = [
    { id: "now", label: "实时" },
    { id: "forecast", label: "预报" },
    { id: "indices", label: "指数" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 搜索栏 */}
      <div className="flex gap-1.5 mb-3">
        <input
          type="text"
          value={inputCity}
          onChange={(e) => setInputCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="输入城市..."
          className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "搜索"}
        </button>
        <button
          type="button"
          onClick={() => fetchWeather()}
          title="自动定位"
          className="px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <LocationIcon />
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-500 text-center py-2">{error}</div>
      )}

      {data && !loading && (
        <>
          {/* Tab 栏 */}
          <div className="flex gap-1 mb-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-colors ${
                  tab === t.id
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 实时天气 */}
          {tab === "now" && (
            <div className="flex-1 overflow-auto">
              <div className="text-center mb-3">
                <div className="text-[10px] text-slate-400 dark:text-slate-500">
                  {data.province} {data.city}{data.district ? ` ${data.district}` : ""}
                </div>
                <div className="flex justify-center my-1"><WeatherIcon code={data.weather_icon} size={48} /></div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {Math.round(data.temperature)}°
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{data.weather}</div>
                {data.temp_max !== undefined && data.temp_min !== undefined && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {Math.round(data.temp_min)}° / {Math.round(data.temp_max)}°
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 mb-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
                  <div className="flex justify-center mb-0.5">{DetailIcon.wind}</div>
                  <div className="text-[9px] text-slate-400 mb-0.5">风向</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{data.wind_direction}</div>
                  <div className="text-[10px] text-slate-400">{data.wind_power}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
                  <div className="flex justify-center mb-0.5">{DetailIcon.humidity}</div>
                  <div className="text-[9px] text-slate-400 mb-0.5">湿度</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{data.humidity}%</div>
                </div>
                {data.feels_like !== undefined && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="flex justify-center mb-0.5">{DetailIcon.temp}</div>
                    <div className="text-[9px] text-slate-400 mb-0.5">体感</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{Math.round(data.feels_like)}°</div>
                  </div>
                )}
                {data.visibility !== undefined && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="flex justify-center mb-0.5">{DetailIcon.visibility}</div>
                    <div className="text-[9px] text-slate-400 mb-0.5">能见度</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{data.visibility}km</div>
                  </div>
                )}
                {data.pressure !== undefined && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="flex justify-center mb-0.5">{DetailIcon.pressure}</div>
                    <div className="text-[9px] text-slate-400 mb-0.5">气压</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{data.pressure}hPa</div>
                  </div>
                )}
                {data.uv !== undefined && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="flex justify-center mb-0.5">{DetailIcon.uv}</div>
                    <div className="text-[9px] text-slate-400 mb-0.5">紫外线</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{data.uv}</div>
                  </div>
                )}
              </div>

              {data.aqi !== undefined && (
                <div className={`${getAqiBg(data.aqi_level)} rounded-lg p-2 mb-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">空气质量</span>
                    <span className={`text-xs font-black ${getAqiColor(data.aqi_level)}`}>
                      {data.aqi_category || "—"} {data.aqi}
                    </span>
                  </div>
                  {data.air_pollutants && (
                    <div className="grid grid-cols-3 gap-1 mt-1.5">
                      {[
                        { label: "PM2.5", value: data.air_pollutants.pm25, unit: "μg/m³" },
                        { label: "PM10", value: data.air_pollutants.pm10, unit: "μg/m³" },
                        { label: "O₃", value: data.air_pollutants.o3, unit: "μg/m³" },
                        { label: "NO₂", value: data.air_pollutants.no2, unit: "μg/m³" },
                        { label: "SO₂", value: data.air_pollutants.so2, unit: "μg/m³" },
                        { label: "CO", value: data.air_pollutants.co, unit: "mg/m³" },
                      ].map((p) => (
                        <div key={p.label} className="text-center">
                          <div className="text-[9px] text-slate-400">{p.label}</div>
                          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{p.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {data.hourly_forecast && data.hourly_forecast.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5">逐小时预报</div>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                    {data.hourly_forecast.slice(0, 12).map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-0.5 shrink-0 w-10">
                        <span className="text-[9px] text-slate-400">{i === 0 ? "现在" : formatHour(h.time)}</span>
                        <WeatherIcon code={String(h.weather)} size={24} />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{Math.round(h.temperature)}°</span>
                        {h.pop !== undefined && h.pop > 0 && (
                          <span className="text-[8px] text-blue-400">{h.pop}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[9px] text-slate-300 dark:text-slate-600 text-right mt-2">
                更新于 {data.report_time}
              </div>
            </div>
          )}

          {/* 多天预报 */}
          {tab === "forecast" && data.forecast && (
            <div className="flex-1 overflow-auto">
              {data.forecast.map((day, i) => {
                const isToday = i === 0;
                const maxT = Math.max(...data.forecast!.map((d) => d.temp_max));
                const minT = Math.min(...data.forecast!.map((d) => d.temp_min));
                const range = maxT - minT || 1;
                return (
                  <div
                    key={day.date}
                    className={`flex items-center gap-2 py-2 ${i < data.forecast!.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
                  >
                    <div className="w-10 shrink-0">
                      <div className={`text-xs font-bold ${isToday ? "text-indigo-500" : "text-slate-700 dark:text-slate-300"}`}>
                        {isToday ? "今天" : getWeekday(day.date)}
                      </div>
                      <div className="text-[9px] text-slate-400">{day.date.slice(5)}</div>
                    </div>
                    <div className="shrink-0"><WeatherIcon code={String(day.weather_day)} size={24} /></div>
                    <div className="flex-1 flex items-center gap-1">
                      <span className="text-[10px] text-blue-400 w-6 text-right">{Math.round(day.temp_min)}°</span>
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                        <div
                          className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
                          style={{
                            left: `${((day.temp_min - minT) / range) * 100}%`,
                            width: `${((day.temp_max - day.temp_min) / range) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-orange-400 w-6">{Math.round(day.temp_max)}°</span>
                    </div>
                    <div className="text-[9px] text-slate-400 shrink-0 w-12 text-right">{day.weather_day}</div>
                  </div>
                );
              })}

              {data.forecast[0]?.sunrise && data.forecast[0]?.sunset && (
                <div className="flex justify-center gap-6 mt-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="text-center">
                    <div className="flex justify-center"><SunriseIcon /></div>
                    <div className="text-[10px] text-slate-400">日出</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{data.forecast[0].sunrise}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center"><SunsetIcon /></div>
                    <div className="text-[10px] text-slate-400">日落</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{data.forecast[0].sunset}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 生活指数 */}
          {tab === "indices" && data.life_indices && (
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-2 gap-1.5">
                {indexKeys.map((key) => {
                  const idx = data.life_indices?.[key];
                  if (!idx) return null;
                  return (
                    <div key={key} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-indigo-500 dark:text-indigo-400">{IndexIcon[key]}</span>
                        <span className="text-[10px] font-bold text-slate-500">{idx.brief}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{idx.level}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">{idx.advice}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-slate-400 animate-pulse">加载中...</div>
        </div>
      )}
    </div>
  );
}

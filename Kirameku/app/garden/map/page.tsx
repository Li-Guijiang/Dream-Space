"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

const locations = [
  { name: "北京", lat: 39.9042, lng: 116.4074, desc: "首都" },
  { name: "上海", lat: 31.2304, lng: 121.4737, desc: "魔都" },
  { name: "杭州", lat: 30.2741, lng: 120.1551, desc: "西湖" },
  { name: "深圳", lat: 22.5431, lng: 114.0579, desc: "科技之城" },
  { name: "成都", lat: 30.5728, lng: 104.0668, desc: "天府之国" },
  { name: "武汉", lat: 30.5928, lng: 114.3055, desc: "江城" },
];

export default function MapPage() {
  const [MapComponent, setMapComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      const { MapContainer, TileLayer, Marker, Popup, useMap } = await import("react-leaflet");

      // Fix default marker icon
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      function FlyTo({ center }: { center: [number, number] }) {
        const map = useMap();
        return (
          <button
            onClick={() => map.flyTo(center, 6, { duration: 1.5 })}
            className="absolute bottom-4 right-4 z-[1000] px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-200/50 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            回到中心
          </button>
        );
      }

      function MapInner() {
        return (
          <MapContainer
            center={[35.8617, 104.1954]}
            zoom={4}
            scrollWheelZoom={true}
            className="w-full h-full rounded-xl z-0"
            style={{ background: "transparent" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc) => (
              <Marker key={loc.name} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{loc.name}</p>
                    <p className="text-slate-500 text-xs">{loc.desc}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            <FlyTo center={[35.8617, 104.1954]} />
          </MapContainer>
        );
      }

      setMapComponent(() => MapInner);
    })();
  }, []);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="p-4 md:p-6 lg:p-8 space-y-4"
    >
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">地图</h1>
        <p className="text-xs text-slate-400">交互式中国地图</p>
      </div>

      <div className="relative bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-white/5 overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>
        {MapComponent ? (
          <MapComponent />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {locations.map((loc) => (
          <span
            key={loc.name}
            className="px-3 py-1.5 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-200/50 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
          >
            <MapPin className="w-3 h-3 text-sky-500" />
            {loc.name}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

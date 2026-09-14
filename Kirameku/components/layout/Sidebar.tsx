"use client";

import { ReactNode } from "react";
import GlassCard from "@/components/ui/GlassCard";

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export default function Sidebar({ children, className = "" }: SidebarProps) {
  return (
    <aside className={`space-y-6 ${className}`}>
      {children}
    </aside>
  );
}

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SidebarSection({
  title,
  children,
  className = "",
}: SidebarSectionProps) {
  return (
    <GlassCard className={className}>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
        {title}
      </h3>
      {children}
    </GlassCard>
  );
}

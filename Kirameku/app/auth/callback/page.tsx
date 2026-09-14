"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("github_token", token);
      const redirectTo = sessionStorage.getItem("github_redirect") || "/messages";
      sessionStorage.removeItem("github_redirect");
      router.replace(redirectTo);
    } else {
      router.replace("/messages");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
    </div>
  );
}

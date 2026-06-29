"use client";

import { useEffect, useState } from "react";

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Sync with current state on mount (throttling in DevTools sets navigator.onLine = false)
    setIsOffline(!navigator.onLine);

    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <div className="rounded-full bg-[#1e3a5f]/10 p-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e3a5f"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#1e3a5f]">No internet connection</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Please check your network connection. The app will resume automatically when you&apos;re back online.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-[#1e3a5f] px-6 py-2 text-sm font-medium text-white hover:bg-[#162d4a] transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

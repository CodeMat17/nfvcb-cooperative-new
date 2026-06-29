"use client";

import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      <Image src="/logo.png" alt="NFVCB Cooperative" width={80} height={80} priority />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">You&apos;re offline</h1>
        <p className="text-gray-500 text-sm max-w-xs">
          No internet connection detected. Please check your network and try again.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="rounded-md bg-[#1e3a5f] px-6 py-2 text-sm font-medium text-white hover:bg-[#162d4a] transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

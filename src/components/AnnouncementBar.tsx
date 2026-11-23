'use client';

import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface AnnouncementBarProps {
  text: string;
  enabled?: boolean;
}

export default function AnnouncementBar({ text, enabled = true }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || dismissed || !text) {
    return null;
  }

  return (
    <aside 
      aria-label="Announcement"
      className="relative z-40 bg-[#C2654A] text-[#FAF6F0] text-xs md:text-sm font-medium tracking-wider py-2 px-4 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center pr-8 sm:pr-0">
        <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-90 hidden sm:inline-block" />
        <span className="line-clamp-1">{text}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#FAF6F0]/80 hover:text-white transition-colors"
        aria-label="Close announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}


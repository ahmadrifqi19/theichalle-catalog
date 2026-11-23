'use client';

import React from 'react';
import { buildWhatsAppConsultationUrl } from '@/lib/format';

interface FloatingWhatsAppProps {
  whatsappNumber?: string;
}

export default function FloatingWhatsApp({ whatsappNumber = '6285882116161' }: FloatingWhatsAppProps) {
  const waUrl = buildWhatsAppConsultationUrl(whatsappNumber);

  return (
    <aside aria-label="WhatsApp Contact" className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-30">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
        aria-label="Chat with The Ichalle Styling Concierge on WhatsApp"
      >
        {/* Subtle Ping Animation */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-25 animate-ping pointer-events-none" />

        {/* Official WhatsApp Icon - Forced Pure White */}
        <svg
          viewBox="0 0 32 32"
          fill="#FFFFFF"
          style={{ fill: '#FFFFFF', color: '#FFFFFF' }}
          className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-12"
          aria-hidden="true"
        >
          <path
            fill="#FFFFFF"
            d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16.004c0 2.35.614 4.644 1.78 6.666L2.667 29.333l6.835-1.792a13.28 13.28 0 0 0 6.502 1.696h.006c7.363 0 13.333-5.973 13.333-13.337 0-3.562-1.387-6.912-3.906-9.431a13.246 13.246 0 0 0-9.433-3.802zm0 24.316h-.005a11.06 11.06 0 0 1-5.637-1.544l-.404-.24-4.056 1.063 1.083-3.954-.263-.419a11.045 11.045 0 0 1-1.696-5.885c0-6.11 4.971-11.081 11.084-11.081 2.96 0 5.743 1.154 7.835 3.248a11.01 11.01 0 0 1 3.243 7.838c0 6.111-4.973 11.074-11.084 11.074zm6.078-8.299c-.333-.167-1.971-.973-2.276-1.084-.305-.111-.528-.167-.75.167-.222.333-.861 1.084-1.055 1.306-.195.222-.389.25-.722.083-.333-.167-1.407-.519-2.68-1.654-.991-.884-1.66-1.975-1.855-2.308-.194-.333-.021-.513.146-.679.15-.149.333-.389.5-.583.167-.195.222-.333.333-.556.111-.222.056-.417-.028-.583-.083-.167-.75-1.806-1.028-2.473-.27-.649-.545-.561-.75-.571l-.639-.011c-.222 0-.583.083-.889.417-.305.333-1.167 1.139-1.167 2.778s1.195 3.223 1.361 3.445c.167.222 2.351 3.59 5.695 5.034.796.344 1.417.549 1.901.703.799.254 1.526.218 2.101.132.641-.096 1.971-.806 2.249-1.584.278-.778.278-1.445.194-1.584-.083-.139-.305-.222-.639-.389z"
          />
        </svg>

        {/* Tooltip on Desktop */}
        <span className="hidden md:inline-block absolute right-16 bg-[#2B2625] text-[#FAF6F0] text-[11px] font-medium tracking-wide py-1.5 px-3 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
          Chat with Concierge
        </span>
      </a>
    </aside>
  );
}
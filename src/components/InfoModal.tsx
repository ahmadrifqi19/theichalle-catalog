'use client';

import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function InfoModal({ isOpen, onClose, title, content }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B2625]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FAF6F0] rounded-sm max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EADFCF] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#2B2625]/70 hover:text-[#5C1A26] rounded-full hover:bg-[#F3ECE1] transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#C2654A]" />
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#5C1A26] font-semibold">
            The Ichalle Collection
          </span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2625] font-normal border-b border-[#EADFCF] pb-4">
          {title}
        </h2>

        {/* Modal Body */}
        <div className="mt-5 max-h-[60vh] overflow-y-auto pr-2 text-sm text-[#2B2625]/85 leading-relaxed space-y-4 font-light whitespace-pre-line">
          {content}
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-[#EADFCF] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#5C1A26] hover:bg-[#46121C] text-[#FAF6F0] px-6 py-2 rounded text-xs uppercase tracking-widest font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


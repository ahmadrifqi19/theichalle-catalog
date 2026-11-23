'use client';

import React, { useState } from 'react';
import { MapPin, FileText, ArrowUpRight } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import { StoreSettings } from '@/lib/types';
import InfoModal from './InfoModal';
import Image from 'next/image';

interface FooterProps {
  settings: StoreSettings;
  onSelectCategory?: (category: string) => void;
}

export default function Footer({ settings, onSelectCategory }: FooterProps) {
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: '',
    content: '',
  });

  const openInfoModal = (title: string, content: string) => {
    setModalConfig({
      isOpen: true,
      title,
      content,
    });
  };

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <footer className="bg-[#3E1019] text-[#FAF6F0] pt-12 sm:pt-16 pb-16 sm:pb-12 border-t border-[#5C1A26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Vertical Stack on Mobile (grid-cols-1), 3 Columns on Tablet/Desktop (md:grid-cols-3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {/* Column 1: Brand Bio + Socials */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center">
                <Image
                  src="/logo-white.png"
                  alt="The Ichalle - Timeless Women Wear"
                  width={235}
                  height={56}
                  style={{ maxHeight: '56px', maxWidth: '235px', width: 'auto', height: 'auto' }}
                  className="object-contain brightness-0 invert"
                />
              </div>

              <p className="text-xs sm:text-sm text-[#F3ECE1]/80 leading-relaxed font-light max-w-sm">
                Dedicated to curating modest, graceful, and everlasting feminine silhouettes. Each piece is an ode to understated luxury, designed with intention and crafted with devotion.
              </p>

              {/* Social Media Links with Touch-friendly hit target */}
              <div className="pt-2 flex items-center space-x-2.5 sm:space-x-3">
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#FAF6F0]/10 hover:bg-[#FAF6F0]/20 flex items-center justify-center text-[#FAF6F0] transition-colors active:scale-95"
                    title="Instagram"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}

                {settings.whatsapp_number && (
                  <a
                    href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#FAF6F0]/10 hover:bg-[#FAF6F0]/20 flex items-center justify-center text-[#FAF6F0] transition-colors active:scale-95"
                    title="WhatsApp Inquiries"
                    aria-label="WhatsApp"
                  >
                 <svg
                      viewBox="0 0 32 32"
                      fill="#FAF6F0"
                      style={{ fill: '#FAF6F0' }}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      aria-hidden="true"
                    >
                      <path
                        fill="#FAF6F0"
                        d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16.004c0 2.35.614 4.644 1.78 6.666L2.667 29.333l6.835-1.792a13.28 13.28 0 0 0 6.502 1.696h.006c7.363 0 13.333-5.973 13.333-13.337 0-3.562-1.387-6.912-3.906-9.431a13.246 13.246 0 0 0-9.433-3.802zm0 24.316h-.005a11.06 11.06 0 0 1-5.637-1.544l-.404-.24-4.056 1.063 1.083-3.954-.263-.419a11.045 11.045 0 0 1-1.696-5.885c0-6.11 4.971-11.081 11.084-11.081 2.96 0 5.743 1.154 7.835 3.248a11.01 11.01 0 0 1 3.243 7.838c0 6.111-4.973 11.074-11.084 11.074zm6.078-8.299c-.333-.167-1.971-.973-2.276-1.084-.305-.111-.528-.167-.75.167-.222.333-.861 1.084-1.055 1.306-.195.222-.389.25-.722.083-.333-.167-1.407-.519-2.68-1.654-.991-.884-1.66-1.975-1.855-2.308-.194-.333-.021-.513.146-.679.15-.149.333-.389.5-.583.167-.195.222-.333.333-.556.111-.222.056-.417-.028-.583-.083-.167-.75-1.806-1.028-2.473-.27-.649-.545-.561-.75-.571l-.639-.011c-.222 0-.583.083-.889.417-.305.333-1.167 1.139-1.167 2.778s1.195 3.223 1.361 3.445c.167.222 2.351 3.59 5.695 5.034.796.344 1.417.549 1.901.703.799.254 1.526.218 2.101.132.641-.096 1.971-.806 2.249-1.584.278-.778.278-1.445.194-1.584-.083-.139-.305-.222-.639-.389z"
                      />
                    </svg>
                  </a>
                )}

                {settings.shopee_url && (
                  <a
                    href={settings.shopee_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 h-10 rounded-full bg-[#FAF6F0]/10 hover:bg-[#FAF6F0]/20 flex items-center gap-1.5 text-xs text-[#FAF6F0] transition-colors active:scale-95"
                    title="Shopee Official"
                  >
                    <span>Shopee</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}

                {settings.tiktok_url && (
                  <a
                    href={settings.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 h-10 rounded-full bg-[#FAF6F0]/10 hover:bg-[#FAF6F0]/20 flex items-center gap-1.5 text-xs text-[#FAF6F0] transition-colors active:scale-95"
                    title="TikTok Shop"
                  >
                    <span>TikTok</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Column 2: Quick Collections */}
            <div>
              <h3 className="font-serif text-sm sm:text-base uppercase tracking-widest text-[#FAF6F0] mb-3 sm:mb-4 pb-1.5 border-b border-[#FAF6F0]/15 inline-block">
                Quick Collections
              </h3>
              <ul className="space-y-1 text-xs sm:text-sm text-[#F3ECE1]/85">
                {['All', 'Blouses', 'Dresses', 'Sets', 'New Arrivals', 'Sale'].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className="py-1.5 sm:py-1 block w-full text-left hover:text-[#FAF6F0] active:text-[#FAF6F0] hover:underline underline-offset-4 transition-colors tracking-wide"
                    >
                      {cat} {cat !== 'All' && cat !== 'Sets' ? 'Collection' : ''}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Information Menu (Optimized for thumb tapping) */}
            <div>
              <h3 className="font-serif text-sm sm:text-base uppercase tracking-widest text-[#FAF6F0] mb-3 sm:mb-4 pb-1.5 border-b border-[#FAF6F0]/15 inline-block">
                Information & Assistance
              </h3>
              <ul className="space-y-1 text-xs sm:text-sm text-[#F3ECE1]/85">
                <li>
                  <button
                    onClick={() => openInfoModal('About Us', settings.about_us)}
                    className="py-2 sm:py-1.5 block w-full text-left hover:text-[#FAF6F0] hover:underline underline-offset-4 transition-colors"
                  >
                    About The Ichalle
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfoModal('Terms & Conditions', settings.terms_conditions)}
                    className="py-2 sm:py-1.5 block w-full text-left hover:text-[#FAF6F0] hover:underline underline-offset-4 transition-colors"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfoModal('Privacy Policy', settings.privacy_policy)}
                    className="py-2 sm:py-1.5 block w-full text-left hover:text-[#FAF6F0] hover:underline underline-offset-4 transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfoModal('Refund & Exchange Policy', settings.refund_policy)}
                    className="py-2 sm:py-1.5 block w-full text-left hover:text-[#FAF6F0] hover:underline underline-offset-4 transition-colors"
                  >
                    Refund & Exchange Policy
                  </button>
                </li>
                {settings.gmaps_url && (
                  <li>
                    <a
                      href={settings.gmaps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 sm:py-1.5 inline-flex items-center gap-1.5 hover:text-[#FAF6F0] hover:underline underline-offset-4 transition-colors text-[#F3ECE1]"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#C2654A] shrink-0" />
                      <span>Boutique Location (Google Maps)</span>
                      <ArrowUpRight className="w-3 h-3 shrink-0" />
                    </a>
                  </li>
                )}
                {settings.ecatalogue_url && (
                  <li>
                    <a
                      href={settings.ecatalogue_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 sm:py-1.5 inline-flex items-center gap-1.5 hover:text-[#FAF6F0] hover:underline underline-offset-4 transition-colors text-[#F3ECE1]"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C2654A] shrink-0" />
                      <span>Download E-Catalogue (PDF)</span>
                      <ArrowUpRight className="w-3 h-3 shrink-0" />
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-[#FAF6F0]/15 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F3ECE1]/60 gap-3 text-center sm:text-left">
            <p className="tracking-wide">
              © {new Date().getFullYear()} The Ichalle Collection. All rights reserved.
            </p>
            <p className="tracking-wider">
              Designed & Developed by <span className="font-medium text-[#FAF6F0]">Rifqi Fauzi</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Pop-up Information Modal */}
      <InfoModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        content={modalConfig.content}
      />
    </>
  );
}

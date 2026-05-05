import React from 'react';
import { Facebook, Mail, Send, Twitter } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { icon: <Send size={18} />, href: "https://t.me/gtee14", label: "Telegram" },
    { icon: <Facebook size={18} />, href: "https://facebook.com/Godwin.thompson.1612", label: "Facebook" },
    { icon: <Twitter size={18} />, href: "https://x.com/_godwinthompson", label: "X" },
    { icon: <Mail size={18} />, href: "mailto:talktothegt@gmail.com", label: "Email" },
  ];

  return (
    <footer className="border-t border-brand-ink/10 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        <p className="display text-2xl font-bold mb-2 tracking-tight">theGT</p>
        <p className="mono text-[10px] uppercase tracking-widest opacity-40 mb-8">Visual Identity & Design</p>
        
        <div className="flex gap-6 mb-10">
          {socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center border border-brand-ink/10 hover:bg-brand-ink hover:text-white transition-all hover:scale-110 active:scale-95"
              aria-label={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>

        <p className="text-xs opacity-40 mono uppercase tracking-widest">
          © {new Date().getFullYear()} theGT Portfolio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

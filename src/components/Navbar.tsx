"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Milk, Sparkles, Egg, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "முகப்பு", href: "/", icon: Home },
    { name: "மாடுகள்", href: "/cow", icon: Milk },
    { name: "ஆடுகள்", href: "/goat", icon: Sparkles },
    { name: "கோழிகள்", href: "/poultry", icon: Egg },
  ];

  return (
    <nav className="bg-emerald-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Compact Navbar Height: h-14 for Mobile, h-16 for Desktop */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo & Title Section */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="RM Farm Logo"
              width={40}
              height={40}
              priority
              className="w-8 h-8 sm:w-10 sm:h-10 aspect-square object-cover drop-shadow-sm"
            />
            <span className="text-sm sm:text-base md:text-lg font-black tracking-wide text-white whitespace-nowrap">
              RM Farm World
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-inner"
                      : "text-emerald-100 hover:bg-emerald-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {isOpen && (
        <div className="md:hidden bg-emerald-950 px-3 pt-2 pb-3 space-y-1 shadow-xl border-t border-emerald-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-inner"
                    : "text-emerald-100 hover:bg-emerald-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
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
    <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Title */}
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-black tracking-wider text-emerald-400">
              RM பண்ணை மேலாண்மை
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
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

          {/* Mobile Menu Button (Hamburger) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {isOpen && (
        <div className="md:hidden bg-emerald-950 px-4 pt-2 pb-4 space-y-1 shadow-xl border-t border-emerald-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-inner"
                    : "text-emerald-100 hover:bg-emerald-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
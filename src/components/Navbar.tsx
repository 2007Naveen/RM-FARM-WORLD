"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Milk, Sparkles, Egg } from "lucide-react";

export default function Navbar() {
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
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-wider text-emerald-400">
              RM பண்ணை மேலாண்மை
            </span>
          </div>
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
        </div>
      </div>
    </nav>
  );
}
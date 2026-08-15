"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";

interface RedMarkDate {
  date: string;
  label: string;
}

interface CalendarProps {
  redMarks?: RedMarkDate[];
}

export default function TamilCalendar({ redMarks = [] }: CalendarProps) {
  const [todayFormatted, setTodayFormatted] = useState<string>("");
  const [dayName, setDayName] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    setTodayFormatted(
      today.toLocaleDateString("ta-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    setDayName(today.toLocaleDateString("ta-IN", { weekday: "long" }));
  }, []);

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-600" /> தமிழ் நாட்காட்டி
        </h3>
        <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold">
          இன்றைய தேதி
        </span>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 rounded-2xl p-4 text-center mb-4">
        <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
          இன்றைய திகதி & கிழமை
        </p>
        <h4 className="text-xl font-black text-amber-950 mt-0.5">
          {todayFormatted || "ஏற்றப்படுகிறது..."}
        </h4>
        <p className="text-sm font-bold text-stone-700 mt-1 capitalize">{dayName}</p>
      </div>

      {redMarks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> சினை/முக்கிய நாட்கள் (Red Marks):
          </p>
          <div className="grid grid-cols-2 gap-2">
            {redMarks.map((mark, index) => (
              <div key={index} className="p-2 bg-red-50 border border-red-200 rounded-xl text-center">
                <span className="text-[10px] text-red-700 font-bold block">{mark.label}</span>
                <span className="text-xs font-bold text-red-950">{mark.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
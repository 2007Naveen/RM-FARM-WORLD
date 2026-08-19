"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, AlertCircle, RefreshCw } from "lucide-react";

interface RedMarkDate {
  date: string;
  label: string;
}

interface CalendarProps {
  redMarks?: RedMarkDate[];
}

export default function TamilCalendar({ redMarks = [] }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [dayName, setDayName] = useState<string>("");
  const [isToday, setIsToday] = useState<boolean>(true);

  // இன்றைய தேதியைத் துல்லியமாகப் பெற உதவும் ஃபங்ஷன்
  const updateToDate = (dateObj: Date) => {
    setFormattedDate(
      dateObj.toLocaleDateString("ta-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    setDayName(dateObj.toLocaleDateString("ta-IN", { weekday: "long" }));
  };

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const isoToday = `${yyyy}-${mm}-${dd}`;

    setSelectedDate(isoToday);
    updateToDate(today);

    // 1 நிமிடத்திற்கு ஒருமுறை நேரத்தைச் சரிபார்த்து நள்ளிரவு 12 AM தாண்டியதும் தேதியை தானாக மாற்றும் Logic
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== today.getDate()) {
        updateToDate(now);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // பயனர் தேதியை மாற்றும்போது (Manual Date Selection)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);

    if (!val) return;
    const [y, m, d] = val.split("-").map(Number);
    const newDate = new Date(y, m - 1, d);

    updateToDate(newDate);

    const now = new Date();
    const isCurrent =
      newDate.getDate() === now.getDate() &&
      newDate.getMonth() === now.getMonth() &&
      newDate.getFullYear() === now.getFullYear();

    setIsToday(isCurrent);
  };

  // மீண்டும் "இன்றைய தேதிக்கு" மாற
  const resetToToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
    updateToDate(today);
    setIsToday(true);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-600" /> தமிழ் நாட்காட்டி
        </h3>
        <button
          type="button"
          onClick={resetToToday}
          className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
            isToday
              ? "bg-amber-100 text-amber-900"
              : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
          }`}
        >
          {!isToday && <RefreshCw className="w-3 h-3" />}
          {isToday ? "இன்றைய தேதி" : "இன்று"}
        </button>
      </div>

      {/* Date Picker Input */}
      <div className="mb-3">
        <label className="text-[10px] font-bold text-stone-500 block mb-1">தேதியைத் தேர்ந்தெடுக்க</label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full border border-stone-300 rounded-xl p-2 text-xs font-semibold outline-none focus:border-emerald-600"
        />
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 rounded-2xl p-4 text-center mb-4">
        <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
          {isToday ? "இன்றைய திகதி & கிழமை" : "தேர்ந்தெடுக்கப்பட்ட திகதி"}
        </p>
        <h4 className="text-xl font-black text-amber-950 mt-0.5">
          {formattedDate || "ஏற்றப்படுகிறது..."}
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
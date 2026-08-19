"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, AlertCircle, RefreshCw, CalendarPlus, Clock } from "lucide-react";

interface RedMarkDate {
  date: string;
  label: string;
}

export default function IntegratedCalendarApp({ redMarks = [] }: { redMarks?: RedMarkDate[] }) {
  // Shared Active Date State
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [dayName, setDayName] = useState<string>("");
  const [selectedInputDate, setSelectedInputDate] = useState<string>("");

  // Date Calculator States
  const [mode, setMode] = useState<"add" | "diff">("add");
  const [baseDate, setBaseDate] = useState<string>("");
  const [daysToAdd, setDaysToAdd] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [diffResult, setDiffResult] = useState<string | null>(null);

  // Initialize Today
  useEffect(() => {
    const today = new Date();
    updateCalendarDisplay(today);
    
    const iso = formatDateToISO(today);
    setSelectedInputDate(iso);
    setBaseDate(iso);
    setStartDate(iso);
  }, []);

  const formatDateToISO = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const updateCalendarDisplay = (dateObj: Date) => {
    setActiveDate(dateObj);
    setFormattedDate(
      dateObj.toLocaleDateString("ta-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    setDayName(dateObj.toLocaleDateString("ta-IN", { weekday: "long" }));
  };

  // 1. Calculate Future Date & UPDATE CALENDAR IMMEDIATELY
  const handleCalculateFutureDate = () => {
    if (!baseDate || !daysToAdd) return;

    const [y, m, d] = baseDate.split("-").map(Number);
    const resultDate = new Date(y, m - 1, d);
    resultDate.setDate(resultDate.getDate() + parseInt(daysToAdd, 10));

    // Update Calendar Directly
    updateCalendarDisplay(resultDate);
    setSelectedInputDate(formatDateToISO(resultDate));
  };

  // 2. Date Difference Logic
  const handleCalculateDiff = () => {
    if (!startDate || !endDate) return;

    const [sY, sM, sD] = startDate.split("-").map(Number);
    const [eY, eM, eD] = endDate.split("-").map(Number);

    const start = new Date(sY, sM - 1, sD);
    const end = new Date(eY, eM - 1, eD);

    const totalDays = Math.round(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const m = Math.floor(totalDays / 30);
    const r = totalDays % 30;

    setDiffResult(`${totalDays} நாட்கள் (${m} மாதம் ${r} நாட்கள்)`);
  };

  // Manual Date Selection from Calendar Input
  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedInputDate(val);
    if (!val) return;

    const [y, m, d] = val.split("-").map(Number);
    updateCalendarDisplay(new Date(y, m - 1, d));
  };

  // Reset to Today
  const handleResetToToday = () => {
    const today = new Date();
    updateCalendarDisplay(today);
    const iso = formatDateToISO(today);
    setSelectedInputDate(iso);
    setBaseDate(iso);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* --- CALENDAR SECTION --- */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" /> தமிழ் நாட்காட்டி
          </h3>
          <button
            type="button"
            onClick={handleResetToToday}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 active:scale-95 transition-all"
          >
            <RefreshCw className="w-3 h-3" /> இன்று
          </button>
        </div>

        <div className="mb-3">
          <label className="text-[10px] font-bold text-stone-500 block mb-1">நாட்காட்டியில் பார்க்க வேண்டிய தேதி</label>
          <input
            type="date"
            value={selectedInputDate}
            onChange={handleManualDateChange}
            className="w-full border border-stone-300 rounded-xl p-2 text-xs font-semibold outline-none focus:border-emerald-600"
          />
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 rounded-2xl p-4 text-center mb-4">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            நாட்காட்டி திகதி
          </p>
          <h4 className="text-xl font-black text-amber-950 mt-0.5">
            {formattedDate || "ஏற்றப்படுகிறது..."}
          </h4>
          <p className="text-sm font-bold text-stone-700 mt-1 capitalize">{dayName}</p>
        </div>

        {redMarks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> சினை/முக்கிய நாட்கள்:
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

      {/* --- DATE CALCULATOR SECTION --- */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm">
        <div className="flex gap-2 mb-4 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("add")}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
              mode === "add" ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600"
            }`}
          >
            + நாட்கள் கூட்டி தேதி
          </button>
          <button
            type="button"
            onClick={() => setMode("diff")}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
              mode === "diff" ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600"
            }`}
          >
            இடைப்பட்ட நாட்கள்
          </button>
        </div>

        {mode === "add" ? (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <CalendarPlus className="w-4 h-4 text-emerald-600" /> நாட்கள் கூட்டினால் வரும் தேதி
            </h4>
            <div>
              <label className="text-[10px] font-bold text-stone-500 block mb-1">ஆரம்ப தேதி</label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-600 font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 block mb-1">கூட்ட வேண்டிய நாட்கள்</label>
              <input
                type="number"
                placeholder="எ.கா: 150"
                value={daysToAdd}
                onChange={(e) => setDaysToAdd(e.target.value)}
                className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-600 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleCalculateFutureDate}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2.5 rounded-xl font-bold active:scale-95 transition-all"
            >
              தேதியைக் கணக்கிட்டு நாட்காட்டியில் மாற்று
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" /> இடைப்பட்ட நாட்கள் கணக்கீடு
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-500 block mb-1">ஆரம்ப தேதி</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-xl p-2 text-xs outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 block mb-1">முடிவு தேதி</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-xl p-2 text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleCalculateDiff}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2.5 rounded-xl font-bold active:scale-95 transition-all"
            >
              கணக்கிடு
            </button>
            {diffResult && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-900">
                {diffResult}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
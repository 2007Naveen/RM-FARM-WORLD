"use client";

import { useState } from "react";
import { Clock, CalendarPlus } from "lucide-react";

export default function DateCalculator() {
  const [mode, setMode] = useState<"add" | "diff">("add");

  const [baseDate, setBaseDate] = useState("");
  const [daysToAdd, setDaysToAdd] = useState<string>("");
  const [futureResult, setFutureResult] = useState<{ dateStr: string; tamilStr: string } | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [diffResult, setDiffResult] = useState<string | null>(null);

  const calculateFutureDate = () => {
    if (!baseDate || !daysToAdd) return;

    // Split manually to avoid UTC conversion bugs
    const [year, month, day] = baseDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    dateObj.setDate(dateObj.getDate() + parseInt(daysToAdd, 10));

    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");

    const tamilFormatted = dateObj.toLocaleDateString("ta-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    });

    // Force UI State Update
    setFutureResult({
      dateStr: `${yyyy}-${mm}-${dd}`,
      tamilStr: tamilFormatted,
    });
  };

  const calculateDiff = () => {
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

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm max-w-md">
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
            <CalendarPlus className="w-4 h-4 text-emerald-600" /> குறிப்பிட்ட நாட்களுக்குப் பின் வரும் தேதி
          </h4>
          <div>
            <label className="text-[10px] font-bold text-stone-500 block mb-1">ஆரம்ப தேதி</label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-stone-500 block mb-1">கூட்ட வேண்டிய நாட்கள்</label>
            <input
              type="number"
              placeholder="எ.கா: 150"
              value={daysToAdd}
              onChange={(e) => setDaysToAdd(e.target.value)}
              className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-600"
            />
          </div>
          <button
            type="button"
            onClick={calculateFutureDate}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2.5 rounded-xl font-bold active:scale-95 transition-all"
          >
            தேதியைக் கணக்கிடு
          </button>
          {futureResult && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-700 block uppercase">வரவிருக்கும் தேதி</span>
              <p className="text-base font-extrabold text-emerald-950">{futureResult.dateStr}</p>
              <p className="text-xs font-bold text-emerald-800 capitalize">{futureResult.tamilStr}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" /> நாட்கள் கணக்கீடு
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
            onClick={calculateDiff}
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
  );
}
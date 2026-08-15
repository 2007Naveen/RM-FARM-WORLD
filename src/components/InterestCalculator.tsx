"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState<number | "">("");
  const [rate, setRate] = useState<number | "">("");
  const [months, setMonths] = useState<number | "">("");
  const [result, setResult] = useState<{ interest: number; total: number } | null>(null);

  const calculateInterest = () => {
    if (!principal || !rate || !months) return;
    const p = Number(principal);
    const r = Number(rate);
    const m = Number(months);

    // 100 ரூபாய்க்கு மாத வட்டி கணக்கீடு (Tamil Nadu Interest Standard)
    const monthlyInterest = (p * r) / 100;
    const totalInterest = monthlyInterest * m;
    const totalAmount = p + totalInterest;

    setResult({ interest: totalInterest, total: totalAmount });
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm max-w-md">
      <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-emerald-600" /> வட்டி கணக்கீடு
      </h3>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-bold text-stone-600 block mb-1">அசல் தொகை (₹)</label>
          <input
            type="number"
            placeholder="எ.கா: 100000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-600 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">வட்டி விகிதம் (% / மாதம்)</label>
            <input
              type="number"
              placeholder="எ.கா: 1.5 அல்லது 2"
              value={rate}
              onChange={(e) => setRate(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-600 font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1">மாதங்கள்</label>
            <input
              type="number"
              placeholder="எ.கா: 12"
              value={months}
              onChange={(e) => setMonths(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full border rounded-xl p-2.5 text-xs outline-none focus:border-emerald-600 font-medium"
            />
          </div>
        </div>
      </div>

      <button
        onClick={calculateInterest}
        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-3 rounded-xl font-bold transition-all shadow-sm"
      >
        வட்டி கணக்கிடு
      </button>

      {result && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-stone-500 block">வட்டி தொகை</span>
              <span className="font-extrabold text-emerald-800">₹ {result.interest.toLocaleString()}</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-stone-500 block">மொத்த தொகை</span>
              <span className="font-extrabold text-emerald-950">₹ {result.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
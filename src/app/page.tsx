"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Calculator,
  Mic,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Milk,
  Egg,
  Volume2,
} from "lucide-react";

export default function HomePage() {
  // 1. Date Calculator State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateDiffResult, setDateDiffResult] = useState<string | null>(null);

  // 2. Interest Calculator State
  const [principal, setPrincipal] = useState<number | "">("");
  const [rate, setRate] = useState<number | "">("");
  const [months, setMonths] = useState<number | "">("");
  const [interestResult, setInterestResult] = useState<{
    interest: number;
    total: number;
  } | null>(null);

  // 3. Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLogs, setVoiceLogs] = useState<string[]>([
    "இன்று 50 லிட்டர் பால் விற்பனை செய்யப்பட்டது.",
    "வெள்ளை ஆட்டுக்கு PPR தடுப்பூசி போடப்பட்டது.",
  ]);

  // Date Difference Logic
  const calculateDateDiff = () => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysInMonth = 30;
    const calculatedMonths = Math.floor(diffDays / daysInMonth);
    const remainingDays = diffDays % daysInMonth;

    setDateDiffResult(
      `${diffDays} நாட்கள் (${calculatedMonths} மாதம் ${remainingDays} நாட்கள்)`
    );
  };

  // Simple Interest Logic (மாத வட்டி கணக்கீடு)
  const calculateInterest = () => {
    if (!principal || !rate || !months) return;
    const monthlyInterest = (Number(principal) * Number(rate)) / 100;
    const totalInterest = monthlyInterest * Number(months);
    const grandTotal = Number(principal) + totalInterest;

    setInterestResult({
      interest: totalInterest,
      total: grandTotal,
    });
  };

  // Mock Voice Recording Toggle
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceLogs([
        "புதிய குரல் பதிவு சேர்க்கப்பட்டது: 10 கோழிகள் விற்பனை",
        ...voiceLogs,
      ]);
    } else {
      setIsRecording(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 p-4 md:p-8 font-sans">
      {/* Hero / Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/60 text-emerald-100 mb-3 border border-emerald-600/50">
              <Sparkles className="w-3.5 h-3.5" /> ஒருங்கிணைந்த பண்ணை மேலாண்மை
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              பண்ணை டாஷ்போர்டு (Farm Dashboard)
            </h1>
            <p className="text-emerald-100 text-sm mt-2 max-w-xl">
              தமிழ் நாட்காட்டி, நாள் & வட்டி கணக்கீடுகள் மற்றும் பண்ணை நிகழ்வுப் பதிவுகள் ஒரே இடத்தில்.
            </p>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex gap-3 w-full md:w-auto">
            
            
          </div>
        </div>
      </div>

      {/* Main 3 Flexbox / Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Box 1: தமிழ் நாட்காட்டி (Tamil Nithra Style Calendar Widget) */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-emerald-600" /> தமிழ் நாட்காட்டி
              </h2>
              <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-bold">
                இன்று
              </span>
            </div>

            {/* Tamil Date Display Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-5 text-center mb-6">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                தமிழ் ஆண்டு / மாதம்
              </p>
              <h3 className="text-2xl font-extrabold text-amber-950 mt-1">
                பராபவ வருடம் - ஆவணி 30
              </h3>
              <div className="my-3 border-t border-amber-200/60 w-1/2 mx-auto"></div>
              <p className="text-lg font-bold text-stone-800">15 ஆகஸ்ட் 2026</p>
              <p className="text-xs text-stone-500 mt-0.5">சனிக்கிழமை</p>
            </div>

            {/* Panchangam Details List */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2.5 rounded-xl bg-stone-50">
                <span className="text-stone-500 font-medium">நல்ல நேரம் (காலை)</span>
                <span className="font-bold text-stone-800">07:30 - 08:30</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-stone-50">
                <span className="text-stone-500 font-medium">நல்ல நேரம் (மாலை)</span>
                <span className="font-bold text-stone-800">04:30 - 05:30</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-red-50/60">
                <span className="text-red-700 font-medium">ராகு காலம்</span>
                <span className="font-bold text-red-900">09:00 - 10:30</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-stone-50">
                <span className="text-stone-500 font-medium">திதி</span>
                <span className="font-bold text-stone-800">திரியோதசி</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t text-xs text-stone-400 text-center">
            நித்ரா பாணி தமிழ் பஞ்சாங்கம் பதிப்பு
          </div>
        </div>

        {/* Box 2: Calculators (Date & Interest Calculator) */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm flex flex-col gap-6">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-600" /> பண்ணைக் கணக்கீடுகள்
          </h2>

          {/* Date Calculator Section */}
          <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/40">
            <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" /> நாட்கள் கணக்கீடு (Date Calculator)
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  ஆரம்ப தேதி
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-xl p-2 text-xs outline-none focus:border-emerald-600 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  முடிவு தேதி
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-xl p-2 text-xs outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>
            <button
              onClick={calculateDateDiff}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2 rounded-xl font-semibold transition-all"
            >
              நாட்களைக் கணக்கிடு
            </button>

            {dateDiffResult && (
              <div className="mt-3 p-2.5 bg-emerald-100/70 border border-emerald-200 rounded-xl text-center">
                <span className="text-xs text-emerald-800 font-bold">
                  மொத்த இடைவெளி: {dateDiffResult}
                </span>
              </div>
            )}
          </div>

          {/* Interest Calculator Section */}
          <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/40">
            <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> வட்டி கணக்கீடு (Interest Calculator)
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  அசல் (₹)
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={principal}
                  onChange={(e) =>
                    setPrincipal(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full border rounded-xl p-2 text-xs outline-none focus:border-emerald-600 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  வட்டி % (மாதம்)
                </label>
                <input
                  type="number"
                  placeholder="2"
                  value={rate}
                  onChange={(e) =>
                    setRate(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full border rounded-xl p-2 text-xs outline-none focus:border-emerald-600 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  மாதங்கள்
                </label>
                <input
                  type="number"
                  placeholder="12"
                  value={months}
                  onChange={(e) =>
                    setMonths(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full border rounded-xl p-2 text-xs outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>
            <button
              onClick={calculateInterest}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2 rounded-xl font-semibold transition-all"
            >
              வட்டியைக் கணக்கிடு
            </button>

            {interestResult && (
              <div className="mt-3 p-2.5 bg-emerald-100/70 border border-emerald-200 rounded-xl grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="text-emerald-700 block">வட்டி மட்டும்</span>
                  <span className="font-extrabold text-emerald-950">
                    ₹{interestResult.interest.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700 block">மொத்த தொகை</span>
                  <span className="font-extrabold text-emerald-950">
                    ₹{interestResult.total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Box 3: Voice Logger & Recent Activity */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-emerald-600" /> குரல் பதிவு குறிப்புகள்
              </h2>
            </div>

            {/* Voice Mic Button */}
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center mb-6">
              <button
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all shadow-md ${
                  isRecording
                    ? "bg-red-600 animate-pulse text-white ring-4 ring-red-200"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>
              <p className="text-xs font-bold text-stone-700 mt-3">
                {isRecording ? "பேசலாம்... (பதிவாகிறது)" : "குரல் பதிவு செய்ய பொத்தானை அழுத்தவும்"}
              </p>
            </div>

            {/* Log Feed */}
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              சமீபத்திய குறிப்புகள்
            </h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {voiceLogs.map((log, index) => (
                <div
                  key={index}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-800 flex items-start gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end">
            <button className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              அனைத்து பதிவுகளையும் பார் <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
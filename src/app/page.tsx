"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Calculator,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  FileText,
  Plus,
  Trash2,
  History,
} from "lucide-react";

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export default function HomePage() {
  // 1. Calendar Reference for Smooth Scroll
  const calendarRef = useRef<HTMLDivElement>(null);

  // Dynamic Shared Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [dayName, setDayName] = useState<string>("");

  // Initialize and Live Timer to change date automatically at midnight
  useEffect(() => {
    const today = new Date();
    updateCalendarDisplay(today);

    // Check every minute if the date changed automatically
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== calendarDate.getDate()) {
        updateCalendarDisplay(now);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const updateCalendarDisplay = (d: Date) => {
    setCalendarDate(d);
    setFormattedDate(
      d.toLocaleDateString("ta-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    setDayName(d.toLocaleDateString("ta-IN", { weekday: "long" }));
  };

  // 2. Date Calculator State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateDiffResult, setDateDiffResult] = useState<string | null>(null);

  // 3. Interest Calculator State
  const [principal, setPrincipal] = useState<number | "">("");
  const [rate, setRate] = useState<number | "">("");
  const [months, setMonths] = useState<number | "">("");
  const [interestResult, setInterestResult] = useState<{
    interest: number;
    total: number;
  } | null>(null);

  // 4. Daily Notes State & LocalStorage Logic
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("farm_daily_notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to parse saved notes", e);
      }
    } else {
      const defaultNotes: Note[] = [
        {
          id: "1",
          text: "இன்று 50 லிட்டர் பால் விற்பனை செய்யப்பட்டது.",
          createdAt: new Date().toLocaleDateString("ta-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        {
          id: "2",
          text: "வெள்ளை ஆட்டுக்கு PPR தடுப்பூசி போடப்பட்டது.",
          createdAt: new Date().toLocaleDateString("ta-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ];
      setNotes(defaultNotes);
    }
  }, []);

  // Save notes to localStorage
  const saveNotesToStorage = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem("farm_daily_notes", JSON.stringify(updatedNotes));
  };

  // Add a new note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const createdStamp = new Date().toLocaleDateString("ta-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const item: Note = {
      id: Date.now().toString(),
      text: newNote.trim(),
      createdAt: createdStamp,
    };

    const updated = [item, ...notes];
    saveNotesToStorage(updated);
    setNewNote("");
  };

  // Delete a note
  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((note) => note.id !== id);
    saveNotesToStorage(updated);
  };

  // Date Difference Logic (Timezone safe)
  const calculateDateDiff = () => {
    if (!startDate || !endDate) return;
    const [sY, sM, sD] = startDate.split("-").map(Number);
    const [eY, eM, eD] = endDate.split("-").map(Number);

    const startUTC = Date.UTC(sY, sM - 1, sD);
    const endUTC = Date.UTC(eY, eM - 1, eD);

    const diffTime = Math.abs(endUTC - startUTC);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const calculatedMonths = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;

    setDateDiffResult(
      `${diffDays} நாட்கள் (${calculatedMonths} மாதம் ${remainingDays} நாட்கள்)`
    );
  };

  // Push End-Date to Main Calendar and Scroll
  const pushDateToCalendar = () => {
    if (!endDate) return;
    const [y, m, d] = endDate.split("-").map(Number);

    updateCalendarDisplay(new Date(y, m - 1, d));

    if (calendarRef.current) {
      calendarRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Reset Calendar to Today
  const resetToToday = () => {
    updateCalendarDisplay(new Date());
  };

  // Simple Interest Logic
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

  // Dynamic Panchangam calculation
  const getPanchangamDetails = (date: Date) => {
    const dayOfWeek = date.getDay();

    const raghuKalamMap: Record<number, string> = {
      0: "04:30 - 06:00",
      1: "07:30 - 09:00",
      2: "03:00 - 04:30",
      3: "12:00 - 01:30",
      4: "01:30 - 03:00",
      5: "10:30 - 12:00",
      6: "09:00 - 10:30",
    };

    const nallaNeramMap: Record<number, { morning: string; evening: string }> = {
      0: { morning: "07:30 - 08:30", evening: "03:30 - 04:30" },
      1: { morning: "06:30 - 07:30", evening: "04:30 - 05:30" },
      2: { morning: "07:30 - 08:30", evening: "04:30 - 05:30" },
      3: { morning: "09:15 - 10:15", evening: "04:45 - 05:45" },
      4: { morning: "10:45 - 11:45", evening: "06:30 - 07:30" },
      5: { morning: "09:15 - 10:15", evening: "04:30 - 05:30" },
      6: { morning: "07:30 - 08:30", evening: "05:00 - 06:00" },
    };

    const tithis = [
      "பிரதமை", "திவிதியை", "திரிதியை", "சதுர்த்தி", "பஞ்சமி",
      "ஷஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி",
      "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்த்தசி", "பௌர்ணமி / அமாவாசை",
    ];

    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const tithiIndex = dayOfYear % 15;

    return {
      nallaNeramMorning: nallaNeramMap[dayOfWeek].morning,
      nallaNeramEvening: nallaNeramMap[dayOfWeek].evening,
      raghuKalam: raghuKalamMap[dayOfWeek],
      tithi: tithis[tithiIndex],
    };
  };

  const currentPanchangam = getPanchangamDetails(calendarDate);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed font-sans relative w-full overflow-x-hidden"
      style={{ backgroundImage: "url('/dashboard-bg.png')" }}
    >
      {/* Background Overlay to balance contrast */}
      <div className="min-h-screen bg-black/10 backdrop-blur-[1px] p-[3vw] sm:p-6 lg:p-8">
        
        {/* Hero / Header Section */}
        <div className="max-w-7xl mx-auto mb-[3vw] sm:mb-8">
          <div className="bg-emerald-950/90 backdrop-blur-md rounded-[3vw] sm:rounded-3xl p-[4vw] sm:p-8 text-white shadow-2xl border border-emerald-800/50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[3vw] sm:gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[2.8vw] sm:text-xs font-semibold bg-emerald-800/80 text-emerald-200 mb-3 border border-emerald-700/50">
                <Sparkles className="w-3.5 h-3.5 shrink-0" /> ஒருங்கிணைந்த பண்ணை மேலாண்மை
              </span>
              <h1 className="text-[6vw] sm:text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-300 leading-tight">
                RM பண்ணை உலகம்
              </h1>
              <p className="text-emerald-100/90 text-[3vw] sm:text-sm mt-2 max-w-xl leading-relaxed">
                தமிழ் நாட்காட்டி, நாள் & வட்டி கணக்கீடுகள் மற்றும் தினசரி குறிப்புகள் ஒரே இடத்தில்.
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-[3vw] sm:gap-8">
          
          {/* Box 1: Dynamic Tamil Calendar Widget */}
          <div ref={calendarRef} className="bg-white/90 backdrop-blur-md rounded-[3vw] sm:rounded-3xl border border-white/60 p-[4vw] sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[4.5vw] sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-emerald-700" /> தமிழ் நாட்காட்டி
                </h2>
                <button type="button"
                  onClick={resetToToday}
                  className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> இன்று
                </button>
              </div>

              {/* Tamil Date Display Card */}
              <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/90 border border-amber-200/80 rounded-[2.5vw] sm:rounded-2xl p-[3.5vw] sm:p-5 text-center mb-6 shadow-sm">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  இன்றைய தேதி
                </p>
                <h3 className="text-2xl font-extrabold text-amber-950 mt-1">
                  {formattedDate || "ஏற்றப்படுகிறது..."}
                </h3>
                <div className="my-3 border-t border-amber-200/80 w-1/2 mx-auto"></div>
                <p className="text-sm font-bold text-stone-700 capitalize">{dayName}</p>
              </div>

              {/* Panchangam Details List */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2.5 rounded-xl bg-white/70">
                  <span className="text-stone-600 font-medium">நல்ல நேரம் (காலை)</span>
                  <span className="font-bold text-stone-800">{currentPanchangam.nallaNeramMorning}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/70">
                  <span className="text-stone-600 font-medium">நல்ல நேரம் (மாலை)</span>
                  <span className="font-bold text-stone-800">{currentPanchangam.nallaNeramEvening}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-red-100/70">
                  <span className="text-red-700 font-medium">ராகு காலம்</span>
                  <span className="font-bold text-red-900">{currentPanchangam.raghuKalam}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/70">
                  <span className="text-stone-600 font-medium">திதி</span>
                  <span className="font-bold text-stone-800">{currentPanchangam.tithi}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200/60 text-xs text-stone-500 text-center font-medium">
              நேரலை தமிழ் நாட்காட்டி பதிப்பு
            </div>
          </div>

          {/* Box 2: Calculators */}
          <div className="bg-white/90 backdrop-blur-md rounded-[3vw] sm:rounded-3xl border border-white/60 p-[4vw] sm:p-6 shadow-xl flex flex-col gap-6">
            <h2 className="text-[4.5vw] sm:text-xl font-bold text-stone-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-700" /> பண்ணைக் கணக்கீடுகள்
            </h2>

            {/* Date Calculator Section */}
            <div className="border border-stone-200/80 rounded-2xl p-4 bg-white/60">
              <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" /> நாட்கள் கணக்கீடு (Date Calculator)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
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
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
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

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={calculateDateDiff}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2 rounded-xl font-semibold transition-all shadow-sm"
                >
                  கணக்கிடு
                </button>
                
                <button
                  type="button"
                  onClick={pushDateToCalendar}
                  title="நாட்காட்டிக்கு அனுப்பு"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs px-3 py-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> நாட்காட்டியில் பார்
                </button>
              </div>

              {dateDiffResult && (
                <div className="mt-3 p-2.5 bg-emerald-100/90 border border-emerald-300 rounded-xl text-center">
                  <span className="text-xs text-emerald-900 font-bold">
                    மொத்த இடைவெளி: {dateDiffResult}
                  </span>
                </div>
              )}
            </div>

            {/* Interest Calculator Section */}
            <div className="border border-stone-200/80 rounded-2xl p-4 bg-white/60">
              <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-700" /> வட்டி கணக்கீடு (Interest Calculator)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
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
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
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
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
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
                type="button"
                onClick={calculateInterest}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2 rounded-xl font-semibold transition-all shadow-sm"
              >
                வட்டியைக் கணக்கிடு
              </button>

              {interestResult && (
                <div className="mt-3 p-2.5 bg-emerald-100/90 border border-emerald-300 rounded-xl grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <span className="text-emerald-800 block font-medium">வட்டி மட்டும்</span>
                    <span className="font-extrabold text-emerald-950">
                      ₹{interestResult.interest.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-800 block font-medium">மொத்த தொகை</span>
                    <span className="font-extrabold text-emerald-950">
                      ₹{interestResult.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Box 3: Daily Notes & History */}
          <div className="bg-white/90 backdrop-blur-md rounded-[3vw] sm:rounded-3xl border border-white/60 p-[4vw] sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-[4.5vw] sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-emerald-700" /> தினசரி குறிப்புகள் (Notes)
                </h2>
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                    showHistory
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-200/80 hover:bg-stone-300/80 text-stone-700"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  {showHistory ? "முகப்பு" : "வரலாறு (History)"}
                </button>
              </div>

              {/* Input Form to Add Notes */}
              {!showHistory && (
                <form onSubmit={handleAddNote} className="mb-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="இன்றைய குறிப்பை எழுதவும்..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 min-w-0 border border-stone-300/80 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-600 bg-white"
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shrink-0 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> சேமி
                    </button>
                  </div>
                </form>
              )}

              {/* Section Heading */}
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>{showHistory ? "அனைத்து குறிப்புகள்" : "சமீபத்திய குறிப்புகள்"}</span>
                <span className="text-stone-500 font-medium">({notes.length})</span>
              </h3>

              {/* Notes List */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {notes.length === 0 ? (
                  <p className="text-xs text-stone-500 text-center py-6">
                    குறிப்புகள் எதுவும் இல்லை.
                  </p>
                ) : (
                  (showHistory ? notes : notes.slice(0, 4)).map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-white/80 rounded-xl border border-stone-200/80 text-xs text-stone-800 flex items-start justify-between gap-2 group hover:border-emerald-300 transition-all shadow-sm"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium text-stone-800 leading-relaxed">
                            {note.text}
                          </p>
                          <span className="text-[10px] text-stone-400 block mt-1">
                            {note.createdAt}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        title="நீக்கு"
                        className="text-stone-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200/60 flex justify-between items-center text-xs text-stone-500">
              <span className="font-medium">தானாக சேமிக்கப்படுகிறது</span>
              {!showHistory && notes.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowHistory(true)}
                  className="font-bold text-emerald-700 hover:text-emerald-800"
                >
                  மேலும் பார்க்க ({notes.length - 4})
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
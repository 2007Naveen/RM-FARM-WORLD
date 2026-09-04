"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, Calendar as CalendarIcon, Syringe, ShieldAlert, 
  Heart, Activity, X, Upload, ArrowRightLeft, Trash2, Edit, FileText, Clock
} from "lucide-react";
import {
  getHens,
  addHen,
  addIncubation,
  addPoultryVaccination,
  addPoultryNote,
  updateHenType,
  deleteHen,
  deleteIncubation,
  deletePoultryVaccination,
  deletePoultryNote,
  updateHenDetails,
} from "@/app/actions/poultryActions";

interface EggIncubation {
  id: number;
  startDate: string | Date | number | null | undefined;
  expectedHatchDate: string | Date | number | null | undefined;
}

interface Vaccination {
  id: number;
  name: string;
  date: string | Date | number | null | undefined;
  description: string | null;
}

interface GeneralNote {
  id: number;
  date: string | Date | number | null | undefined;
  text: string;
}

interface Poultry {
  id: number;
  name: string;
  type: "HEN" | "CHICK";
  photoUrl: string | null;
  birthDate: string | Date | number | null | undefined;
  source: "BORN_HERE" | "PURCHASED";
  motherId?: number;
  motherName?: string;
  incubations: EggIncubation[];
  vaccinations: Vaccination[];
  notes: GeneralNote[];
}

export default function PoultryPage() {
  const [activeTab, setActiveTab] = useState<"HEN" | "CHICK">("HEN");
  const [selectedBird, setSelectedBird] = useState<Poultry | null>(null);
  
  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditBirdModalOpen, setIsEditBirdModalOpen] = useState(false);
  const [isIncubationModalOpen, setIsIncubationModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isChickHatchModalOpen, setIsChickHatchModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Form States - Add New
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"HEN" | "CHICK">("HEN");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newSource, setNewSource] = useState<"BORN_HERE" | "PURCHASED">("BORN_HERE");
  const [selectedMotherForNew, setSelectedMotherForNew] = useState<number | "">("");
  const [photoBase64, setPhotoBase64] = useState<string>("");

  // Form States - Edit Bird Details
  const [editName, setEditName] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editSource, setEditSource] = useState<"BORN_HERE" | "PURCHASED">("BORN_HERE");
  const [editPhotoBase64, setEditPhotoBase64] = useState<string>("");

  // Multiple Chicks Hatch State
  const [chicksCount, setChicksCount] = useState<number>(1);
  const [chickNames, setChickNames] = useState<string[]>([""]);
  const [chickHatchDate, setChickHatchDate] = useState(new Date().toISOString().split("T")[0]);

  const [newIncubationDate, setNewIncubationDate] = useState("");
  const [editingIncubationId, setEditingIncubationId] = useState<number | null>(null);

  const [vacName, setVacName] = useState("");
  const [vacDate, setVacDate] = useState("");
  const [vacNotes, setVacNotes] = useState("");
  const [editingVacId, setEditingVacId] = useState<number | null>(null);

  const [noteText, setNoteText] = useState("");
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const [removeReason, setRemoveReason] = useState<"SOLD" | "OTHER">("SOLD");
  const [removeNotes, setRemoveNotes] = useState("");

  const [birds, setBirds] = useState<Poultry[]>([]);

  useEffect(() => {
    loadBirds();
  }, []);

  async function loadBirds() {
    try {
      const rawData = (await getHens()) as unknown as {
        success?: boolean;
        data?: Array<{
          id: number; name: string; type: Poultry["type"]; photoUrl: string | null;
          birthDate: Poultry["birthDate"]; source: Poultry["source"]; motherId: number | null;
          incubations?: EggIncubation[]; vaccinations?: Vaccination[]; notes?: GeneralNote[];
          mother?: { name: string } | null;
        }>;
      } | Array<{
        id: number; name: string; type: Poultry["type"]; photoUrl: string | null;
        birthDate: Poultry["birthDate"]; source: Poultry["source"]; motherId: number | null;
        incubations?: EggIncubation[]; vaccinations?: Vaccination[]; notes?: GeneralNote[];
        mother?: { name: string } | null;
      }>;

      const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);

      const data: Poultry[] = list.map((bird) => ({
        ...bird,
        motherId: bird.motherId || undefined,
        motherName: bird.mother?.name,
        incubations: bird.incubations || [],
        vaccinations: bird.vaccinations || [],
        notes: bird.notes || [],
      }));

      setBirds(data);
      setSelectedBird((previous) => previous ? data.find((bird) => bird.id === previous.id) || null : null);
    } catch (error) {
      console.error("Error loading poultry data:", error);
    }
  }

  function parseLocalDate(dateValue: string | Date | number | null | undefined) {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return new Date(dateValue.getTime());
    if (typeof dateValue === "number") return new Date(dateValue);
    const datePart = String(dateValue).slice(0, 10);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    const parsedDate = new Date(dateValue);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  }

  function formatDateValue(dateValue: string | Date | number | null | undefined) {
    if (!dateValue) return "-";
    const date = parseLocalDate(dateValue);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function getIncubationDaysInfo(startDateStr: string | Date | number | null | undefined) {
    if (!startDateStr) return { daysPassed: 0, daysRemaining: 23 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = parseLocalDate(startDateStr);
    start.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = 23 - daysPassed;

    return {
      daysPassed: daysPassed < 0 ? 0 : daysPassed,
      daysRemaining: daysRemaining < 0 ? 0 : daysRemaining
    };
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditPhotoBase64(reader.result as string);
        } else {
          setPhotoBase64(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  function calculateHatchDate(dateStr: string | Date | number | null | undefined): string {
    if (!dateStr) return "";
    const date = parseLocalDate(dateStr);
    date.setDate(date.getDate() + 23);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getWeeklyCheckpoints(incubationDateStr: string | Date | number | null | undefined) {
    if (!incubationDateStr) return [];
    const checkpoints = [];
    const days = [7, 14, 18, 23];
    const labels = ["7-ஆம் நாள் (Candling Check)", "14-ஆம் நாள் (Air Cell Check)", "18-ஆம் நாள் (Lockdown Day)", "23-ஆம் நாள் (Expected Hatch)"];

    for (let i = 0; i < days.length; i++) {
      const markDate = parseLocalDate(incubationDateStr);
      markDate.setDate(markDate.getDate() + days[i]);
      const yyyy = markDate.getFullYear();
      const mm = String(markDate.getMonth() + 1).padStart(2, "0");
      const dd = String(markDate.getDate()).padStart(2, "0");
      checkpoints.push({
        label: labels[i],
        date: `${yyyy}-${mm}-${dd}`,
      });
    }
    return checkpoints;
  }

  const handleConvertToHen = async (birdId: number) => {
    try {
      await updateHenType(birdId, "HEN");
      await loadBirds();
    } catch (error) {
      console.error("Error converting chick to hen:", error);
    }
  };

  const handleOpenEditBirdModal = () => {
    if (!selectedBird) return;
    setEditName(selectedBird.name);
    setEditBirthDate(formatDateValue(selectedBird.birthDate));
    setEditSource(selectedBird.source);
    setEditPhotoBase64(selectedBird.photoUrl || "");
    setIsEditBirdModalOpen(true);
  };

  const handleUpdateBirdDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBird || !editName) return;
    try {
      await updateHenDetails(selectedBird.id, {
        name: editName,
        birthDate: editBirthDate,
        source: editSource,
        photoUrl: editPhotoBase64 || undefined,
      });
      setIsEditBirdModalOpen(false);
      await loadBirds();
    } catch (error) {
      console.error("Error updating hen details:", error);
    }
  };

  const handleRemoveBird = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBird) return;
    try {
      await deleteHen(selectedBird.id);
      setSelectedBird(null);
      setIsRemoveModalOpen(false);
      setRemoveNotes("");
      await loadBirds();
    } catch (error) {
      console.error("Error removing bird:", error);
    }
  };

  const handleAddBird = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await addHen({
        name: newName,
        type: newType,
        birthDate: newBirthDate || new Date().toISOString().split("T")[0],
        source: newSource,
        photoUrl: photoBase64 || undefined,
        motherId: newType === "CHICK" && selectedMotherForNew ? Number(selectedMotherForNew) : undefined,
      });
      setNewName(""); setPhotoBase64(""); setNewBirthDate(""); setSelectedMotherForNew("");
      setIsAddModalOpen(false);
      await loadBirds();
    } catch (error) {
      console.error("Error adding bird:", error);
    }
  };

  const handleChickHatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBird) return;
    try {
      await Promise.all(Array.from({ length: chicksCount }, (_, index) => addHen({
        name: chickNames[index]?.trim() || `${selectedBird.name} - கோழிக்குஞ்சு ${index + 1}`,
        type: "CHICK", birthDate: chickHatchDate, source: "BORN_HERE", motherId: selectedBird.id,
      })));
      setChickNames([""]); setChicksCount(1);
      setChickHatchDate(new Date().toISOString().split("T")[0]);
      setIsChickHatchModalOpen(false);
      await loadBirds();
    } catch (error) {
      console.error("Error adding chicks:", error);
    }
  };

  const handleChicksCountChange = (count: number) => {
    setChicksCount(count);
    setChickNames((prev) => {
      const updated = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) updated.push("");
      } else {
        updated.length = count;
      }
      return updated;
    });
  };

  const handleChickNameChange = (index: number, val: string) => {
    const updated = [...chickNames];
    updated[index] = val;
    setChickNames(updated);
  };

  const handleSaveIncubation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncubationDate || !selectedBird) return;
    try {
      await addIncubation(selectedBird.id, newIncubationDate, 0);
      setNewIncubationDate(""); setEditingIncubationId(null); setIsIncubationModalOpen(false);
      await loadBirds();
    } catch (error) {
      console.error("Error saving incubation:", error);
    }
  };

  const handleEditIncubation = (inc: EggIncubation) => {
    setEditingIncubationId(inc.id);
    setNewIncubationDate(formatDateValue(inc.startDate));
    setIsIncubationModalOpen(true);
  };

  const handleDeleteIncubation = async (incId: number) => {
    if (!selectedBird) return;
    try {
      await deleteIncubation(incId);
      await loadBirds();
    } catch (error) {
      console.error("Error deleting incubation:", error);
    }
  };

  const handleSaveVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName || !vacDate || !selectedBird) return;
    try {
      await addPoultryVaccination(selectedBird.id, vacName, vacDate, vacNotes);
      setVacName(""); setVacDate(""); setVacNotes(""); setEditingVacId(null); setIsVaccineModalOpen(false);
      await loadBirds();
    } catch (error) {
      console.error("Error saving poultry vaccination:", error);
    }
  };

  const handleEditVaccine = (vac: Vaccination) => {
    setEditingVacId(vac.id);
    setVacName(vac.name);
    setVacDate(formatDateValue(vac.date));
    setVacNotes(vac.description || "");
    setIsVaccineModalOpen(true);
  };

  const handleDeleteVaccine = async (vacId: number) => {
    if (!selectedBird) return;
    try {
      await deletePoultryVaccination(vacId);
      await loadBirds();
    } catch (error) {
      console.error("Error deleting vaccine:", error);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText || !selectedBird) return;
    try {
      await addPoultryNote(selectedBird.id, noteDate, noteText);
      setNoteText(""); setNoteDate(new Date().toISOString().split("T")[0]);
      setEditingNoteId(null); setIsNoteModalOpen(false);
      await loadBirds();
    } catch (error) {
      console.error("Error saving poultry note:", error);
    }
  };

  const handleEditNote = (note: GeneralNote) => {
    setEditingNoteId(note.id);
    setNoteDate(formatDateValue(note.date));
    setNoteText(note.text);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!selectedBird) return;
    try {
      await deletePoultryNote(noteId);
      await loadBirds();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const filteredBirds = birds.filter((item) => item.type === activeTab);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed font-sans relative w-full overflow-x-hidden"
      style={{ backgroundImage: "url('/CHICK.png')" }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] pointer-events-none" />

      <div className="relative z-10 min-h-screen p-[3vw] sm:p-6 lg:p-8">
        
        {/* Top Header Banner */}
        <div className="max-w-7xl mx-auto bg-emerald-950/85 backdrop-blur-md border border-emerald-800/50 rounded-[3vw] sm:rounded-2xl p-[4vw] sm:p-6 text-white shadow-xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[3vw] sm:gap-4 mb-[3vw] sm:mb-6">
          <div>
            <h1 className="text-[5vw] sm:text-2xl md:text-3xl font-bold flex items-center gap-[2vw] sm:gap-3 text-emerald-400">
              <Heart className="w-[6vw] h-[6vw] sm:w-7 sm:h-7 fill-emerald-500 text-emerald-500 shrink-0" /> <span>கோழிகள் மேலாண்மை</span>
            </h1>
            <p className="text-[2.6vw] sm:text-xs md:text-sm mt-1 leading-relaxed text-emerald-200/80">
              அடைகாத்தல் கணக்கு (23 நாட்கள்), தடுப்பூசி & கோழிக்குஞ்சுகள் பதிவு
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[2.7vw] sm:text-sm font-semibold shadow-md transition-all border border-emerald-500/30 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> புதிய கோழி / குஞ்சு சேர்க்க
          </button>
        </div>

        {/* Tab Buttons Container */}
        <div className="max-w-7xl mx-auto bg-emerald-900/40 backdrop-blur-md border border-emerald-800/40 p-1.5 rounded-[2.5vw] sm:rounded-2xl mb-[3vw] sm:mb-6 flex gap-[1.5vw] sm:gap-2">
          <button
            onClick={() => { setActiveTab("HEN"); setSelectedBird(null); }}
            className={`flex-1 min-w-0 py-2 sm:py-3 px-1.5 sm:px-4 rounded-xl font-bold text-[2.7vw] sm:text-sm md:text-base leading-tight transition-all text-center ${
              activeTab === "HEN"
                ? "bg-emerald-700 text-white shadow-md border border-emerald-500/40"
                : "text-emerald-100/70 hover:bg-emerald-800/30 hover:text-white"
            }`}
          >
            தாய்க்கோழிகள் ({birds.filter((c) => c.type === "HEN").length})
          </button>
          <button
            onClick={() => { setActiveTab("CHICK"); setSelectedBird(null); }}
            className={`flex-1 min-w-0 py-2 sm:py-3 px-1.5 sm:px-4 rounded-xl font-bold text-[2.7vw] sm:text-sm md:text-base leading-tight transition-all text-center ${
              activeTab === "CHICK"
                ? "bg-emerald-700 text-white shadow-md border border-emerald-500/40"
                : "text-emerald-100/70 hover:bg-emerald-800/30 hover:text-white"
            }`}
          >
            கோழிக்குஞ்சுகள் ({birds.filter((c) => c.type === "CHICK").length})
          </button>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-[3vw] sm:gap-6">
          {/* Left Side: Bird List */}
          <div className="lg:col-span-1 space-y-[2vw] sm:space-y-3">
            {filteredBirds.length > 0 ? (
              filteredBirds.map((bird) => (
                <div
                  key={bird.id}
                  onClick={() => setSelectedBird(bird)}
                  className={`p-[3vw] sm:p-4 rounded-[2.5vw] sm:rounded-2xl bg-white/95 backdrop-blur-sm border-2 cursor-pointer transition-all shadow-sm hover:shadow-md flex items-center gap-[3vw] sm:gap-4 ${
                    selectedBird?.id === bird.id
                      ? "border-emerald-600 ring-2 ring-emerald-400"
                      : "border-emerald-100/50 hover:border-emerald-300"
                  }`}
                >
                  {bird.photoUrl ? (
                    <img
                      src={bird.photoUrl}
                      alt={bird.name}
                      className="w-[16vw] h-[16vw] sm:w-16 sm:h-16 rounded-[2vw] sm:rounded-xl object-cover border border-emerald-200 shrink-0"
                    />
                  ) : (
                    <div className="w-[16vw] h-[16vw] sm:w-16 sm:h-16 rounded-[2vw] sm:rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xl shrink-0">
                      {bird.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-emerald-950 truncate">{bird.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">தேதி: {formatDateValue(bird.birthDate)}</p>
                    
                    {bird.type === "CHICK" && bird.motherName && (
                      <p className="text-xs text-emerald-800 font-semibold mt-0.5 truncate">
                        அம்மா கோழி: {bird.motherName}
                      </p>
                    )}

                    <span className="inline-block mt-1 text-[11px] bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                      {bird.source === "BORN_HERE" ? "பண்ணையில் பொரித்தவை" : "வாங்கப்பட்டது"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white/80 rounded-2xl border border-emerald-200 text-emerald-800/60 font-medium">
                பதிவுகள் எதுவும் இல்லை. புதிய கோழி/குஞ்சு சேர்க்கவும்.
              </div>
            )}
          </div>

          {/* Right Side: Details View */}
          <div className="lg:col-span-2">
            {selectedBird ? (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-100 p-[3vw] sm:p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-100 pb-4 mb-6 gap-[2vw] sm:gap-3">
                  <div>
                    <h2 className="text-[4vw] sm:text-2xl font-bold text-emerald-950 truncate">{selectedBird.name}</h2>
                    <span className="text-xs text-emerald-700/70">விவரங்கள் மற்றும் அடைகாப்பு அட்டவணை</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    {/* EDIT BIRD BUTTON */}
                    <button
                      onClick={handleOpenEditBirdModal}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded-lg text-[2.5vw] sm:text-xs font-semibold transition-all shadow-sm"
                    >
                      <Edit className="w-4 h-4"/> திருத்த (Edit)
                    </button>

                    {selectedBird.type === "CHICK" && (
                      <button
                        onClick={() => handleConvertToHen(selectedBird.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 rounded-lg text-[2.5vw] sm:text-xs font-semibold transition-all"
                      >
                        <ArrowRightLeft className="w-4 h-4"/> பெரிய கோழியாக மாற்று
                      </button>
                    )}

                    <button
                      onClick={() => setIsRemoveModalOpen(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg text-[2.5vw] sm:text-xs font-semibold transition-all"
                    >
                      <Trash2 className="w-4 h-4"/> நீக்கு
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex flex-row gap-3 sm:gap-6 items-center bg-emerald-50/60 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 border border-emerald-100">
                    {selectedBird.photoUrl ? (
                      <img src={selectedBird.photoUrl} alt={selectedBird.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-emerald-200 shrink-0" />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xl sm:text-2xl border border-emerald-200 shrink-0">
                        {selectedBird.name.charAt(0)}
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-[2.8vw] sm:text-sm font-semibold text-gray-700">வகை: <span className="text-emerald-900 font-bold">{selectedBird.type === "HEN" ? "தாய்க்கோழி" : "கோழிக்குஞ்சு"}</span></p>
                      <p className="text-[2.8vw] sm:text-sm font-semibold text-gray-700">தேதி: <span className="text-emerald-900">{formatDateValue(selectedBird.birthDate)}</span></p>
                      {selectedBird.motherName && (
                        <p className="text-[2.8vw] sm:text-sm font-semibold text-emerald-800 truncate">அம்மா கோழி பெயர்: <span className="font-bold">{selectedBird.motherName}</span></p>
                      )}
                      <p className="text-[2.8vw] sm:text-sm font-semibold text-gray-700">மூலம்: <span className="text-emerald-900">{selectedBird.source === "BORN_HERE" ? "பண்ணையில் பொரித்தவை" : "வாங்கப்பட்ட கோழி"}</span></p>
                    </div>
                  </div>

                  {/* Egg Incubation Section */}
                  {selectedBird.type === "HEN" && (
                    <div className="mb-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                        <h3 className="font-bold text-[3.2vw] sm:text-lg text-emerald-950 flex items-center gap-1.5">
                          <CalendarIcon className="w-5 h-5 text-emerald-600"/> முட்டை அடைகாத்தல் (+23 நாட்கள்)
                        </h3>
                        <button
                          onClick={() => {
                            setEditingIncubationId(null);
                            setNewIncubationDate("");
                            setIsIncubationModalOpen(true);
                          }}
                          className="text-[2.5vw] sm:text-xs bg-emerald-700 text-white px-2.5 py-1 rounded-md hover:bg-emerald-800 transition-all font-medium shrink-0"
                        >
                          + அடை வைத்த தேதி சேர்க்க
                        </button>
                      </div>

                      {selectedBird.incubations.length > 0 ? (
                        selectedBird.incubations.map((inc) => {
                          const checkpoints = getWeeklyCheckpoints(inc.startDate);
                          const daysInfo = getIncubationDaysInfo(inc.startDate);
                          return (
                            <div key={inc.id} className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 mb-4 relative">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2vw] sm:gap-4 flex-1 w-full">
                                  <div className="bg-white p-3 rounded-lg border border-emerald-100">
                                    <p className="text-xs text-gray-500">அடை வைத்த தேதி</p>
                                    <p className="font-bold text-emerald-950">{formatDateValue(inc.startDate)}</p>
                                  </div>
                                  <div className="bg-emerald-100/70 p-3 rounded-lg border border-emerald-300">
                                    <p className="text-xs text-emerald-900 font-semibold">பொரிக்கும் தேதி (+23 நாட்கள்)</p>
                                    <p className="font-extrabold text-[3.5vw] sm:text-lg text-emerald-950">{formatDateValue(inc.expectedHatchDate)}</p>
                                  </div>
                                </div>
                                
                                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleEditIncubation(inc)}
                                    className="text-xs text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white border border-emerald-200 p-1.5 rounded-lg justify-center font-medium"
                                  >
                                    <Edit className="w-3.5 h-3.5"/> எடிட்
                                  </button>
                                  <button
                                    onClick={() => handleDeleteIncubation(inc.id)}
                                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 bg-white border border-red-200 p-1.5 rounded-lg justify-center font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5"/> நீக்கு
                                  </button>
                                  <button
                                    onClick={() => setIsChickHatchModalOpen(true)}
                                    className="text-xs bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-800 transition-all font-semibold"
                                  >
                                    🐤 குஞ்சு(கள்) பொரித்தது
                                  </button>
                                </div>
                              </div>

                              {/* Days Counter Box */}
                              <div className="mb-4 mt-3 bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-3.5 rounded-xl shadow-sm flex items-center justify-around">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-emerald-300"/>
                                  <div>
                                    <span className="text-[11px] block text-emerald-200">இன்று வரை முடிந்த நாட்கள்</span>
                                    <span className="text-xl font-extrabold">{daysInfo.daysPassed} நாட்கள்</span>
                                  </div>
                                </div>
                                <div className="h-8 w-[1px] bg-emerald-500/40"></div>
                                <div>
                                  <span className="text-[11px] block text-emerald-200">பொரிப்பதற்கு மீதமுள்ள நாட்கள்</span>
                                  <span className="text-xl font-extrabold text-emerald-300">{daysInfo.daysRemaining} நாட்கள்</span>
                                </div>
                              </div>

                              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                                <ShieldAlert className="w-4 h-4 text-emerald-600"/> அடைகாக்கும் மைல்கற்கள்:
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {checkpoints.map((mark, idx) => (
                                  <div key={idx} className="p-2 bg-white border border-emerald-200 rounded-lg text-center">
                                    <span className="text-[10px] text-emerald-800 font-bold block">{mark.label}</span>
                                    <span className="text-xs font-bold text-emerald-950">{mark.date}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 italic">அடைகாப்பு தகவல்கள் எதுவும் பதிவு செய்யப்படவில்லை.</p>
                      )}
                    </div>
                  )}

                  {/* Vaccine Notes Section */}
                  <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <h3 className="font-bold text-[3.2vw] sm:text-lg text-emerald-950 flex items-center gap-1.5">
                        <Syringe className="w-5 h-5 text-emerald-600"/> தடுப்பூசி & மருந்து அட்டவணை
                      </h3>
                      <button
                        onClick={() => {
                          setEditingVacId(null);
                          setVacName(""); setVacDate(""); setVacNotes("");
                          setIsVaccineModalOpen(true);
                        }}
                        className="text-[2.8vw] sm:text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition-all font-medium flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5"/> தடுப்பூசி சேர்க்க
                      </button>
                    </div>

                    {selectedBird.vaccinations.length > 0 ? (
                      <div className="border border-emerald-200 rounded-xl overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-[3vw] sm:text-sm">
                          <thead className="bg-emerald-100/70 text-emerald-950 font-bold">
                            <tr>
                              <th className="p-3">தடுப்பூசி / மருந்து</th>
                              <th className="p-3">தேதி</th>
                              <th className="p-3">குறிப்புகள்</th>
                              <th className="p-3 text-right">செயல்கள்</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-100">
                            {selectedBird.vaccinations.map((vac) => (
                              <tr key={vac.id} className="hover:bg-emerald-50/50">
                                <td className="p-3 font-semibold text-gray-800">{vac.name}</td>
                                <td className="p-3 text-gray-600">{formatDateValue(vac.date)}</td>
                                <td className="p-3 text-gray-500">{vac.description || "-"}</td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEditVaccine(vac)}
                                      className="p-1.5 text-emerald-800 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                                    >
                                      <Edit className="w-4 h-4"/>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteVaccine(vac.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                                    >
                                      <Trash2 className="w-4 h-4"/>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">தடுப்பூசி பதிவுகள் எதுவுமில்லை.</p>
                    )}
                  </div>

                  {/* General Notes Section */}
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <h3 className="font-bold text-[3.2vw] sm:text-lg text-emerald-950 flex items-center gap-1.5">
                        <FileText className="w-5 h-5 text-emerald-600"/> பொதுக் குறிப்புகள் (Notes)
                      </h3>
                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setNoteText("");
                          setNoteDate(new Date().toISOString().split("T")[0]);
                          setIsNoteModalOpen(true);
                        }}
                        className="text-[2.8vw] sm:text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition-all font-medium flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5"/> புதிய குறிப்பு சேர்க்க
                      </button>
                    </div>

                    {(selectedBird.notes && selectedBird.notes.length > 0) ? (
                      <div className="space-y-3">
                        {selectedBird.notes.map((note) => (
                          <div key={note.id} className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-emerald-800 block mb-1">{formatDateValue(note.date)}</span>
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleEditNote(note)}
                                className="p-1 text-emerald-800 hover:bg-emerald-100 rounded-md"
                              >
                                <Edit className="w-4 h-4"/>
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded-md"
                              >
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">பொதுக் குறிப்புகள் எதுவும் பதிவு செய்யப்படவில்லை.</p>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 p-[8vw] sm:p-12 text-center text-emerald-900/80 shadow-xl flex flex-col items-center justify-center min-h-[260px] sm:min-h-[350px]">
                <Activity className="w-10 h-10 sm:w-12 sm:h-12 mb-3 text-emerald-500 animate-pulse"/>
                <p className="text-[3.2vw] sm:text-base font-semibold leading-relaxed max-w-sm">
                  விவரங்களைப் பார்க்க இடதுபக்கத்தில் உள்ள கோழி அல்லது குஞ்சைத் தேர்வு செய்யவும்.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FULL EDIT MODAL: NAME, PHOTO, DATE, & SOURCE */}
        {isEditBirdModalOpen && selectedBird && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-emerald-200">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-emerald-950">விவரங்கள் திருத்துதல் (Edit Details)</h3>
                <button onClick={() => setIsEditBirdModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleUpdateBirdDetails} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">கோழியின் பெயர் / Tag No</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">புகைப்படம் மாற்றுதல்</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/50 p-3 rounded-xl cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-emerald-700"/>
                      <span className="text-xs text-emerald-800 font-semibold">புதிய படம் பதிவேற்றவும்</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                    </label>
                    {editPhotoBase64 && (
                      <img src={editPhotoBase64} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-emerald-300" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">தேதி</label>
                    <input
                      type="date"
                      required
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full border rounded-xl p-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">மூலம்</label>
                    <select
                      value={editSource}
                      onChange={(e) => setEditSource(e.target.value as "BORN_HERE" | "PURCHASED")}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white"
                    >
                      <option value="BORN_HERE">பண்ணையில் பொரித்தவை</option>
                      <option value="PURCHASED">வாங்கப்பட்டது</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-800 transition-all">
                  புதுப்பிக்கவும் (Save Changes)
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add or Edit Note */}
        {isNoteModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-emerald-200">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-emerald-950">
                  {editingNoteId ? "குறிப்பினை திருத்துக" : "குறிப்பு சேர்க்க"}
                </h3>
                <button onClick={() => setIsNoteModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleSaveNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">தேதி</label>
                  <input
                    type="date"
                    required
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">குறிப்புகள் (Notes)</label>
                  <textarea
                    required
                    placeholder="எ.கா: முட்டை எண்ணிக்கை, எடை, தீவன விபரம்..."
                    rows={4}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-800 transition-all">
                  {editingNoteId ? "மாற்றத்தைப் புதுப்பி" : "குறிப்பைச் சேமி"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Hen/Chick */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-emerald-200">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-emerald-950">புதிய கோழி / குஞ்சு சேர்க்க</h3>
                <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleAddBird} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">பெயர் / Tag No</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: கொண்டை கோழி (#01)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">புகைப்படம் தேர்வு செய்க</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/50 p-3 rounded-xl cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-emerald-700"/>
                      <span className="text-xs text-emerald-800 font-semibold">படத்தை பதிவேற்றவும்</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="hidden" />
                    </label>
                    {photoBase64 && (
                      <img src={photoBase64} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-emerald-300" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">வகை</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as "HEN" | "CHICK")}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white"
                    >
                      <option value="HEN">தாய்க்கோழி</option>
                      <option value="CHICK">கோழிக்குஞ்சு</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">மூலம்</label>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value as "BORN_HERE" | "PURCHASED")}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white"
                    >
                      <option value="BORN_HERE">பண்ணையில் பொரித்தவை</option>
                      <option value="PURCHASED">வாங்கப்பட்டது</option>
                    </select>
                  </div>
                </div>

                {newType === "CHICK" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">அம்மா கோழி (Amma Koli Name)</label>
                    <select
                      value={selectedMotherForNew}
                      onChange={(e) => setSelectedMotherForNew(e.target.value ? Number(e.target.value) : "")}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white"
                    >
                      <option value="">-- அம்மா கோழியைத் தேர்வு செய்யவும் (Optional) --</option>
                      {birds.filter(b => b.type === "HEN").map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">தேதி</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-800 transition-all">
                  சேமிக்க
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Chicks Hatch Registration */}
        {isChickHatchModalOpen && selectedBird && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-emerald-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-emerald-950">🐤 புதிய குஞ்சுகள் பதிவு</h3>
                  <p className="text-xs text-emerald-800 font-semibold">அம்மா கோழி பெயர்: {selectedBird.name}</p>
                </div>
                <button onClick={() => setIsChickHatchModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              
              <form onSubmit={handleChickHatch} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">எத்தனை குஞ்சுகள் பொரித்தன?</label>
                  <select
                    value={chicksCount}
                    onChange={(e) => handleChicksCountChange(Number(e.target.value))}
                    className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold text-emerald-950"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} குஞ்சுகள்</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    குஞ்சுகளின் பெயர்கள் / Tag Nos
                  </label>
                  {Array.from({ length: chicksCount }).map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`குஞ்சு ${idx + 1} பெயர் (எ.கா: ${selectedBird.name} - குஞ்சு ${idx + 1})`}
                      value={chickNames[idx] || ""}
                      onChange={(e) => handleChickNameChange(idx, e.target.value)}
                      className="w-full border rounded-xl p-2.5 text-sm mb-2 focus:outline-none focus:border-emerald-600"
                    />
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">பொரித்த தேதி</label>
                  <input
                    type="date"
                    value={chickHatchDate}
                    onChange={(e) => setChickHatchDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>

                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-800 transition-all">
                  {chicksCount} குஞ்சு(களை) அம்மா கோழி பெயருடன் சேர்க்கவும்
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add or Edit Incubation */}
        {isIncubationModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-emerald-200">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-emerald-950">
                  {editingIncubationId ? "அடைகாப்பு தேதியை மாற்று" : "முட்டை அடைகாப்பு பதிவு சேர்க்க"}
                </h3>
                <button onClick={() => setIsIncubationModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleSaveIncubation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {editingIncubationId ? "புதிய அடைகாப்பு தேதி" : "முட்டை அடை வைத்த தேதி"}
                  </label>
                  <input
                    type="date"
                    required
                    value={newIncubationDate}
                    onChange={(e) => setNewIncubationDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>
                {newIncubationDate && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-xs text-emerald-900 font-semibold">பொரிக்கும் தேதி (+23 நாட்கள்):</p>
                    <p className="font-extrabold text-emerald-950 text-base">{calculateHatchDate(newIncubationDate)}</p>
                  </div>
                )}
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-800 transition-all">
                  {editingIncubationId ? "தேதியை புதுப்பி" : "பதிவு செய்"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add or Edit Vaccine */}
        {isVaccineModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-emerald-200">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-emerald-950">
                  {editingVacId ? "தடுப்பூசி விபரங்களை மாற்று" : "தடுப்பூசி குறிப்பு சேர்க்க"}
                </h3>
                <button onClick={() => setIsVaccineModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleSaveVaccine} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">தடுப்பூசி / மருந்து பெயர்</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: Lasota F1 / RDVK"
                    value={vacName}
                    onChange={(e) => setVacName(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">கொடுக்கப்பட்ட தேதி</label>
                  <input
                    type="date"
                    required
                    value={vacDate}
                    onChange={(e) => setVacDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">குறிப்புகள்</label>
                  <textarea
                    placeholder="கூடுதல் தகவல்கள்..."
                    rows={3}
                    value={vacNotes}
                    onChange={(e) => setVacNotes(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-800 transition-all">
                  {editingVacId ? "மாற்றங்களைப் புதுப்பி" : "குறிப்பு சேர்க்கவும்"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Remove Bird */}
        {isRemoveModalOpen && selectedBird && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-red-200">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-red-950">{selectedBird.name} - நீக்கம் செய்க</h3>
                <button onClick={() => setIsRemoveModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleRemoveBird} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">காரணம்</label>
                  <select
                    value={removeReason}
                    onChange={(e) => setRemoveReason(e.target.value as "SOLD" | "OTHER")}
                    className="w-full border rounded-xl p-2.5 text-sm bg-white"
                  >
                    <option value="SOLD">விற்பனை செய்யப்பட்டது</option>
                    <option value="OTHER">மற்றவை</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">குறிப்பு</label>
                  <textarea
                    placeholder="கூடுதல் விவரங்கள்..."
                    rows={3}
                    value={removeNotes}
                    onChange={(e) => setRemoveNotes(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-red-600"
                  />
                </div>
                <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-red-700 transition-all">
                  உறுதியாக நீக்குக
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
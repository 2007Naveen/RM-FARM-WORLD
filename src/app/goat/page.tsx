"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, Calendar as CalendarIcon, Syringe, ShieldAlert, 
  Activity, X, Upload, ArrowRightLeft, Trash2, Edit, FileText, Clock, Loader2
} from "lucide-react";
import {
  getGoats,
  addGoat,
  addGoatMating,
  deleteGoatMating,        
  deleteGoatVaccination,   
  deleteGoatNote,          
  addGoatVaccination,
  addGoatNote,
  updateGoatType,
  deleteGoat,
  updateGoatDetails,
} from "@/app/actions/goatActions";

// --- TYPES & INTERFACES ---
type DateValue = string | Date | number | null | undefined;

interface Insemination {
  id: number;
  inseminationDate: DateValue;
  expectedDeliveryDate: DateValue;
}

interface Vaccination {
  id: number;
  name: string;
  date: DateValue;
  description: string | null;
}

interface GeneralNote {
  id: number;
  date: DateValue;
  text: string;
}

interface Goat {
  id: number;
  name: string;
  type: "GOAT" | "KID";
  photoUrl: string | null;
  birthDate: DateValue;
  source: "BORN_HERE" | "PURCHASED";
  motherId?: number;
  motherName?: string;
  inseminations: Insemination[];
  vaccinations: Vaccination[];
  notes: GeneralNote[];
}

// --- MAIN REACT COMPONENT ---
function GoatPage() {
  const [activeTab, setActiveTab] = useState<"GOAT" | "KID">("GOAT");
  const [selectedGoat, setSelectedGoat] = useState<Goat | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditGoatModalOpen, setIsEditGoatModalOpen] = useState(false);
  const [isInseminationModalOpen, setIsInseminationModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isKidBirthModalOpen, setIsKidBirthModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Form States
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"GOAT" | "KID">("GOAT");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newSource, setNewSource] = useState<"BORN_HERE" | "PURCHASED">("BORN_HERE");
  const [selectedMotherForNew, setSelectedMotherForNew] = useState<number | "">("");
  const [photoBase64, setPhotoBase64] = useState<string>("");

  // Edit Goat Form States
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"GOAT" | "KID">("GOAT");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editSource, setEditSource] = useState<"BORN_HERE" | "PURCHASED">("BORN_HERE");
  const [editMotherId, setEditMotherId] = useState<number | "">("");
  const [editPhotoBase64, setEditPhotoBase64] = useState<string>("");

  // Multiple Kids Birth State
  const [kidsCount, setKidsCount] = useState<number>(1);
  const [kidNames, setKidNames] = useState<string[]>([""]);
  const [kidBirthDate, setKidBirthDate] = useState(new Date().toISOString().split("T")[0]);

  const [newInsemDate, setNewInsemDate] = useState("");
  const [editingInsemId, setEditingInsemId] = useState<number | null>(null);

  const [vacName, setVacName] = useState("");
  const [vacDate, setVacDate] = useState("");
  const [vacNotes, setVacNotes] = useState("");
  const [editingVacId, setEditingVacId] = useState<number | null>(null);

  const [noteText, setNoteText] = useState("");
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const [removeReason, setRemoveReason] = useState<"SOLD" | "OTHER">("SOLD");
  const [removeNotes, setRemoveNotes] = useState("");

  const [goats, setGoats] = useState<Goat[]>([]);

  useEffect(() => {
    loadGoats();
  }, []);

  async function loadGoats() {
    setIsLoading(true);
    try {
      const rawData = (await getGoats()) as unknown as Array<{
        id: number;
        name: string;
        type: Goat["type"];
        photoUrl: string | null;
        birthDate: DateValue;
        source: Goat["source"];
        motherId: number | null;
        matingRecords?: Array<{
          id: number;
          matingDate: DateValue;
          expectedDeliveryDate: DateValue;
        }>;
        vaccinations?: Vaccination[];
        notes?: GeneralNote[];
        mother?: { name: string } | null;
      }>;
      const data: Goat[] = (rawData || []).map((goat) => ({
        ...goat,
        photoUrl: goat.photoUrl,
        motherId: goat.motherId || undefined,
        motherName: goat.mother?.name,
        inseminations: (goat.matingRecords || []).map((record) => ({
          id: record.id,
          inseminationDate: record.matingDate,
          expectedDeliveryDate: record.expectedDeliveryDate,
        })),
        vaccinations: goat.vaccinations || [],
        notes: goat.notes || [],
      }));

      setGoats(data);
      setSelectedGoat((previous) => {
        if (!previous) return null;
        return data.find((goat) => goat.id === previous.id) || null;
      });
    } catch (error) {
      console.error("Error loading goats:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Safe Date parsing
  function parseLocalDate(dateValue: string | Date | number | null | undefined) {
    if (!dateValue) return new Date();

    if (dateValue instanceof Date) {
      return new Date(dateValue.getTime());
    }

    if (typeof dateValue === "number") {
      return new Date(dateValue);
    }

    const datePart = dateValue.slice(0, 10);
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
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getInseminationDaysInfo(insemDateStr: string | Date | number | null | undefined) {
    if (!insemDateStr) return { daysPassed: 0, daysRemaining: 150 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = parseLocalDate(insemDateStr);
    start.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = 150 - daysPassed;

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

  function calculateDeliveryDate(dateStr: string | Date | number | null | undefined): string {
    if (!dateStr) return "";
    const date = parseLocalDate(dateStr);
    date.setDate(date.getDate() + 150);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getMonthlyRedMarks(inseminationDateStr: string | Date | number | null | undefined) {
    if (!inseminationDateStr) return [];
    const marks = [];
    for (let i = 1; i <= 5; i++) {
      const nextMonth = parseLocalDate(inseminationDateStr);
      nextMonth.setDate(nextMonth.getDate() + i * 30);
      const yyyy = nextMonth.getFullYear();
      const mm = String(nextMonth.getMonth() + 1).padStart(2, "0");
      const dd = String(nextMonth.getDate()).padStart(2, "0");
      marks.push({
        month: i,
        date: `${yyyy}-${mm}-${dd}`,
      });
    }
    return marks;
  }

  const handleConvertToGoat = async (goatId: number) => {
    try {
      await updateGoatType(goatId, "GOAT");
      await loadGoats();
    } catch (error) {
      console.error("Error converting kid to goat:", error);
    }
  };

  const handleOpenEditModal = (goat: Goat) => {
    setEditName(goat.name);
    setEditType(goat.type);
    setEditBirthDate(formatDateValue(goat.birthDate));
    setEditSource(goat.source);
    setEditMotherId(goat.motherId || "");
    setEditPhotoBase64(goat.photoUrl || "");
    setIsEditGoatModalOpen(true);
  };

  const handleUpdateGoat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoat || !editName) return;
    try {
      await updateGoatDetails(selectedGoat.id, {
        name: editName,
        type: editType,
        birthDate: editBirthDate,
        source: editSource,
        photoUrl: editPhotoBase64 ? editPhotoBase64 : undefined,
        motherId: editType === "KID" && editMotherId ? Number(editMotherId) : undefined,
      });
      setIsEditGoatModalOpen(false);
      await loadGoats();
    } catch (error) {
      console.error("Error updating goat details:", error);
    }
  };

  const handleRemoveGoat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoat) return;
    try {
      await deleteGoat(selectedGoat.id);
      setSelectedGoat(null);
      setIsRemoveModalOpen(false);
      setRemoveNotes("");
      await loadGoats();
    } catch (error) {
      console.error("Error removing goat:", error);
    }
  };

  const handleAddGoat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await addGoat({
        name: newName,
        type: newType,
        birthDate: newBirthDate || new Date().toISOString().split("T")[0],
        source: newSource,
        photoUrl: photoBase64 || undefined,
        motherId: newType === "KID" && selectedMotherForNew ? Number(selectedMotherForNew) : undefined,
      });
      setNewName("");
      setPhotoBase64("");
      setNewBirthDate("");
      setSelectedMotherForNew("");
      setIsAddModalOpen(false);
      await loadGoats();
    } catch (error) {
      console.error("Error adding goat:", error);
    }
  };

  const handleKidBirth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoat) return;

    try {
      await Promise.all(
        Array.from({ length: kidsCount }, (_, index) =>
          addGoat({
            name: kidNames[index]?.trim() || `${selectedGoat.name} - குட்டி ${index + 1}`,
            type: "KID",
            birthDate: kidBirthDate,
            source: "BORN_HERE",
            motherId: selectedGoat.id,
          })
        )
      );
      setKidNames([""]);
      setKidsCount(1);
      setKidBirthDate(new Date().toISOString().split("T")[0]);
      setIsKidBirthModalOpen(false);
      await loadGoats();
    } catch (error) {
      console.error("Error adding kids:", error);
    }
  };

  const handleKidsCountChange = (count: number) => {
    setKidsCount(count);
    setKidNames((prev) => {
      const updated = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) updated.push("");
      } else {
        updated.length = count;
      }
      return updated;
    });
  };

  const handleKidNameChange = (index: number, val: string) => {
    const updated = [...kidNames];
    updated[index] = val;
    setKidNames(updated);
  };

  const handleSaveInsemination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsemDate || !selectedGoat) return;
    try {
      await addGoatMating(selectedGoat.id, newInsemDate);
      setNewInsemDate("");
      setEditingInsemId(null);
      setIsInseminationModalOpen(false);
      await loadGoats();
    } catch (error) {
      console.error("Error saving mating record:", error);
    }
  };

  const handleDeleteInsemination = async (insemId: number) => {
    if (!selectedGoat) return;
    try {
      await deleteGoatMating(insemId);
      setGoats((prevGoats) =>
        prevGoats.map((goat) =>
          goat.id === selectedGoat.id
            ? { ...goat, inseminations: goat.inseminations.filter((i) => i.id !== insemId) }
            : goat
        )
      );
      setSelectedGoat((prev) =>
        prev ? { ...prev, inseminations: prev.inseminations.filter((i) => i.id !== insemId) } : null
      );
    } catch (error) {
      console.error("Error deleting insemination:", error);
    }
  };

  const handleEditInsemination = (insem: Insemination) => {
    setEditingInsemId(insem.id);
    setNewInsemDate(formatDateValue(insem.inseminationDate));
    setIsInseminationModalOpen(true);
  };

  const handleSaveVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName || !vacDate || !selectedGoat) return;
    try {
      await addGoatVaccination(selectedGoat.id, vacName, vacDate, vacNotes);
      setVacName(""); setVacDate(""); setVacNotes(""); setEditingVacId(null);
      setIsVaccineModalOpen(false);
      await loadGoats();
    } catch (error) {
      console.error("Error saving goat vaccination:", error);
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
    if (!selectedGoat) return;
    try {
      await deleteGoatVaccination(vacId);
      setGoats((prevGoats) =>
        prevGoats.map((goat) =>
          goat.id === selectedGoat.id
            ? { ...goat, vaccinations: goat.vaccinations.filter((v) => v.id !== vacId) }
            : goat
        )
      );
      setSelectedGoat((prev) =>
        prev ? { ...prev, vaccinations: prev.vaccinations.filter((v) => v.id !== vacId) } : null
      );
    } catch (error) {
      console.error("Error deleting vaccine:", error);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText || !selectedGoat) return;
    try {
      await addGoatNote(selectedGoat.id, noteDate, noteText);
      setNoteText("");
      setNoteDate(new Date().toISOString().split("T")[0]);
      setEditingNoteId(null);
      setIsNoteModalOpen(false);
      await loadGoats();
    } catch (error) {
      console.error("Error saving goat note:", error);
    }
  };

  const handleEditNote = (note: GeneralNote) => {
    setEditingNoteId(note.id);
    setNoteDate(formatDateValue(note.date));
    setNoteText(note.text);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!selectedGoat) return;
    try {
      await deleteGoatNote(noteId);
      setGoats((prevGoats) =>
        prevGoats.map((goat) =>
          goat.id === selectedGoat.id
            ? { ...goat, notes: goat.notes.filter((n) => n.id !== noteId) }
            : goat
        )
      );
      setSelectedGoat((prev) =>
        prev ? { ...prev, notes: prev.notes.filter((n) => n.id !== noteId) } : null
      );
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const filteredGoats = goats.filter((item) => item.type === activeTab);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed font-sans relative w-full overflow-x-hidden"
      style={{ backgroundImage: "url('/goats-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] pointer-events-none" />

      <div className="relative z-10 min-h-screen p-[3vw] sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto bg-[#064e3b] text-white p-[4vw] sm:p-6 rounded-[3vw] sm:rounded-2xl shadow-lg mb-[3vw] sm:mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[3vw] sm:gap-4">
          <div>
            <h1 className="text-[5vw] sm:text-2xl md:text-3xl font-bold flex items-center gap-[2vw] sm:gap-2">
              <span className="text-emerald-400 shrink-0">♥</span> <span>வெள்ளாடுகள் & குட்டிகள் மேலாண்மை</span>
            </h1>
            <p className="text-[2.6vw] sm:text-sm mt-1 leading-relaxed text-emerald-100/80">
              சினை ஓடி கணக்கு (150 நாட்கள்), தடுப்பூசி & ஆட்டின் பொதுக் குறிப்புகள்
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-emerald-300" />}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-emerald-300 border border-emerald-500/30 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[2.7vw] sm:text-sm font-medium transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5"/> புதிய ஆடு / குட்டி சேர்க்க
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto bg-gray-200/80 p-1.5 rounded-[2.5vw] sm:rounded-2xl mb-[3vw] sm:mb-6 flex gap-[1.5vw] sm:gap-2">
          <button
            onClick={() => { setActiveTab("GOAT"); setSelectedGoat(null); }}
            className={`flex-1 min-w-0 py-2 sm:py-3 px-1.5 sm:px-4 rounded-xl font-medium text-[2.7vw] sm:text-sm leading-tight transition-all text-center ${
              activeTab === "GOAT"
                ? "bg-[#064e3b] text-white shadow-md"
                : "text-gray-700 hover:text-black"
            }`}
          >
            ஆடுகள் ({goats.filter((c) => c.type === "GOAT").length})
          </button>
          <button
            onClick={() => { setActiveTab("KID"); setSelectedGoat(null); }}
            className={`flex-1 min-w-0 py-2 sm:py-3 px-1.5 sm:px-4 rounded-xl font-medium text-[2.7vw] sm:text-sm leading-tight transition-all text-center ${
              activeTab === "KID"
                ? "bg-[#064e3b] text-white shadow-md"
                : "text-gray-700 hover:text-black"
            }`}
          >
            குட்டிகள் ({goats.filter((c) => c.type === "KID").length})
          </button>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-[3vw] sm:gap-8">
          {/* Left Side: Goat List */}
          <div className="lg:col-span-1 space-y-[2vw] sm:space-y-4">
            {filteredGoats.length > 0 ? (
              filteredGoats.map((goat) => (
                <div
                  key={goat.id}
                  onClick={() => setSelectedGoat(goat)}
                  className={`p-[3vw] sm:p-4 rounded-[2.5vw] sm:rounded-2xl bg-white/95 backdrop-blur border-2 cursor-pointer transition-all shadow-sm hover:shadow-md flex items-center gap-[3vw] sm:gap-4 ${
                    selectedGoat?.id === goat.id ? "border-emerald-600 ring-2 ring-emerald-200" : "border-gray-100 hover:border-emerald-300"
                  }`}
                >
                  {goat.photoUrl ? (
                    <img
                      src={goat.photoUrl}
                      alt={goat.name}
                      className="w-[16vw] h-[16vw] sm:w-20 sm:h-20 rounded-[2vw] sm:rounded-xl object-cover border border-emerald-100 shrink-0"
                    />
                  ) : (
                    <div className="w-[16vw] h-[16vw] sm:w-20 sm:h-20 rounded-[2vw] sm:rounded-xl bg-emerald-100 border border-emerald-200 shrink-0" aria-hidden="true" />
                  )}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="font-bold text-[3.2vw] sm:text-lg text-emerald-950 truncate">{goat.name}</h3>
                    <p className="text-[2.6vw] sm:text-xs text-gray-500 mt-1">பிறந்த தேதி: {formatDateValue(goat.birthDate)}</p>
                    
                    {goat.type === "KID" && goat.motherName && (
                      <p className="text-[2.6vw] sm:text-xs text-emerald-700 font-semibold mt-1 truncate">
                        தாயின் பெயர்: {goat.motherName}
                      </p>
                    )}

                    <span className="inline-block mt-1.5 text-[2.4vw] sm:text-xs bg-emerald-100 text-emerald-800 px-1.5 sm:px-2 py-0.5 rounded-md font-medium">
                      {goat.source === "BORN_HERE" ? "பண்ணையில் பிறந்தவை" : "வாங்கப்பட்டது"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white/90 backdrop-blur rounded-2xl border border-gray-200 text-gray-400">
                பதிவுகள் எதுவும் இல்லை. புதிய ஆடு/குட்டி சேர்க்கவும்.
              </div>
            )}
          </div>

          {/* Right Side: Details View */}
          <div className="lg:col-span-2">
            {selectedGoat ? (
              <div className="bg-white/95 backdrop-blur rounded-2xl border border-emerald-100 p-[3vw] sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-[2vw] sm:gap-3">
                  <div>
                    <h2 className="text-[4vw] sm:text-2xl font-bold text-emerald-900 truncate">{selectedGoat.name}</h2>
                    <span className="text-xs text-gray-500">விவரங்கள் மற்றும் அட்டவணை</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      onClick={() => handleOpenEditModal(selectedGoat)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded-lg text-[2.5vw] sm:text-xs font-semibold transition-all shadow-sm"
                    >
                      <Edit className="w-4 h-4"/> திருத்து (Edit)
                    </button>

                    {selectedGoat.type === "KID" && (
                      <button
                        onClick={() => handleConvertToGoat(selectedGoat.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-lg text-[2.5vw] sm:text-xs font-semibold transition-all"
                      >
                        <ArrowRightLeft className="w-4 h-4"/> பெரிய ஆடாக மாற்று
                      </button>
                    )}

                    <button
                      onClick={() => setIsRemoveModalOpen(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2 py-1.5 rounded-lg text-[2.5vw] sm:text-xs font-semibold transition-all"
                    >
                      <Trash2 className="w-4 h-4"/> பட்டியலிலிருந்து நீக்கு
                    </button>
                  </div>
                </div>

                <div className="p-2">
                  <div className="flex flex-row gap-3 sm:gap-6 items-center bg-emerald-50/50 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
                    {selectedGoat.photoUrl ? (
                      <img src={selectedGoat.photoUrl} alt={selectedGoat.name} className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg bg-emerald-100 shrink-0" aria-hidden="true" />
                    )}
                    <div>
                      <p className="text-[2.8vw] sm:text-sm font-semibold text-gray-700">வகை: <span className="text-emerald-900">{selectedGoat.type === "GOAT" ? "பெரிய ஆடு" : "குட்டி"}</span></p>
                      <p className="text-[2.8vw] sm:text-sm font-semibold text-gray-700 mt-1">பிறந்த தேதி: <span className="text-emerald-900">{formatDateValue(selectedGoat.birthDate)}</span></p>
                      {selectedGoat.motherName && (
                        <p className="text-[2.8vw] sm:text-sm font-semibold text-emerald-800 mt-1 truncate">தாய் ஆட்டின் பெயர்: <span className="font-bold">{selectedGoat.motherName}</span></p>
                      )}
                      <p className="text-[2.8vw] sm:text-sm font-semibold text-gray-700 mt-1">மூலம்: <span className="text-emerald-900">{selectedGoat.source === "BORN_HERE" ? "பண்ணையில் பிறந்தவை" : "வாங்கப்பட்ட ஆடு"}</span></p>
                    </div>
                  </div>

                  {/* Insemination Section */}
                  {selectedGoat.type === "GOAT" && (
                    <div className="mb-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                        <h3 className="font-bold text-[3.2vw] sm:text-lg text-emerald-900 flex items-center gap-1.5">
                          <CalendarIcon className="w-5 h-5 text-emerald-600"/> சினை/இணைப்பு விவரங்கள் (+150 நாட்கள்)
                        </h3>
                        <button
                          onClick={() => {
                            setEditingInsemId(null);
                            setNewInsemDate("");
                            setIsInseminationModalOpen(true);
                          }}
                          className="text-[2.5vw] sm:text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-md hover:bg-emerald-700 transition-all font-medium shrink-0"
                        >
                          + சினை பதிவு சேர்க்க
                        </button>
                      </div>

                      {selectedGoat.inseminations.length > 0 ? (
                        selectedGoat.inseminations.map((insem) => {
                          const redMarks = getMonthlyRedMarks(insem.inseminationDate);
                          const daysInfo = getInseminationDaysInfo(insem.inseminationDate);
                          return (
                            <div key={insem.id} className="border border-emerald-200 rounded-xl p-3 sm:p-4 bg-emerald-50/20 mb-3 sm:mb-4 relative">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2vw] sm:gap-4 flex-1 w-full">
                                  <div className="bg-white p-3 rounded-lg border">
                                    <p className="text-[2.5vw] sm:text-xs text-gray-500">சினை ஊசி/இணைப்பு தேதி</p>
                                    <p className="font-bold text-[3vw] sm:text-base text-emerald-900">{formatDateValue(insem.inseminationDate)}</p>
                                  </div>
                                  <div className="bg-emerald-100 p-3 rounded-lg border border-emerald-300">
                                    <p className="text-[2.5vw] sm:text-xs text-emerald-800 font-semibold">எதிர்பார்க்கப்படும் ஈனும் தேதி (+150 நாட்கள்)</p>
                                    <p className="font-extrabold text-[3.5vw] sm:text-lg text-emerald-950">{formatDateValue(insem.expectedDeliveryDate)}</p>
                                  </div>
                                </div>
                                
                                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleEditInsemination(insem)}
                                    className="flex-1 sm:flex-none text-[2.5vw] sm:text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white border border-emerald-200 p-1.5 rounded-lg justify-center"
                                  >
                                    <Edit className="w-3.5 h-3.5"/> எடிட்
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteInsemination(insem.id)}
                                    className="flex-1 sm:flex-none text-[2.5vw] sm:text-xs text-red-600 hover:text-red-800 flex items-center gap-1 bg-white border border-red-200 p-1.5 rounded-lg justify-center"
                                  >
                                    <Trash2 className="w-3.5 h-3.5"/> நீக்கு
                                  </button>

                                  <button
                                    onClick={() => setIsKidBirthModalOpen(true)}
                                    className="flex-1 sm:flex-none text-[2.5vw] sm:text-xs bg-emerald-700 text-white px-2 py-1.5 rounded-lg hover:bg-emerald-800 transition-all font-semibold"
                                  >
                                    🐐 குட்டி(கள்) பிறந்தது
                                  </button>
                                </div>
                              </div>

                              {/* Days Counter Box */}
                              <div className="my-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-2.5 sm:p-3.5 rounded-xl shadow-sm flex items-center justify-around gap-1 text-center">
                                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                                  <Clock className="w-5 h-5 text-emerald-200"/>
                                  <div>
                                    <span className="text-[2.2vw] sm:text-[11px] block text-emerald-100">இன்று வரை முடிந்த நாட்கள்</span>
                                    <span className="text-[3.5vw] sm:text-xl font-extrabold">{daysInfo.daysPassed} நாட்கள்</span>
                                  </div>
                                </div>
                                <div className="h-8 w-[1px] bg-emerald-400/40"></div>
                                <div>
                                    <span className="text-[2.2vw] sm:text-[11px] block text-emerald-100">ஈனுவதற்கு மீதமுள்ள நாட்கள்</span>
                                    <span className="text-[3.5vw] sm:text-xl font-extrabold text-amber-300">{daysInfo.daysRemaining} நாட்கள்</span>
                                </div>
                              </div>

                              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                                <ShieldAlert className="w-4 h-4 text-red-500"/> மாதந்தோறும் சினை நிறைவு தேதிகள் (5 மாதங்கள்):
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {redMarks.map((mark) => (
                                  <div key={mark.month} className="p-2 bg-red-50 border border-red-200 rounded-lg text-center">
                                    <span className="text-[10px] text-red-600 font-bold block">{mark.month}-ஆம் மாதம்</span>
                                    <span className="text-xs font-bold text-red-900">{mark.date}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 italic">சினை தகவல்கள் எதுவும் பதிவு செய்யப்படவில்லை.</p>
                      )}
                    </div>
                  )}

                  {/* Vaccines Section */}
                  <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <h3 className="font-bold text-[3.2vw] sm:text-lg text-emerald-900 flex items-center gap-1.5">
                        <Syringe className="w-5 h-5 text-emerald-600"/> தடுப்பூசி அட்டவணை (PPR / ET / FMD)
                      </h3>
                      <button
                        onClick={() => {
                          setEditingVacId(null);
                          setVacName(""); setVacDate(""); setVacNotes("");
                          setIsVaccineModalOpen(true);
                        }}
                        className="text-[2.5vw] sm:text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-md hover:bg-emerald-700 transition-all font-medium flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5"/> தடுப்பூசி சேர்க்க
                      </button>
                    </div>

                    {selectedGoat.vaccinations.length > 0 ? (
                      <div className="border rounded-xl overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-[3vw] sm:text-sm">
                          <thead className="bg-emerald-100/60 text-emerald-900 font-bold">
                            <tr>
                              <th className="p-3">தடுப்பூசி பெயர்</th>
                              <th className="p-3">தேதி</th>
                              <th className="p-3">குறிப்புகள்</th>
                              <th className="p-3 text-right">செயல்கள்</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {selectedGoat.vaccinations.map((vac) => (
                              <tr key={vac.id} className="hover:bg-gray-50/50">
                                <td className="p-3 font-semibold text-gray-800">{vac.name}</td>
                                <td className="p-3 text-gray-600">{formatDateValue(vac.date)}</td>
                                <td className="p-3 text-gray-500">{vac.description || "-"}</td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEditVaccine(vac)}
                                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200"
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

                  {/* Notes Section */}
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <h3 className="font-bold text-[3.2vw] sm:text-lg text-emerald-900 flex items-center gap-1.5">
                        <FileText className="w-5 h-5 text-emerald-600"/> பொதுக் குறிப்புகள் (Notes)
                      </h3>
                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setNoteText("");
                          setNoteDate(new Date().toISOString().split("T")[0]);
                          setIsNoteModalOpen(true);
                        }}
                        className="text-[2.5vw] sm:text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-md hover:bg-emerald-700 transition-all font-medium flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5"/> புதிய குறிப்பு சேர்க்க
                      </button>
                    </div>

                    {(selectedGoat.notes && selectedGoat.notes.length > 0) ? (
                      <div className="space-y-3">
                        {selectedGoat.notes.map((note) => (
                          <div key={note.id} className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-amber-800 block mb-1">{formatDateValue(note.date)}</span>
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleEditNote(note)}
                                className="p-1 text-emerald-700 hover:bg-emerald-100/60 rounded-md"
                              >
                                <Edit className="w-4 h-4"/>
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-1 text-red-600 hover:bg-red-100/60 rounded-md"
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
              <div className="bg-white/90 backdrop-blur rounded-2xl border-2 border-dashed border-gray-200 p-[8vw] sm:p-12 text-center text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
                <p className="font-medium">விவரங்களைப் பார்க்க இடதுபக்கத்தில் உள்ள ஆடு அல்லது குட்டியைத் தேர்வு செய்யவும்.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Edit Goat Details */}
        {isEditGoatModalOpen && selectedGoat && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-emerald-950">ஆட்டின் விவரங்களை திருத்து</h3>
                <button onClick={() => setIsEditGoatModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleUpdateGoat} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">பெயர் / Tag No</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">புகைப்படம் மாற்று</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/50 p-3 rounded-xl cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-emerald-700"/>
                      <span className="text-xs text-emerald-800 font-semibold">புதிய படம் பதிவேற்ற</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                    </label>
                    {editPhotoBase64 && (
                      <img src={editPhotoBase64} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-emerald-300" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">வகை</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as "GOAT" | "KID")}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white"
                    >
                      <option value="GOAT">பெரிய ஆடு</option>
                      <option value="KID">குட்டி</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">மூலம்</label>
                    <select
                      value={editSource}
                      onChange={(e) => setEditSource(e.target.value as "BORN_HERE" | "PURCHASED")}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white"
                    >
                      <option value="BORN_HERE">பண்ணையில் பிறந்தவை</option>
                      <option value="PURCHASED">வாங்கப்பட்டது</option>
                    </select>
                  </div>
                </div>

                {editType === "KID" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">தாய் ஆடு (Mother Goat)</label>
                    <select
                      value={editMotherId}
                      onChange={(e) => setEditMotherId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white"
                    >
                      <option value="">-- தாய் ஆட்டை தேர்வு செய்யவும் (Optional) --</option>
                      {goats.filter(g => g.type === "GOAT" && g.id !== selectedGoat.id).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">பிறந்த தேதி</label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-800 transition-all">
                  மாற்றங்களை சேமிக்க
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Insemination */}
        {isInseminationModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-emerald-950">
                  {editingInsemId ? "சினை தேதியை மாற்று" : "சினை / இணைப்பு பதிவு சேர்க்க"}
                </h3>
                <button onClick={() => setIsInseminationModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleSaveInsemination} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {editingInsemId ? "புதிய சினை/இணைப்பு தேதி" : "சினை/இணைப்பு போட்ட தேதி"}
                  </label>
                  <input
                    type="date"
                    required
                    value={newInsemDate}
                    onChange={(e) => setNewInsemDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>
                {newInsemDate && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-xs text-emerald-800 font-semibold">எதிர்பார்க்கப்படும் ஈனும் தேதி (+150 நாட்கள்):</p>
                    <p className="font-extrabold text-emerald-950 text-base">{calculateDeliveryDate(newInsemDate)}</p>
                  </div>
                )}
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-800 transition-all">
                  {editingInsemId ? "தேதியை புதுப்பி" : "பதிவு செய்"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Note */}
        {isNoteModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
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
                    placeholder="எ.கா: எடை விவரம், தீவன அளவு..."
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

        {/* Modal: Add Goat */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-emerald-950">புதிய ஆடு / குட்டி சேர்க்க</h3>
                <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleAddGoat} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">பெயர் / Tag No</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: செம்பட்டை (#01)"
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
                      onChange={(e) => setNewType(e.target.value as "GOAT" | "KID")}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white"
                    >
                      <option value="GOAT">பெரிய ஆடு</option>
                      <option value="KID">குட்டி</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">மூலம்</label>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value as "BORN_HERE" | "PURCHASED")}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white"
                    >
                      <option value="BORN_HERE">பண்ணையில் பிறந்தவை</option>
                      <option value="PURCHASED">வாங்கப்பட்டது</option>
                    </select>
                  </div>
                </div>

                {newType === "KID" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">தாய் ஆடு (Mother Goat)</label>
                    <select
                      value={selectedMotherForNew}
                      onChange={(e) => setSelectedMotherForNew(e.target.value ? Number(e.target.value) : "")}
                      className="w-full border rounded-xl p-2.5 text-sm bg-white"
                    >
                      <option value="">-- தாய் ஆட்டை தேர்வு செய்யவும் (Optional) --</option>
                      {goats.filter(g => g.type === "GOAT").map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">பிறந்த தேதி</label>
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

        {/* Modal: Kid Birth */}
        {isKidBirthModalOpen && selectedGoat && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-emerald-200">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <div>
                  <b><h3 className="text-lg font-bold text-emerald-950">🐐 புதிய குட்டிகள் பதிவு</h3></b>
                  <p className="text-xs text-emerald-700 font-medium">தாய்: {selectedGoat.name}</p>
                </div>
                <button onClick={() => setIsKidBirthModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              
              <form onSubmit={handleKidBirth} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">எத்தனை குட்டிகள் பிறந்தன?</label>
                  <select
                    value={kidsCount}
                    onChange={(e) => handleKidsCountChange(Number(e.target.value))}
                    className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold text-emerald-900"
                  >
                    <option value={1}>1 குட்டி (Single)</option>
                    <option value={2}>2 குட்டிகள் (Twins)</option>
                    <option value={3}>3 குட்டிகள் (Triplets)</option>
                    <option value={4}>4 குட்டிகள் (Quadruplets)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    குட்டிகளின் பெயர்கள் / Tag Nos
                  </label>
                  {Array.from({ length: kidsCount }).map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`குட்டி ${idx + 1} பெயர்`}
                      value={kidNames[idx] || ""}
                      onChange={(e) => handleKidNameChange(idx, e.target.value)}
                      className="w-full border rounded-xl p-2.5 text-sm mb-2 focus:outline-none focus:border-emerald-600"
                    />
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">பிறந்த தேதி</label>
                  <input
                    type="date"
                    value={kidBirthDate}
                    onChange={(e) => setKidBirthDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm"
                  />
                </div>

                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-800 transition-all">
                  {kidsCount} குட்டி(களை) பட்டியலில் சேர்க்கவும்
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Vaccine */}
        {isVaccineModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-emerald-950">
                  {editingVacId ? "தடுப்பூசி விபரங்களை மாற்று" : "தடுப்பூசி குறிப்பு சேர்க்க"}
                </h3>
                <button onClick={() => setIsVaccineModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleSaveVaccine} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">தடுப்பூசி பெயர்</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: PPR / ET தடுப்பூசி"
                    value={vacName}
                    onChange={(e) => setVacName(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">போடப்பட்ட தேதி</label>
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

        {/* Modal: Remove Goat */}
        {isRemoveModalOpen && selectedGoat && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-bold text-red-950">{selectedGoat.name} - நீக்கம் செய்க</h3>
                <button onClick={() => setIsRemoveModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              <form onSubmit={handleRemoveGoat} className="space-y-4">
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

export default GoatPage;
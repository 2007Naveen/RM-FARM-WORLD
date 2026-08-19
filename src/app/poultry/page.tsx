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
} from "@/app/actions/poultryActions";

// --- TYPES & INTERFACES ---
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

// --- MAIN REACT COMPONENT ---
function PoultryPage() {
  const [activeTab, setActiveTab] = useState<"HEN" | "CHICK">("HEN");
  const [selectedBird, setSelectedBird] = useState<Poultry | null>(null);
  
  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isIncubationModalOpen, setIsIncubationModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isChickHatchModalOpen, setIsChickHatchModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Form States
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"HEN" | "CHICK">("HEN");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newSource, setNewSource] = useState<"BORN_HERE" | "PURCHASED">("BORN_HERE");
  const [selectedMotherForNew, setSelectedMotherForNew] = useState<number | "">("");
  const [photoBase64, setPhotoBase64] = useState<string>("");

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
      const rawData = (await getHens()) as unknown as Array<{
        id: number; name: string; type: Poultry["type"]; photoUrl: string | null;
        birthDate: Poultry["birthDate"]; source: Poultry["source"]; motherId: number | null;
        incubations?: EggIncubation[]; vaccinations?: Vaccination[]; notes?: GeneralNote[];
        mother?: { name: string } | null;
      }>;
      const data: Poultry[] = (rawData || []).map((bird) => ({
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
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  // Calculate Elapsed and Remaining Days (Poultry incubation is 23 days)
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

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Poultry incubation period = 23 days
  function calculateHatchDate(dateStr: string | Date | number | null | undefined): string {
    if (!dateStr) return "";
    const date = parseLocalDate(dateStr);
    date.setDate(date.getDate() + 23);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Weekly milestone checkpoints during incubation
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

  // Multiple Chicks Hatch Logic Handler
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

  const handleDeleteVaccine = (vacId: number) => {
    if (!selectedBird) return;
    const updatedVaccinations = selectedBird.vaccinations.filter((vac) => vac.id !== vacId);
    const updatedBirds = birds.map((c) => {
      if (c.id === selectedBird.id) return { ...c, vaccinations: updatedVaccinations };
      return c;
    });
    setBirds(updatedBirds);
    setSelectedBird({ ...selectedBird, vaccinations: updatedVaccinations });
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

  const handleDeleteNote = (noteId: number) => {
    if (!selectedBird) return;
    const updatedNotes = (selectedBird.notes || []).filter((n) => n.id !== noteId);
    const updatedBirds = birds.map((c) => {
      if (c.id === selectedBird.id) return { ...c, notes: updatedNotes };
      return c;
    });
    setBirds(updatedBirds);
    setSelectedBird({ ...selectedBird, notes: updatedNotes });
  };

  const filteredBirds = birds.filter((item) => item.type === activeTab);

  return (
    <div className="min-h-screen bg-amber-50/40 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 flex items-center gap-2">
            <Heart className="w-8 h-8 text-amber-600 fill-amber-600"/> கோழிகள் மேலாண்மை
          </h1>
          <p className="text-amber-700 text-sm mt-1">
            அடைகாத்தல் கணக்கு (23 நாட்கள்), தடுப்பூசி & கோழிக்குஞ்சுகள் (Amma Koli Name) பதிவு
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-all"
        >
          <Plus className="w-5 h-5"/> புதிய கோழி / குஞ்சு சேர்க்க
        </button>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex border-b border-amber-200">
        <button
          onClick={() => { setActiveTab("HEN"); setSelectedBird(null); }}
          className={`pb-3 px-6 font-bold text-lg transition-all ${
            activeTab === "HEN" ? "border-b-4 border-amber-600 text-amber-800" : "text-gray-500 hover:text-amber-700"
          }`}
        >
          தாய்க்கோழிகள் ({birds.filter((c) => c.type === "HEN").length})
        </button>
        <button
          onClick={() => { setActiveTab("CHICK"); setSelectedBird(null); }}
          className={`pb-3 px-6 font-bold text-lg transition-all ${
            activeTab === "CHICK" ? "border-b-4 border-amber-600 text-amber-800" : "text-gray-500 hover:text-amber-700"
          }`}
        >
          கோழிக்குஞ்சுகள் ({birds.filter((c) => c.type === "CHICK").length})
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Bird List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredBirds.length > 0 ? (
            filteredBirds.map((bird) => (
              <div
                key={bird.id}
                onClick={() => setSelectedBird(bird)}
                className={`p-4 rounded-2xl bg-white border-2 cursor-pointer transition-all shadow-sm hover:shadow-md flex items-center gap-4 ${
                  selectedBird?.id === bird.id ? "border-amber-600 ring-2 ring-amber-200" : "border-gray-100 hover:border-amber-300"
                }`}
              >
                {bird.photoUrl ? (
                  <img
                    src={bird.photoUrl}
                    alt={bird.name}
                    className="w-20 h-20 rounded-xl object-cover border border-amber-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-amber-100 border border-amber-200" aria-hidden="true" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-amber-950">{bird.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">பொரித்த/வாங்கிய தேதி: {formatDateValue(bird.birthDate)}</p>
                  
                  {bird.type === "CHICK" && bird.motherName && (
                    <p className="text-xs text-amber-800 font-semibold mt-1">
                      அம்மா கோழி பெயர்: {bird.motherName}
                    </p>
                  )}

                  <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-medium">
                    {bird.source === "BORN_HERE" ? "பண்ணையில் பொரித்தவை" : "வாங்கப்பட்டது"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
              பதிவுகள் எதுவும் இல்லை. புதிய கோழி/குஞ்சு சேர்க்கவும்.
            </div>
          )}
        </div>

        {/* Right Side: Details View */}
        <div className="lg:col-span-2">
          {selectedBird ? (
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm">
              <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-6 gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">{selectedBird.name}</h2>
                  <span className="text-xs text-gray-500">விவரங்கள் மற்றும் அடைகாப்பு அட்டவணை</span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedBird.type === "CHICK" && (
                    <button
                      onClick={() => handleConvertToHen(selectedBird.id)}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <ArrowRightLeft className="w-4 h-4"/> பெரிய கோழியாக மாற்று
                    </button>
                  )}

                  <button
                    onClick={() => setIsRemoveModalOpen(true)}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Trash2 className="w-4 h-4"/> பட்டியலிலிருந்து நீக்கு
                  </button>
                </div>
              </div>

              <div className="p-2">
                <div className="flex gap-6 items-center bg-amber-50/50 p-4 rounded-xl mb-6">
                  {selectedBird.photoUrl ? (
                    <img src={selectedBird.photoUrl} alt={selectedBird.name} className="w-24 h-24 rounded-lg object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-amber-100" aria-hidden="true" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-700">வகை: <span className="text-amber-900">{selectedBird.type === "HEN" ? "தாய்க்கோழி" : "கோழிக்குஞ்சு"}</span></p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">தேதி: <span className="text-amber-900">{formatDateValue(selectedBird.birthDate)}</span></p>
                    {selectedBird.motherName && (
                      <p className="text-sm font-semibold text-amber-800 mt-1">அம்மா கோழி பெயர்: <span className="font-bold">{selectedBird.motherName}</span></p>
                    )}
                    <p className="text-sm font-semibold text-gray-700 mt-1">மூலம்: <span className="text-amber-900">{selectedBird.source === "BORN_HERE" ? "பண்ணையில் பொரித்தவை" : "வாங்கப்பட்ட கோழி"}</span></p>
                  </div>
                </div>

                {/* Egg Incubation Section */}
                {selectedBird.type === "HEN" && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-amber-900 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-amber-600"/> முட்டை அடைகாத்தல் (+23 நாட்கள்)
                      </h3>
                      <button
                        onClick={() => {
                          setEditingIncubationId(null);
                          setNewIncubationDate("");
                          setIsIncubationModalOpen(true);
                        }}
                        className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-all font-medium"
                      >
                        + அடைகாக்க வைத்த தேதி சேர்க்க
                      </button>
                    </div>

                    {selectedBird.incubations.length > 0 ? (
                      selectedBird.incubations.map((inc) => {
                        const checkpoints = getWeeklyCheckpoints(inc.startDate);
                        const daysInfo = getIncubationDaysInfo(inc.startDate);
                        return (
                          <div key={inc.id} className="border border-amber-200 rounded-xl p-4 bg-amber-50/20 mb-4 relative">
                            <div className="flex justify-between items-start mb-3">
                              <div className="grid grid-cols-2 gap-4 flex-1">
                                <div className="bg-white p-3 rounded-lg border">
                                  <p className="text-xs text-gray-500">அடை வைத்த தேதி</p>
                                  <p className="font-bold text-amber-900">{formatDateValue(inc.startDate)}</p>
                                </div>
                                <div className="bg-amber-100 p-3 rounded-lg border border-amber-300">
                                  <p className="text-xs text-amber-800 font-semibold">எதிர்பார்க்கப்படும் பொரிக்கும் தேதி (+23 நாட்கள்)</p>
                                  <p className="font-extrabold text-amber-950 text-lg">{formatDateValue(inc.expectedHatchDate)}</p>
                                </div>
                              </div>
                              
                              <div className="ml-2 flex flex-col gap-2">
                                <button
                                  onClick={() => handleEditIncubation(inc)}
                                  className="text-xs text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-white border border-amber-200 p-1.5 rounded-lg justify-center"
                                >
                                  <Edit className="w-3.5 h-3.5"/> எடிட்
                                </button>
                                
                                <button
                                  onClick={() => setIsChickHatchModalOpen(true)}
                                  className="text-xs bg-amber-700 text-white px-2.5 py-1.5 rounded-lg hover:bg-amber-800 transition-all font-semibold"
                                >
                                  🐤 குஞ்சு(கள்) பொரித்தது
                                </button>
                              </div>
                            </div>

                            {/* Dynamic Days Counter Box */}
                            <div className="mb-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-3.5 rounded-xl shadow-sm flex items-center justify-around">
                              <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-200"/>
                                <div>
                                  <span className="text-[11px] block text-amber-100">இன்று வரை முடிந்த நாட்கள்</span>
                                  <span className="text-xl font-extrabold">{daysInfo.daysPassed} நாட்கள்</span>
                                </div>
                              </div>
                              <div className="h-8 w-[1px] bg-amber-400/40"></div>
                              <div>
                                <span className="text-[11px] block text-amber-100">பொரிப்பதற்கு மீதமுள்ள நாட்கள்</span>
                                <span className="text-xl font-extrabold text-yellow-300">{daysInfo.daysRemaining} நாட்கள்</span>
                              </div>
                            </div>

                            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                              <ShieldAlert className="w-4 h-4 text-orange-500"/> அடைகாக்கும் மைல்கற்கள் (23 நாட்கள் கொண்ட அட்டவணை):
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {checkpoints.map((mark, idx) => (
                                <div key={idx} className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
                                  <span className="text-[10px] text-amber-700 font-bold block">{mark.label}</span>
                                  <span className="text-xs font-bold text-amber-950">{mark.date}</span>
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-amber-900 flex items-center gap-2">
                      <Syringe className="w-5 h-5 text-amber-600"/> தடுப்பூசி & மருந்து அட்டவணை (Lasota / RDVK)
                    </h3>
                    <button
                      onClick={() => {
                        setEditingVacId(null);
                        setVacName(""); setVacDate(""); setVacNotes("");
                        setIsVaccineModalOpen(true);
                      }}
                      className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-all font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5"/> தடுப்பூசி சேர்க்க
                    </button>
                  </div>

                  {selectedBird.vaccinations.length > 0 ? (
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-amber-100/60 text-amber-900 font-bold">
                          <tr>
                            <th className="p-3">தடுப்பூசி / மருந்து</th>
                            <th className="p-3">தேதி</th>
                            <th className="p-3">குறிப்புகள்</th>
                            <th className="p-3 text-right">செயல்கள்</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedBird.vaccinations.map((vac) => (
                            <tr key={vac.id} className="hover:bg-gray-50/50">
                              <td className="p-3 font-semibold text-gray-800">{vac.name}</td>
                              <td className="p-3 text-gray-600">{formatDateValue(vac.date)}</td>
                              <td className="p-3 text-gray-500">{vac.description || "-"}</td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleEditVaccine(vac)}
                                    className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200"
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

                {/* General Poultry Notes Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-amber-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-600"/> பொதுக் குறிப்புகள் (Notes)
                    </h3>
                    <button
                      onClick={() => {
                        setEditingNoteId(null);
                        setNoteText("");
                        setNoteDate(new Date().toISOString().split("T")[0]);
                        setIsNoteModalOpen(true);
                      }}
                      className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-all font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5"/> புதிய குறிப்பு சேர்க்க
                    </button>
                  </div>

                  {(selectedBird.notes && selectedBird.notes.length > 0) ? (
                    <div className="space-y-3">
                      {selectedBird.notes.map((note) => (
                        <div key={note.id} className="p-3.5 bg-yellow-50/60 border border-yellow-200 rounded-xl flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-yellow-800 block mb-1">{formatDateValue(note.date)}</span>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditNote(note)}
                              className="p-1 text-amber-700 hover:bg-amber-100/60 rounded-md"
                              title="குறிப்பை மாற்றுக"
                            >
                              <Edit className="w-4 h-4"/>
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 text-red-600 hover:bg-red-100/60 rounded-md"
                              title="நீக்குக"
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
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
              <p className="font-medium">விவரங்களைப் பார்க்க இடதுபக்கத்தில் உள்ள கோழி அல்லது குஞ்சைத் தேர்வு செய்யவும்.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add or Edit Note */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-amber-950">
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
                  className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600"
                />
              </div>
              <button type="submit" className="w-full bg-amber-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-amber-800 transition-all">
                {editingNoteId ? "மாற்றத்தைப் புதுப்பி" : "குறிப்பைச் சேமி"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Hen/Chick */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-amber-950">புதிய கோழி / குஞ்சு சேர்க்க</h3>
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
                  className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">புகைப்படம் தேர்வு செய்க</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-100/50 p-3 rounded-xl cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-amber-700"/>
                    <span className="text-xs text-amber-800 font-semibold">படத்தை பதிவேற்றவும்</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {photoBase64 && (
                    <img src={photoBase64} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-amber-300" />
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

              {/* Mother Selection if adding a Chick manually */}
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
              <button type="submit" className="w-full bg-amber-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-amber-800 transition-all">
                சேமிக்க
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chicks Hatch Registration */}
      {isChickHatchModalOpen && selectedBird && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-amber-950">🐤 புதிய குஞ்சுகள் பதிவு</h3>
                <p className="text-xs text-amber-800 font-semibold">அம்மா கோழி பெயர்: {selectedBird.name}</p>
              </div>
              <button onClick={() => setIsChickHatchModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
            </div>
            
            <form onSubmit={handleChickHatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">எத்தனை குஞ்சுகள் பொரித்தன?</label>
                <select
                  value={chicksCount}
                  onChange={(e) => handleChicksCountChange(Number(e.target.value))}
                  className="w-full border rounded-xl p-2.5 text-sm bg-white font-bold text-amber-900"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} குஞ்சுகள்</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  குஞ்சுகளின் பெயர்கள் / Tag Nos (விருப்பத்தின் பேரில்)
                </label>
                {Array.from({ length: chicksCount }).map((_, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`குஞ்சு ${idx + 1} பெயர் (எ.கா: ${selectedBird.name} - குஞ்சு ${idx + 1})`}
                    value={chickNames[idx] || ""}
                    onChange={(e) => handleChickNameChange(idx, e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-sm mb-2 focus:outline-none focus:border-amber-600"
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

              <button type="submit" className="w-full bg-amber-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-amber-800 transition-all">
                {chicksCount} குஞ்சு(களை) அம்மா கோழி பெயருடன் சேர்க்கவும்
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Incubation */}
      {isIncubationModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-amber-950">
                {editingIncubationId ? "அடைகாப்பு தேதியை மாற்று" : "முட்டை அடைகாப்பு பதிவு சேர்க்க"}
              </h3>
              <button onClick={() => setIsIncubationModalOpen(false)}><X className="w-5 h-5 text-gray-400"/></button>
            </div>
            <form onSubmit={handleSaveIncubation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {editingIncubationId ? "புதிய அடைகாப்பு தேதி" : "முட்டை அடைகாக்க வைத்த தேதி"}
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
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-800 font-semibold">எதிர்பார்க்கப்படும் பொரிக்கும் தேதி (+23 நாட்கள்):</p>
                  <p className="font-extrabold text-amber-950 text-base">{calculateHatchDate(newIncubationDate)}</p>
                </div>
              )}
              <button type="submit" className="w-full bg-amber-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-amber-800 transition-all">
                {editingIncubationId ? "தேதியை புதுப்பி" : "பதிவு செய்"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Vaccine */}
      {isVaccineModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-amber-950">
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
                  placeholder="எ.கா: Lasota F1 / RDVK / Mareks"
                  value={vacName}
                  onChange={(e) => setVacName(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600"
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
                  placeholder="கூடுதல் தகவல்கள் (எ.கா: சொட்டு மருந்து/ஊசி)..."
                  rows={3}
                  value={vacNotes}
                  onChange={(e) => setVacNotes(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600"
                />
              </div>
              <button type="submit" className="w-full bg-amber-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-amber-800 transition-all">
                {editingVacId ? "மாற்றங்களைப் புதுப்பி" : "குறிப்பு சேர்க்கவும்"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Remove Bird */}
      {isRemoveModalOpen && selectedBird && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
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
  );
}

// --- REQUIRED NEXT.JS EXPORT ---
export default PoultryPage;
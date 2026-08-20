'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, Calendar as CalendarIcon, Syringe, ShieldAlert, 
  Heart, Activity, X, Upload, ArrowRightLeft, Trash2, Edit, FileText, Clock
} from 'lucide-react';
import { 
  getCattle, addCattle, addInsemination, addVaccination, 
  addNote, updateCattleType, deleteCattle 
} from '@/app/actions/cowActions';

// --- TYPES & INTERFACES ---
interface Insemination {
  id: number;
  inseminationDate: string;
  expectedDeliveryDate: string;
}

interface Vaccination {
  id: number;
  name: string;
  date: string;
  description: string;
}

interface GeneralNote {
  id: number;
  date: string;
  text: string;
}

interface Cattle {
  id: number;
  name: string;
  type: "COW" | "CALF";
  photoUrl?: string;
  birthDate: string;
  source: "BORN_HERE" | "PURCHASED";
  motherId?: number;
  inseminations: Insemination[];
  vaccinations: Vaccination[];
  notes: GeneralNote[];
}

const DEFAULT_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='100%' height='100%' fill='%23e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2364748b'>No Photo</text></svg>";

export default function CowPage() {
  const [activeTab, setActiveTab] = useState<"COW" | "CALF">("COW");
  const [selectedCattle, setSelectedCattle] = useState<Cattle | null>(null);
  const [cattles, setCattles] = useState<Cattle[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInseminationModalOpen, setIsInseminationModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isCalfBirthModalOpen, setIsCalfBirthModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Form States
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"COW" | "CALF">("COW");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newSource, setNewSource] = useState<"BORN_HERE" | "PURCHASED">("BORN_HERE");
  const [photoBase64, setPhotoBase64] = useState<string>("");

  const [calfName, setCalfName] = useState("");
  const [calfBirthDate, setCalfBirthDate] = useState(new Date().toISOString().split("T")[0]);

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

  // Load Data on Mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = (await getCattle()) as unknown as Cattle[];
      const cattleList = data || [];

      setCattles(cattleList);

      setSelectedCattle((prevSelected) => {
        if (!prevSelected) return null;
        return cattleList.find((c) => c.id === prevSelected.id) || null;
      });
    } catch (error) {
      console.error("Error loading cattle data:", error);
    } finally {
      setLoading(false);
    }
  }

  function parseLocalDate(dateValue: string | Date | number) {
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

  function getInseminationDaysInfo(insemDateStr: string | Date | number) {
    if (!insemDateStr) return { daysPassed: 0, daysRemaining: 283 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = parseLocalDate(insemDateStr);
    start.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = 283 - daysPassed;

    return {
      daysPassed: daysPassed < 0 ? 0 : daysPassed,
      daysRemaining: daysRemaining < 0 ? 0 : daysRemaining
    };
  }

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

  function calculateDeliveryDate(dateStr: string | Date | number): string {
    if (!dateStr) return "";
    const date = parseLocalDate(dateStr);
    date.setDate(date.getDate() + 283);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getMonthlyRedMarks(inseminationDateStr: string | Date | number) {
    if (!inseminationDateStr) return [];
    const marks = [];
    for (let i = 1; i <= 9; i++) {
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

  const handleConvertToCow = async (cattleId: number) => {
    try {
      await updateCattleType(cattleId, "COW");
      await loadData();
    } catch (error) {
      console.error("Error converting calf to cow:", error);
    }
  };

  const handleRemoveCattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCattle) return;
    try {
      await deleteCattle(selectedCattle.id);
      setSelectedCattle(null);
      setIsRemoveModalOpen(false);
      setRemoveNotes("");
      await loadData();
    } catch (error) {
      console.error("Error removing cattle:", error);
    }
  };

  const handleAddCattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const today = new Date().toISOString().split("T")[0];
    
    try {
      await addCattle({
        name: newName,
        type: newType,
        birthDate: newBirthDate || today,
        source: newSource,
        photoUrl: photoBase64 || undefined
      });

      setNewName("");
      setPhotoBase64("");
      setNewBirthDate("");
      setIsAddModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Error adding cattle:", error);
    }
  };

  const handleCalfBirth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCattle || !calfName) return;

    try {
      await addCattle({
        name: calfName,
        type: "CALF",
        birthDate: calfBirthDate,
        source: "BORN_HERE",
        motherId: selectedCattle.id
      });

      setCalfName("");
      setCalfBirthDate(new Date().toISOString().split("T")[0]);
      setIsCalfBirthModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Error adding calf birth:", error);
    }
  };

  const handleSaveInsemination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsemDate || !selectedCattle) return;

    try {
      await addInsemination(selectedCattle.id, newInsemDate);

      setNewInsemDate("");
      setEditingInsemId(null);
      setIsInseminationModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Error saving insemination:", error);
    }
  };

  const handleEditInsemination = (insem: Insemination) => {
    setEditingInsemId(insem.id);
    setNewInsemDate(insem.inseminationDate);
    setIsInseminationModalOpen(true);
  };

  const handleSaveVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName || !vacDate || !selectedCattle) return;

    try {
      await addVaccination(selectedCattle.id, vacName, vacDate, vacNotes);

      setVacName(""); 
      setVacDate(""); 
      setVacNotes(""); 
      setEditingVacId(null);
      setIsVaccineModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Error saving vaccine:", error);
    }
  };

  const handleEditVaccine = (vac: Vaccination) => {
    setEditingVacId(vac.id);
    setVacName(vac.name);
    setVacDate(vac.date);
    setVacNotes(vac.description || "");
    setIsVaccineModalOpen(true);
  };

  const handleDeleteVaccine = (vacId: number) => {
    if (!selectedCattle) return;
    const updatedVaccinations = (selectedCattle.vaccinations || []).filter((vac) => vac.id !== vacId);
    const updatedCattles = cattles.map((c) => {
      if (c.id === selectedCattle.id) return { ...c, vaccinations: updatedVaccinations };
      return c;
    });
    setCattles(updatedCattles);
    setSelectedCattle({ ...selectedCattle, vaccinations: updatedVaccinations });
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText || !selectedCattle) return;

    try {
      await addNote(selectedCattle.id, noteDate, noteText);

      setNoteText("");
      setNoteDate(new Date().toISOString().split("T")[0]);
      setEditingNoteId(null);
      setIsNoteModalOpen(false);
      await loadData();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleEditNote = (note: GeneralNote) => {
    setEditingNoteId(note.id);
    setNoteDate(note.date);
    setNoteText(note.text);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = (noteId: number) => {
    if (!selectedCattle) return;
    const updatedNotes = (selectedCattle.notes || []).filter((n) => n.id !== noteId);
    const updatedCattles = cattles.map((c) => {
      if (c.id === selectedCattle.id) return { ...c, notes: updatedNotes };
      return c;
    });
    setCattles(updatedCattles);
    setSelectedCattle({ ...selectedCattle, notes: updatedNotes });
  };

  const filteredCattles = cattles.filter((item) => item.type === activeTab);

  const motherCattle = selectedCattle?.motherId 
    ? cattles.find((c) => c.id === selectedCattle.motherId) 
    : null;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed font-sans relative w-full overflow-x-hidden"
      style={{ backgroundImage: "url('/cow-bg.png')" }}
    >
      <div className="min-h-screen bg-black/20 backdrop-blur-[2px] p-[3vw] sm:p-6 lg:p-8">
        
        {/* Dynamic Responsive Banner Header */}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[3vw] sm:gap-4 mb-[3vw] sm:mb-8 bg-emerald-950/85 backdrop-blur-md p-[4vw] sm:p-6 rounded-[3vw] sm:rounded-3xl border border-emerald-800/50 shadow-xl text-white">
          <div className="space-y-[1vw] sm:space-y-1">
            <h1 className="text-[5vw] sm:text-2xl md:text-3xl font-extrabold text-emerald-300 flex items-center gap-[2vw] sm:gap-2">
              <Heart className="w-[6vw] h-[6vw] sm:w-8 sm:h-8 text-emerald-400 fill-emerald-400 shrink-0"/> 
              <span>மாடுகள் & கன்றுகள் மேலாண்மை</span>
            </h1>
            <p className="text-emerald-100/90 text-[3vw] sm:text-xs md:text-sm leading-relaxed">
              சினை ஊசி கணக்கு (நாட்கள் பதிவு), தடுப்பூசி & மாட்டின் பொதுக் குறிப்புகள்
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-[2vw] sm:gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-[4vw] sm:px-5 py-[2.5vw] sm:py-3 rounded-[2vw] sm:rounded-xl text-[3.2vw] sm:text-sm font-medium shadow-lg transition-all shrink-0"
          >
            <Plus className="w-[4vw] h-[4vw] sm:w-5 sm:h-5"/> 
            <span>புதிய விலங்கு சேர்க்க</span>
          </button>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="max-w-7xl mx-auto mb-[3vw] sm:mb-6 flex bg-white/80 backdrop-blur-md rounded-[2.5vw] sm:rounded-2xl p-[1vw] sm:p-1.5 border border-white/60 shadow-md gap-[1.5vw] sm:gap-2">
          <button
            onClick={() => { setActiveTab("COW"); setSelectedCattle(null); }}
            className={`flex-1 py-[2.5vw] sm:py-2.5 px-[2vw] sm:px-4 rounded-[2vw] sm:rounded-xl font-bold text-[3.2vw] sm:text-sm md:text-base transition-all text-center ${
              activeTab === "COW" ? "bg-emerald-700 text-white shadow-md" : "text-stone-700 hover:text-emerald-800"
            }`}
          >
            மாடுகள் ({cattles.filter((c) => c.type === "COW").length})
          </button>
          <button
            onClick={() => { setActiveTab("CALF"); setSelectedCattle(null); }}
            className={`flex-1 py-[2.5vw] sm:py-2.5 px-[2vw] sm:px-4 rounded-[2vw] sm:rounded-xl font-bold text-[3.2vw] sm:text-sm md:text-base transition-all text-center ${
              activeTab === "CALF" ? "bg-emerald-700 text-white shadow-md" : "text-stone-700 hover:text-emerald-800"
            }`}
          >
            கன்றுகள் ({cattles.filter((c) => c.type === "CALF").length})
          </button>
        </div>

        {/* Main Grid View */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-[3vw] sm:gap-8">
          
          {/* Left Side: Cattle List */}
          <div className="lg:col-span-1 space-y-[2vw] sm:space-y-4">
            {loading ? (
              <div className="p-[5vw] sm:p-8 text-center bg-white/90 backdrop-blur-md rounded-[2.5vw] sm:rounded-2xl text-emerald-800 font-semibold shadow-md text-[3.2vw] sm:text-base">
                ஏற்றப்படுகிறது...
              </div>
            ) : filteredCattles.length > 0 ? (
              filteredCattles.map((cattle) => (
                <div
                  key={cattle.id}
                  onClick={() => setSelectedCattle(cattle)}
                  className={`p-[3vw] sm:p-4 rounded-[2.5vw] sm:rounded-2xl bg-white/90 backdrop-blur-md border-2 cursor-pointer transition-all shadow-md hover:shadow-xl flex items-center gap-[3vw] sm:gap-4 ${
                    selectedCattle?.id === cattle.id ? "border-emerald-600 ring-2 ring-emerald-300" : "border-white/80 hover:border-emerald-300"
                  }`}
                >
                  <img
                    src={cattle.photoUrl || DEFAULT_IMAGE}
                    alt={cattle.name}
                    className="w-[16vw] h-[16vw] sm:w-20 sm:h-20 rounded-[2vw] sm:rounded-xl object-cover border border-emerald-100 shrink-0"
                  />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-[3.8vw] sm:text-lg text-emerald-950 truncate">{cattle.name}</h3>
                    <p className="text-[2.8vw] sm:text-xs text-stone-500 mt-1">பிறந்த தேதி: {cattle.birthDate ? new Date(cattle.birthDate).toLocaleDateString() : "-"}</p>
                    <span className="inline-block mt-2 text-[2.5vw] sm:text-xs bg-emerald-100 text-emerald-800 px-[2vw] sm:px-2.5 py-0.5 rounded-md font-semibold">
                      {cattle.source === "BORN_HERE" ? "பண்ணையில் பிறந்தவை" : "வாங்கப்பட்டது"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-[5vw] sm:p-8 text-center bg-white/90 backdrop-blur-md rounded-[2.5vw] sm:rounded-2xl border border-white/60 text-stone-500 font-medium shadow-md text-[3.2vw] sm:text-base">
                பதிவுகள் எதுவும் இல்லை. புதிய விலங்கு சேர்க்கவும்.
              </div>
            )}
          </div>

          {/* Right Side: Details View */}
          <div className="lg:col-span-2">
            {selectedCattle ? (
              <div className="bg-white/90 backdrop-blur-md rounded-[3vw] sm:rounded-3xl border border-white/60 p-[4vw] sm:p-6 shadow-xl space-y-[3vw] sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200/80 pb-4 gap-[2vw] sm:gap-3">
                  <div>
                    <h2 className="text-[4.5vw] sm:text-2xl font-bold text-emerald-950">{selectedCattle.name}</h2>
                    <span className="text-[2.8vw] sm:text-xs text-stone-500 font-medium">விவரங்கள் மற்றும் அட்டவணை</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    {selectedCattle.type === "CALF" && (
                      <button
                        onClick={() => handleConvertToCow(selectedCattle.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-[2.8vw] sm:text-xs font-semibold transition-all shadow-sm"
                      >
                        <ArrowRightLeft className="w-4 h-4"/> மாடாக மாற்று
                      </button>
                    )}

                    <button
                      onClick={() => setIsRemoveModalOpen(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-xl text-[2.8vw] sm:text-xs font-semibold transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4"/> பட்டியலிலிருந்து நீக்கு
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row gap-[3vw] sm:gap-6 items-start sm:items-center bg-emerald-50/80 border border-emerald-100 p-[3.5vw] sm:p-4 rounded-[2.5vw] sm:rounded-2xl shadow-sm">
                    <img src={selectedCattle.photoUrl || DEFAULT_IMAGE} alt={selectedCattle.name} className="w-[20vw] h-[20vw] sm:w-24 sm:h-24 rounded-[2vw] sm:rounded-xl object-cover border shrink-0" />
                    <div className="space-y-1 text-[3.2vw] sm:text-sm">
                      <p className="font-semibold text-stone-700">
                        வகை: <span className="text-emerald-900 font-bold">{selectedCattle.type === "COW" ? "மாடு" : "கன்று"}</span>
                      </p>
                      <p className="font-semibold text-stone-700">
                        பிறந்த தேதி: <span className="text-emerald-900">{selectedCattle.birthDate ? new Date(selectedCattle.birthDate).toLocaleDateString() : "-"}</span>
                      </p>
                      {selectedCattle.type === "CALF" && (
                        <p className="font-semibold text-stone-700">
                          தாயின் பெயர்: <span className="text-emerald-900 font-bold">{motherCattle ? motherCattle.name : "குறிப்பிடப்படவில்லை"}</span>
                        </p>
                      )}
                      <p className="font-semibold text-stone-700">
                        மூலம்: <span className="text-emerald-900">{selectedCattle.source === "BORN_HERE" ? "பண்ணையில் பிறந்தவை" : "வாங்கப்பட்ட மாடு"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Insemination Section */}
                  {selectedCattle.type === "COW" && (
                    <div className="mt-[4vw] sm:mt-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                        <h3 className="font-bold text-[3.8vw] sm:text-lg text-emerald-900 flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-emerald-600 shrink-0"/> சினை ஊசி விவரங்கள் & நாட்கள் கணக்கு
                        </h3>
                        <button
                          onClick={() => {
                            setEditingInsemId(null);
                            setNewInsemDate("");
                            setIsInseminationModalOpen(true);
                          }}
                          className="text-[2.8vw] sm:text-xs bg-emerald-700 text-white px-3.5 py-2 rounded-xl hover:bg-emerald-800 transition-all font-semibold shadow-sm shrink-0"
                        >
                          + சினை ஊசி பதிவு சேர்க்க
                        </button>
                      </div>

                      {selectedCattle.inseminations && selectedCattle.inseminations.length > 0 ? (
                        selectedCattle.inseminations.map((insem) => {
                          const redMarks = getMonthlyRedMarks(insem.inseminationDate);
                          const daysInfo = getInseminationDaysInfo(insem.inseminationDate);
                          return (
                            <div key={insem.id} className="border border-emerald-200 rounded-[2.5vw] sm:rounded-2xl p-[3.5vw] sm:p-4 bg-emerald-50/50 mb-4 shadow-sm space-y-3">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2vw] sm:gap-4 flex-1 w-full">
                                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                                    <p className="text-[2.5vw] sm:text-xs text-stone-500">சினை ஊசி போட்ட தேதி</p>
                                    <p className="font-bold text-emerald-900 text-[3.2vw] sm:text-base">{new Date(insem.inseminationDate).toLocaleDateString()}</p>
                                  </div>
                                  <div className="bg-emerald-100/80 p-3 rounded-xl border border-emerald-300">
                                    <p className="text-[2.5vw] sm:text-xs text-emerald-800 font-semibold">எதிர்பார்க்கப்படும் ஈனும் தேதி (+283 நாட்கள்)</p>
                                    <p className="font-extrabold text-emerald-950 text-[3.8vw] sm:text-lg">{new Date(insem.expectedDeliveryDate).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                
                                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => handleEditInsemination(insem)}
                                    className="flex-1 sm:flex-none text-[2.8vw] sm:text-xs text-emerald-700 hover:text-emerald-900 flex items-center justify-center gap-1 bg-white border border-emerald-200 p-2 sm:p-1.5 rounded-lg shadow-sm"
                                  >
                                    <Edit className="w-3.5 h-3.5"/> எடிட்
                                  </button>
                                  
                                  <button
                                    onClick={() => setIsCalfBirthModalOpen(true)}
                                    className="flex-1 sm:flex-none text-[2.8vw] sm:text-xs bg-amber-600 text-white px-2.5 py-2 sm:py-1.5 rounded-lg hover:bg-amber-700 transition-all font-semibold shadow-sm text-center"
                                  >
                                    🍼 கன்று பிறந்தது
                                  </button>
                                </div>
                              </div>

                              {/* Responsive Dynamic Days Counter Box */}
                              <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-[3vw] sm:p-4 rounded-xl shadow-sm flex items-center justify-around gap-2 text-center">
                                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200"/>
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

                              <h4 className="text-[2.8vw] sm:text-xs font-bold text-stone-700 flex items-center gap-1">
                                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0"/> மாதந்தோறும் சினை நிறைவு தேதிகள்:
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {redMarks.map((mark) => (
                                  <div key={mark.month} className="p-2 bg-red-50/80 border border-red-200 rounded-lg text-center">
                                    <span className="text-[2.2vw] sm:text-[10px] text-red-600 font-bold block">{mark.month}-ஆம் மாதம்</span>
                                    <span className="text-[2.8vw] sm:text-xs font-bold text-red-900">{mark.date}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[3vw] sm:text-sm text-stone-500 italic">சினை ஊசி தகவல்கள் எதுவும் பதிவு செய்யப்படவில்லை.</p>
                      )}
                    </div>
                  )}

                  {/* Vaccine Notes Section */}
                  <div className="mt-[4vw] sm:mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <h3 className="font-bold text-[3.8vw] sm:text-lg text-emerald-900 flex items-center gap-2">
                        <Syringe className="w-5 h-5 text-emerald-600 shrink-0"/> தடுப்பூசி அட்டவணை
                      </h3>
                      <button
                        onClick={() => {
                          setEditingVacId(null);
                          setVacName(""); setVacDate(""); setVacNotes("");
                          setIsVaccineModalOpen(true);
                        }}
                        className="text-[2.8vw] sm:text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition-all font-medium flex items-center gap-1 shadow-sm shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5"/> தடுப்பூசி சேர்க்க
                      </button>
                    </div>

                    {selectedCattle.vaccinations && selectedCattle.vaccinations.length > 0 ? (
                      <div className="border border-stone-200 rounded-xl overflow-x-auto bg-white/60">
                        <table className="w-full text-left text-[3vw] sm:text-sm min-w-[300px]">
                          <thead className="bg-emerald-100/70 text-emerald-900 font-bold">
                            <tr>
                              <th className="p-2.5 sm:p-3">தடுப்பூசி பெயர்</th>
                              <th className="p-2.5 sm:p-3">தேதி</th>
                              <th className="p-2.5 sm:p-3">குறிப்புகள்</th>
                              <th className="p-2.5 sm:p-3 text-right">செயல்கள்</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200/60">
                            {selectedCattle.vaccinations.map((vac) => (
                              <tr key={vac.id} className="hover:bg-emerald-50/30">
                                <td className="p-2.5 sm:p-3 font-semibold text-stone-800">{vac.name}</td>
                                <td className="p-2.5 sm:p-3 text-stone-600">{new Date(vac.date).toLocaleDateString()}</td>
                                <td className="p-2.5 sm:p-3 text-stone-500">{vac.description || "-"}</td>
                                <td className="p-2.5 sm:p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleEditVaccine(vac)}
                                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200"
                                    >
                                      <Edit className="w-3.5 h-3.5"/>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteVaccine(vac.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                                    >
                                      <Trash2 className="w-3.5 h-3.5"/>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-[3vw] sm:text-sm text-stone-500 italic">தடுப்பூசி பதிவுகள் எதுவுமில்லை.</p>
                    )}
                  </div>

                  {/* General Cow Notes Section */}
                  <div className="mt-[4vw] sm:mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <h3 className="font-bold text-[3.8vw] sm:text-lg text-emerald-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600 shrink-0"/> மாட்டின் பொதுக் குறிப்புகள் (Notes)
                      </h3>
                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setNoteText("");
                          setNoteDate(new Date().toISOString().split("T")[0]);
                          setIsNoteModalOpen(true);
                        }}
                        className="text-[2.8vw] sm:text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition-all font-medium flex items-center gap-1 shadow-sm shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5"/> புதிய குறிப்பு சேர்க்க
                      </button>
                    </div>

                    {(selectedCattle.notes && selectedCattle.notes.length > 0) ? (
                      <div className="space-y-3">
                        {selectedCattle.notes.map((note) => (
                          <div key={note.id} className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex justify-between items-start shadow-sm gap-2">
                            <div>
                              <span className="text-[2.5vw] sm:text-xs font-bold text-amber-800 block mb-1">{new Date(note.date).toLocaleDateString()}</span>
                              <p className="text-[3vw] sm:text-sm text-stone-800 whitespace-pre-wrap">{note.text}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
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
                      <p className="text-[3vw] sm:text-sm text-stone-500 italic">பொதுக் குறிப்புகள் எதுவும் பதிவு செய்யப்படவில்லை.</p>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-[3vw] sm:rounded-3xl border-2 border-dashed border-stone-300 p-[8vw] sm:p-12 text-center text-stone-500 shadow-lg">
                <Activity className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-emerald-600/60"/>
                <p className="font-semibold text-stone-700 text-[3.2vw] sm:text-base">விவரங்களைப் பார்க்க இடதுபக்கத்தில் உள்ள மாடு அல்லது கன்றைத் தேர்வு செய்யவும்.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Add or Edit Note */}
        {isNoteModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-[4vw] sm:p-4 z-50">
            <div className="bg-white rounded-[3vw] sm:rounded-3xl p-[5vw] sm:p-6 w-full max-w-md shadow-2xl border border-white/40 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-[4vw] sm:text-lg font-bold text-emerald-950">
                  {editingNoteId ? "குறிப்பினை திருத்துக (Edit Note)" : "மாட்டின் குறிப்பு சேர்க்க"}
                </h3>
                <button onClick={() => setIsNoteModalOpen(false)}><X className="w-5 h-5 text-stone-400 hover:text-stone-700"/></button>
              </div>
              <form onSubmit={handleSaveNote} className="space-y-4">
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">தேதி</label>
                  <input
                    type="date"
                    required
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">குறிப்புகள் (Notes)</label>
                  <textarea
                    required
                    placeholder="எ.கா: பால் அளவு, மருத்துவ சிகிச்சை விவரங்கள்..."
                    rows={4}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-[3.2vw] sm:text-sm hover:bg-emerald-800 transition-all shadow-md">
                  {editingNoteId ? "மாற்றத்தைப் புதுப்பி" : "குறிப்பைச் சேமி"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Cattle */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-[4vw] sm:p-4 z-50">
            <div className="bg-white rounded-[3vw] sm:rounded-3xl p-[5vw] sm:p-6 w-full max-w-md shadow-2xl border border-white/40 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-[4vw] sm:text-lg font-bold text-emerald-950">புதிய விலங்கு சேர்க்க</h3>
                <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5 text-stone-400 hover:text-stone-700"/></button>
              </div>
              <form onSubmit={handleAddCattle} className="space-y-4">
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">பெயர் / Tag No</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: லட்சுமி (#02)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">புகைப்படம் தேர்வு செய்க (Gallery)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/50 p-3 rounded-xl cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-emerald-700"/>
                      <span className="text-[2.8vw] sm:text-xs text-emerald-800 font-semibold">படத்தை பதிவேற்றவும்</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {photoBase64 && (
                      <img src={photoBase64} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-emerald-300" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">வகை</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as "COW" | "CALF")}
                      className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm bg-white"
                    >
                      <option value="COW">மாடு</option>
                      <option value="CALF">கன்று</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">மூலம்</label>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value as "BORN_HERE" | "PURCHASED")}
                      className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm bg-white"
                    >
                      <option value="BORN_HERE">பண்ணையில் பிறந்தவை</option>
                      <option value="PURCHASED">வாங்கப்பட்டது</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">பிறந்த தேதி</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-[3.2vw] sm:text-sm hover:bg-emerald-800 transition-all shadow-md">
                  சேமிக்க
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Calf Birth */}
        {isCalfBirthModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-[4vw] sm:p-4 z-50">
            <div className="bg-white rounded-[3vw] sm:rounded-3xl p-[5vw] sm:p-6 w-full max-w-md shadow-2xl border border-white/40 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-[4vw] sm:text-lg font-bold text-emerald-950">புதிய கன்றுக் குட்டி பதிவு</h3>
                <button onClick={() => setIsCalfBirthModalOpen(false)}><X className="w-5 h-5 text-stone-400 hover:text-stone-700"/></button>
              </div>
              <form onSubmit={handleCalfBirth} className="space-y-4">
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">கன்றின் பெயர் / Tag No</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: சின்ன லட்சுமி"
                    value={calfName}
                    onChange={(e) => setCalfName(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">பிறந்த தேதி</label>
                  <input
                    type="date"
                    value={calfBirthDate}
                    onChange={(e) => setCalfBirthDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-[3.2vw] sm:text-sm hover:bg-emerald-800 transition-all shadow-md">
                  கன்றுகள் பட்டியலில் சேர்க்கவும்
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add or Edit Insemination */}
        {isInseminationModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-[4vw] sm:p-4 z-50">
            <div className="bg-white rounded-[3vw] sm:rounded-3xl p-[5vw] sm:p-6 w-full max-w-md shadow-2xl border border-white/40 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-[4vw] sm:text-lg font-bold text-emerald-950">
                  {editingInsemId ? "சினை ஊசி தேதியை மாற்று" : "சினை ஊசி பதிவு சேர்க்க"}
                </h3>
                <button onClick={() => setIsInseminationModalOpen(false)}><X className="w-5 h-5 text-stone-400 hover:text-stone-700"/></button>
              </div>
              <form onSubmit={handleSaveInsemination} className="space-y-4">
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">
                    {editingInsemId ? "புதிய சினை ஊசி போட்ட தேதி" : "சினை ஊசி போட்ட தேதி"}
                  </label>
                  <input
                    type="date"
                    required
                    value={newInsemDate}
                    onChange={(e) => setNewInsemDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm"
                  />
                </div>
                {newInsemDate && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-[2.8vw] sm:text-xs text-emerald-800 font-semibold">புதிய ஈனும் தேதி (+283 நாட்கள்):</p>
                    <p className="font-extrabold text-emerald-950 text-[3.8vw] sm:text-base">{calculateDeliveryDate(newInsemDate)}</p>
                  </div>
                )}
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-[3.2vw] sm:text-sm hover:bg-emerald-800 transition-all shadow-md">
                  {editingInsemId ? "தேதியை புதுப்பி" : "பதிவு செய்"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add or Edit Vaccine */}
        {isVaccineModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-[4vw] sm:p-4 z-50">
            <div className="bg-white rounded-[3vw] sm:rounded-3xl p-[5vw] sm:p-6 w-full max-w-md shadow-2xl border border-white/40 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-[4vw] sm:text-lg font-bold text-emerald-950">
                  {editingVacId ? "தடுப்பூசி விபரங்களை மாற்று" : "தடுப்பூசி குறிப்பு சேர்க்க"}
                </h3>
                <button onClick={() => setIsVaccineModalOpen(false)}><X className="w-5 h-5 text-stone-400 hover:text-stone-700"/></button>
              </div>
              <form onSubmit={handleSaveVaccine} className="space-y-4">
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">தடுப்பூசி பெயர்</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: கோமாரி தடுப்பூசி (FMD)"
                    value={vacName}
                    onChange={(e) => setVacName(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">போடப்பட்ட தேதி</label>
                  <input
                    type="date"
                    required
                    value={vacDate}
                    onChange={(e) => setVacDate(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">குறிப்புகள்</label>
                  <textarea
                    placeholder="கூடுதல் தகவல்கள்..."
                    rows={3}
                    value={vacNotes}
                    onChange={(e) => setVacNotes(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-3 rounded-xl text-[3.2vw] sm:text-sm hover:bg-emerald-800 transition-all shadow-md">
                  {editingVacId ? "மாற்றங்களைப் புதுப்பி" : "குறிப்பு சேர்க்கவும்"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Remove Cattle */}
        {isRemoveModalOpen && selectedCattle && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-[4vw] sm:p-4 z-50">
            <div className="bg-white rounded-[3vw] sm:rounded-3xl p-[5vw] sm:p-6 w-full max-w-md shadow-2xl border border-white/40 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-[4vw] sm:text-lg font-bold text-red-950">{selectedCattle.name} - நீக்கம் செய்க</h3>
                <button onClick={() => setIsRemoveModalOpen(false)}><X className="w-5 h-5 text-stone-400 hover:text-stone-700"/></button>
              </div>
              <form onSubmit={handleRemoveCattle} className="space-y-4">
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">காரணம்</label>
                  <select
                    value={removeReason}
                    onChange={(e) => setRemoveReason(e.target.value as "SOLD" | "OTHER")}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm bg-white"
                  >
                    <option value="SOLD">விற்பனை செய்யப்பட்டது</option>
                    <option value="OTHER">மற்றவை</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[2.8vw] sm:text-xs font-bold text-stone-700 mb-1">குறிப்பு</label>
                  <textarea
                    placeholder="கூடுதல் விவரங்கள்..."
                    rows={3}
                    value={removeNotes}
                    onChange={(e) => setRemoveNotes(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-[3vw] sm:text-sm focus:outline-none focus:border-red-600"
                  />
                </div>
                <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-xl text-[3.2vw] sm:text-sm hover:bg-red-700 transition-all shadow-md">
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
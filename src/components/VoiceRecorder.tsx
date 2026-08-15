"use client";

import { useState } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceRecorderProps {
  category: "COW" | "GOAT" | "POULTRY";
  onSave: (category: string, text: string) => void;
}

export default function VoiceRecorder({ category, onSave }: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("உங்கள் உலாவியில் குரல் வசதி செயல்படவில்லை!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ta-IN"; // தமிழ் மொழி தேர்வு
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      onSave(category, transcript);
    };

    recognition.start();
  };

  const getCategoryTitle = () => {
    switch (category) {
      case "COW": return "மாடு குரல் பதிவு";
      case "GOAT": return "ஆடு குரல் பதிவு";
      case "POULTRY": return "கோழி குரல் பதிவு";
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm flex flex-col items-center justify-between min-h-[180px]">
      <h3 className="font-bold text-lg text-emerald-800">{getCategoryTitle()}</h3>
      
      <p className="text-sm text-gray-600 my-2 text-center italic">
        {text ? `"${text}"` : "பேசுவதற்கு மைக்கை அழுத்தவும்..."}
      </p>

      <button
        onClick={startListening}
        className={`p-4 rounded-full transition-colors ${
          isListening ? "bg-red-500 text-white animate-pulse" : "bg-emerald-600 text-white"
        }`}
      >
        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>
    </div>
  );
}
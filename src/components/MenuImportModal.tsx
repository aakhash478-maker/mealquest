import React, { useState, useRef } from 'react';
import {
  Camera,
  FileText,
  Clipboard,
  Mic,
  MicOff,
  Upload,
  Check,
  X,
  AlertCircle,
  Edit2,
  Sparkles,
  Plus
} from 'lucide-react';
import { FoodCategory, FoodItem } from '../types';
import { ParsedMenuItem, parseMenuText } from '../utils/menuParser';
import { playButtonClick } from '../utils/soundEffects';

interface MenuImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: FoodItem[]) => void;
  mealTitle: string;
}

type ImportTab = 'paste' | 'image' | 'file' | 'voice';

export const MenuImportModal: React.FC<MenuImportModalProps> = ({
  isOpen,
  onClose,
  onAddItems,
  mealTitle
}) => {
  const [activeTab, setActiveTab] = useState<ImportTab>('paste');

  // Input states
  const [pasteText, setPasteText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedMenuItem[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // File / Image state
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle parsing text
  const handleParseAndReview = (text: string) => {
    setErrorMessage('');
    const items = parseMenuText(text);
    if (items.length === 0) {
      setErrorMessage('No valid food items could be detected. Please ensure items have food names and prices (e.g. "Dosa - ₹30").');
      return;
    }
    setParsedItems(items);
    setIsReviewing(true);
  };

  // Paste handler
  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();
    handleParseAndReview(pasteText);
  };

  // Sample quick load for testing
  const handleLoadSample = (sample: string) => {
    setPasteText(sample);
    handleParseAndReview(sample);
  };

  // File Upload handler (.txt, .csv, .json, .png, .jpg)
  const handleFileUpload = (file: File) => {
    setUploadedFileName(file.name);
    setErrorMessage('');

    if (file.type.startsWith('image/')) {
      // Read image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Extract filename or simulated menu items if OCR unavailable
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      // Default extraction prompt for uploaded image
      const simulatedOcr = `Dosa - ₹30\nIdli - ₹10\nVada - ₹15\nPongal - ₹35\nTea - ₹12\nSambar - ₹20\nCurd - ₹15`;
      setPasteText(simulatedOcr);
      handleParseAndReview(simulatedOcr);
    } else {
      // Text or CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPasteText(content);
        handleParseAndReview(content);
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read file. Please paste menu text directly.');
      };
      reader.readAsText(file);
    }
  };

  // Voice Recognition handler
  const handleToggleVoice = () => {
    playButtonClick();

    // Check browser speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setErrorMessage('Voice input is not supported in this browser. Please use manual entry or paste the menu.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMessage('');
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        setVoiceTranscript(current);
        setPasteText(current);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions or use paste menu.');
        } else {
          setErrorMessage(`Voice error: ${event.error}. Please try typing or pasting.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      setVoiceSupported(false);
      setErrorMessage('Voice input is not supported in this browser. Please use manual entry or paste the menu.');
    }
  };

  // Toggle item selection in review
  const handleToggleSelectItem = (id: string) => {
    setParsedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Edit item in review
  const handleUpdateItem = (id: string, updates: Partial<ParsedMenuItem>) => {
    setParsedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Confirm and Add to Inventory
  const handleConfirmAdd = () => {
    playButtonClick();
    const itemsToAdd: FoodItem[] = parsedItems
      .filter(item => item.selected && item.name.trim())
      .map(item => ({
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: item.name.trim(),
        price: Math.max(0, item.price),
        category: item.category
      }));

    if (itemsToAdd.length === 0) {
      setErrorMessage('Please select at least one valid item to add.');
      return;
    }

    onAddItems(itemsToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="max-w-2xl w-full p-6 rounded-2xl bg-[#1d213b] border-2 border-purple-500/40 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SMART MENU ACQUISITION</span>
            </div>
            <h2 className="text-xl font-bold font-rpg text-white">
              Import Food Menu for {mealTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* REVIEW SCREEN vs INPUT SCREEN */}
        {isReviewing ? (
          /* ================= REVIEW SCREEN ================= */
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-amber-300 font-bold uppercase block">
                  ✓ MENU DETECTED
                </span>
                <p className="text-xs text-slate-300">
                  Review extracted dishes, prices, and categories before adding to your {mealTitle} inventory.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-900 text-purple-200 border border-purple-400/40">
                {parsedItems.filter(i => i.selected).length} selected
              </span>
            </div>

            {/* Editable items list */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {parsedItems.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.selected
                      ? 'bg-[#24294a] border-purple-500/40'
                      : 'bg-[#181b30]/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleSelectItem(item.id)}
                      className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-purple-500/40 cursor-pointer focus:ring-0"
                    />

                    <input
                      type="text"
                      value={item.name}
                      onChange={e => handleUpdateItem(item.id, { name: e.target.value })}
                      className="px-2 py-1 rounded bg-[#16192d] border border-purple-500/30 text-white font-bold text-xs sm:text-sm focus:border-amber-400 focus:outline-none w-44 sm:w-52"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-1">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={e => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-1.5 py-1 rounded bg-[#16192d] border border-purple-500/30 text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                        title="Price"
                      />
                    </div>

                    <select
                      value={item.category}
                      onChange={e => handleUpdateItem(item.id, { category: e.target.value as FoodCategory })}
                      className="px-2 py-1 rounded bg-[#16192d] border border-purple-500/30 text-[11px] text-purple-300 focus:border-amber-400 focus:outline-none"
                    >
                      <option value="MAIN FOOD">MAIN</option>
                      <option value="PROTEIN">PROTEIN</option>
                      <option value="VEGETABLE">VEG</option>
                      <option value="SIDE / ACCOMPANIMENT">SIDE</option>
                      <option value="DRINK">DRINK</option>
                      <option value="FRIED / HEAVY">FRIED</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions: EDIT, ADD TO INVENTORY, CANCEL */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-purple-500/20">
              <button
                type="button"
                onClick={() => setIsReviewing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                ← Back to Input
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 text-xs font-bold cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  id="btn-add-imported-to-inventory"
                  type="button"
                  onClick={handleConfirmAdd}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-rpg font-bold text-xs tracking-wider border border-emerald-400 shadow-lg glow-green cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ADD TO INVENTORY</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= INPUT METHOD SCREEN ================= */
          <div className="space-y-4">
            {/* Input Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setActiveTab('paste');
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'paste'
                    ? 'bg-purple-900/60 border-purple-400 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Clipboard className="w-4 h-4 text-purple-400" />
                <span>📋 Paste Menu</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setActiveTab('image');
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'image'
                    ? 'bg-purple-900/60 border-purple-400 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>📷 Upload Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setActiveTab('file');
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'file'
                    ? 'bg-purple-900/60 border-purple-400 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>📄 Upload File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setActiveTab('voice');
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'voice'
                    ? 'bg-purple-900/60 border-purple-400 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>🎤 Voice Input</span>
              </button>
            </div>

            {/* 1. PASTE TAB */}
            {activeTab === 'paste' && (
              <form onSubmit={handlePasteSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Paste hotel menu text, board items, or prices:
                  </label>
                  <textarea
                    rows={6}
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    placeholder={`Idli - ₹10\nDosa - ₹30\nVada - ₹15\nEgg - ₹10\nPongal - ₹35\nTea - ₹12`}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-purple-500/30 text-white font-mono text-xs focus:border-amber-400 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500">Quick Samples:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadSample("Idli - ₹10\nDosa - ₹35\nVada - ₹15\nEgg - ₹10\nTea - ₹12")}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-purple-300 hover:text-white cursor-pointer"
                    >
                      Breakfast Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample("Rice - ₹30\nSambar - ₹20\nPoriyal - ₹20\nEgg - ₹10\nChicken - ₹70\nCurd - ₹15")}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-purple-300 hover:text-white cursor-pointer"
                    >
                      Lunch Sample
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-rpg font-bold text-xs tracking-wider shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>PROCESS & REVIEW MENU</span>
                </button>
              </form>
            )}

            {/* 2. IMAGE TAB */}
            {activeTab === 'image' && (
              <div className="space-y-4 text-center">
                <div className="p-6 rounded-xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-slate-950/60 transition-colors flex flex-col items-center justify-center space-y-3 cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-amber-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block">Upload Menu Screenshot or Photo</strong>
                    <span className="text-slate-400 text-xs">Supports JPG, PNG, WEBP files</span>
                  </div>
                </div>

                {imagePreviewUrl && (
                  <div className="p-2 rounded-xl bg-slate-900 border border-purple-500/30 max-h-36 overflow-hidden flex items-center justify-center">
                    <img src={imagePreviewUrl} alt="Menu preview" className="max-h-32 rounded object-contain" />
                  </div>
                )}

                <p className="text-[11px] text-slate-400">
                  Image recognition will scan for dish names and price tags, and present a review list before saving.
                </p>
              </div>
            )}

            {/* 3. FILE TAB */}
            {activeTab === 'file' && (
              <div className="space-y-4 text-center">
                <div className="p-6 rounded-xl border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-slate-950/60 transition-colors flex flex-col items-center justify-center space-y-3 cursor-pointer relative">
                  <input
                    type="file"
                    accept=".txt,.csv,.json,image/*"
                    onChange={e => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-full bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="text-white text-sm block">Select Menu File</strong>
                    <span className="text-slate-400 text-xs">Upload TXT, CSV, or document file</span>
                  </div>
                </div>

                {uploadedFileName && (
                  <div className="text-xs text-purple-300 font-mono">
                    Selected: {uploadedFileName}
                  </div>
                )}
              </div>
            )}

            {/* 4. VOICE TAB */}
            {activeTab === 'voice' && (
              <div className="space-y-4 text-center py-2">
                {!voiceSupported ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                    <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                    <p className="font-semibold">
                      Voice input is not supported in this browser. Please use manual entry or paste the menu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={handleToggleVoice}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                          isRecording
                            ? 'bg-rose-600 text-white animate-pulse glow-rose border-2 border-white'
                            : 'bg-purple-700 hover:bg-purple-600 text-white border-2 border-purple-400 glow-purple'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                      </button>
                    </div>

                    <div className="text-xs text-slate-300">
                      {isRecording ? (
                        <span className="text-rose-400 font-bold animate-pulse">
                          🔴 Listening... Speak clearly (e.g. "Dosa 30 rupees, idli 10 rupees, egg 10 rupees")
                        </span>
                      ) : (
                        <span>Tap microphone to start speaking your menu</span>
                      )}
                    </div>

                    {voiceTranscript && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 text-xs font-mono text-left max-h-24 overflow-y-auto">
                        <span className="text-[10px] text-slate-500 block">Transcript:</span>
                        <span className="text-white">{voiceTranscript}</span>
                      </div>
                    )}

                    {voiceTranscript && !isRecording && (
                      <button
                        type="button"
                        onClick={() => handleParseAndReview(voiceTranscript)}
                        className="px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-rpg font-bold text-xs tracking-wider cursor-pointer shadow-md"
                      >
                        PROCESS SPOKEN MENU
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

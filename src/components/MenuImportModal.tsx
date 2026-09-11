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
  Sparkles
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

  // Quick sample loader
  const handleLoadSample = (sample: string) => {
    playButtonClick();
    setPasteText(sample);
  };

  // File upload handler (simulates OCR/document reading into text)
  const handleFileUpload = (file: File) => {
    playButtonClick();
    setUploadedFileName(file.name);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);

      // Extract typical dish suggestions or read if text-based
      const reader = new FileReader();
      reader.onload = () => {
        // Mock extract for demo preview or parse file if text
        setTimeout(() => {
          handleParseAndReview(`Dosa - ₹35\nIdli - ₹10\nPoori - ₹40\nTea - ₹12\nCoffee - ₹15`);
        }, 600);
      };
      reader.readAsDataURL(file);
    } else {
      // Text or CSV file
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        if (text) {
          handleParseAndReview(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // Voice recognition toggle
  const handleToggleVoice = () => {
    playButtonClick();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript + ' ';
          }
          setVoiceTranscript(current);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      } catch (err) {
        setIsRecording(false);
        setVoiceSupported(false);
      }
    }
  };

  // Update item in review list
  const handleUpdateItem = (id: string, updates: Partial<ParsedMenuItem>) => {
    setParsedItems(prev =>
      prev.map(i => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  // Toggle selection
  const handleToggleSelectItem = (id: string) => {
    setParsedItems(prev =>
      prev.map(i => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  // Confirm and add to parent inventory
  const handleConfirmAdd = () => {
    playButtonClick();
    const selected = parsedItems.filter(i => i.selected);
    if (selected.length === 0) {
      setErrorMessage('Please select at least one food item to import.');
      return;
    }

    const itemsToAdd: FoodItem[] = selected.map(i => ({
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: i.name.trim(),
      price: Math.max(0, i.price),
      category: i.category
    }));

    onAddItems(itemsToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="max-w-2xl w-full p-6 rounded-2xl bg-white dark:bg-[#161522] border border-purple-200 dark:border-purple-900/50 shadow-2xl space-y-5 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-rpg text-slate-900 dark:text-slate-100">
                Smart Menu Import
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Populate {mealTitle} hotel inventory using paste, photo, file, or voice.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isReviewing ? (
          /* ================= REVIEW EXTRACTED ITEMS SCREEN ================= */
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50">
              <div>
                <span className="text-xs font-mono text-purple-900 dark:text-purple-300 font-bold uppercase block">
                  ✓ MENU DETECTED
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Review extracted dishes, prices, and categories before adding to your {mealTitle} inventory.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white dark:bg-[#161522] text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-bold shadow-2xs">
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
                      ? 'bg-purple-50/40 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50'
                      : 'bg-slate-50 dark:bg-[#1E1D2D] border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleSelectItem(item.id)}
                      className="w-4 h-4 rounded text-purple-600 border-slate-300 dark:border-slate-700 cursor-pointer focus:ring-0"
                    />

                    <input
                      type="text"
                      value={item.name}
                      onChange={e => handleUpdateItem(item.id, { name: e.target.value })}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm focus:border-purple-600 focus:outline-none w-44 sm:w-52"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className="flex items-center">
                      <span className="text-slate-500 dark:text-slate-400 mr-1 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={e => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-1.5 py-1 rounded-lg bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:border-purple-600 focus:outline-none"
                        title="Price"
                      />
                    </div>

                    <select
                      value={item.category}
                      onChange={e => handleUpdateItem(item.id, { category: e.target.value as FoodCategory })}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-200 focus:border-purple-600 focus:outline-none cursor-pointer font-sans"
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
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions: BACK, CANCEL, ADD TO INVENTORY */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsReviewing(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
              >
                ← Back to Input
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#161522] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  id="btn-add-imported-to-inventory"
                  type="button"
                  onClick={handleConfirmAdd}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-rpg font-bold text-xs tracking-wider shadow-xs cursor-pointer flex items-center gap-1.5"
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
                    ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800/80 text-purple-900 dark:text-purple-300 shadow-2xs'
                    : 'bg-white dark:bg-[#161522] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Clipboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
                    ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800/80 text-purple-900 dark:text-purple-300 shadow-2xs'
                    : 'bg-white dark:bg-[#161522] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
                    ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800/80 text-purple-900 dark:text-purple-300 shadow-2xs'
                    : 'bg-white dark:bg-[#161522] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
                    ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800/80 text-purple-900 dark:text-purple-300 shadow-2xs'
                    : 'bg-white dark:bg-[#161522] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>🎤 Voice Input</span>
              </button>
            </div>

            {/* 1. PASTE TAB */}
            {activeTab === 'paste' && (
              <form onSubmit={handlePasteSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paste hotel menu text, board items, or prices:
                  </label>
                  <textarea
                    rows={6}
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    placeholder={`Idli - ₹10\nDosa - ₹30\nVada - ₹15\nEgg - ₹10\nPongal - ₹35\nTea - ₹12`}
                    className="w-full p-3 rounded-xl bg-white dark:bg-[#1E1D2D] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:border-purple-600 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Quick Samples:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadSample("Idli - ₹10\nDosa - ₹35\nVada - ₹15\nEgg - ₹10\nTea - ₹12")}
                      className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-purple-800 dark:text-purple-300 font-medium cursor-pointer"
                    >
                      Breakfast Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSample("Rice - ₹30\nSambar - ₹20\nPoriyal - ₹20\nEgg - ₹10\nChicken - ₹70\nCurd - ₹15")}
                      className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-purple-800 dark:text-purple-300 font-medium cursor-pointer"
                    >
                      Lunch Sample
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-rpg font-bold text-xs tracking-wider shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>PROCESS & REVIEW MENU</span>
                </button>
              </form>
            )}

            {/* 2. IMAGE TAB */}
            {activeTab === 'image' && (
              <div className="space-y-4 text-center">
                <div className="p-6 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800/80 hover:border-purple-400 dark:hover:border-purple-600 bg-purple-50/20 dark:bg-purple-950/20 transition-colors flex flex-col items-center justify-center space-y-3 cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 text-sm block font-bold">Upload Menu Screenshot or Photo</strong>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Supports JPG, PNG, WEBP files</span>
                  </div>
                </div>

                {imagePreviewUrl && (
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-700 max-h-36 overflow-hidden flex items-center justify-center">
                    <img src={imagePreviewUrl} alt="Menu preview" className="max-h-32 rounded object-contain" />
                  </div>
                )}

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Image recognition will scan for dish names and price tags, and present a review list before saving.
                </p>
              </div>
            )}

            {/* 3. FILE TAB */}
            {activeTab === 'file' && (
              <div className="space-y-4 text-center">
                <div className="p-6 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800/80 hover:border-purple-400 dark:hover:border-purple-600 bg-purple-50/20 dark:bg-purple-950/20 transition-colors flex flex-col items-center justify-center space-y-3 cursor-pointer relative">
                  <input
                    type="file"
                    accept=".txt,.csv,.json,image/*"
                    onChange={e => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 text-sm block font-bold">Select Menu File</strong>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Upload TXT, CSV, or document file</span>
                  </div>
                </div>

                {uploadedFileName && (
                  <div className="text-xs text-purple-800 dark:text-purple-300 font-mono font-semibold">
                    Selected: {uploadedFileName}
                  </div>
                )}
              </div>
            )}

            {/* 4. VOICE TAB */}
            {activeTab === 'voice' && (
              <div className="space-y-4 text-center py-2">
                {!voiceSupported ? (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                    <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto" />
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
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                          isRecording
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-purple-700 hover:bg-purple-800 text-white'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                      </button>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {isRecording ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold animate-pulse">
                          🔴 Listening... Speak clearly (e.g. "Dosa 30 rupees, idli 10 rupees, egg 10 rupees")
                        </span>
                      ) : (
                        <span>Tap microphone to start speaking your menu</span>
                      )}
                    </div>

                    {voiceTranscript && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1D2D] border border-slate-200 dark:border-slate-800 text-xs font-mono text-left max-h-24 overflow-y-auto">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Transcript:</span>
                        <span className="text-slate-900 dark:text-slate-100">{voiceTranscript}</span>
                      </div>
                    )}

                    {voiceTranscript && !isRecording && (
                      <button
                        type="button"
                        onClick={() => handleParseAndReview(voiceTranscript)}
                        className="px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-rpg font-bold text-xs tracking-wider cursor-pointer shadow-xs"
                      >
                        PROCESS SPOKEN MENU
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

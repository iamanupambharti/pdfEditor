import React, { useState } from 'react';
import type { SettingsState, PaperTone } from '../types/document';
import { 
  Settings, 
  X, 
  Clock, 
  Volume2, 
  Calendar, 
  Layers, 
  Keyboard, 
  Check
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onSaveSettings: (newSettings: SettingsState) => void;
  theme?: 'dark' | 'light';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'general' | 'study' | 'shortcuts'>('general');
  const [formState, setFormState] = useState<SettingsState>({ ...settings });

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className={`w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#11151F] border-white/10 text-slate-200'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-600/20 text-indigo-400'}`}>
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>FocusDeck Settings</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Customize study metrics, timers, and preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-800' : 'hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className={`flex border-b px-5 gap-4 text-xs font-medium ${isLight ? 'border-slate-200 bg-white' : 'border-white/10'}`}>
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'general'
                ? isLight ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-indigo-500 text-indigo-400 font-semibold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> General
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'study'
                ? isLight ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-indigo-500 text-indigo-400 font-semibold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Study & Timer
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'shortcuts'
                ? isLight ? 'border-indigo-600 text-indigo-600 font-semibold' : 'border-indigo-500 text-indigo-400 font-semibold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" /> Shortcuts
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className={`font-medium block mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Cognitive Study Time Estimate per Pruned Page
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formState.minutesSavedPerPage}
                    onChange={(e) => setFormState({ ...formState, minutesSavedPerPage: Number(e.target.value) })}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <span className={`font-mono font-semibold w-16 text-right ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                    {formState.minutesSavedPerPage} mins/p
                  </span>
                </div>
                <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  Adjusts how many minutes of study burden you save for each pruned slide or page.
                </p>
              </div>

              <div>
                <label className={`font-medium block mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Default Paper Tone Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'sepia', 'night'] as PaperTone[]).map((tone) => (
                    <button
                      type="button"
                      key={tone}
                      onClick={() => setFormState({ ...formState, defaultPaperTone: tone })}
                      className={`py-2 px-3 rounded-lg border text-center font-medium capitalize transition-all cursor-pointer ${
                        formState.defaultPaperTone === tone
                          ? isLight ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs' : 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-[#171C29] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Study & Timer Tab */}
          {activeTab === 'study' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Study (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formState.pomodoroStudyMinutes}
                    onChange={(e) => setFormState({ ...formState, pomodoroStudyMinutes: Number(e.target.value) })}
                    className={`w-full rounded-lg px-2.5 py-1.5 outline-none font-mono border focus:border-indigo-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#171C29] border-white/10 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Short Break</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formState.pomodoroShortBreakMinutes}
                    onChange={(e) => setFormState({ ...formState, pomodoroShortBreakMinutes: Number(e.target.value) })}
                    className={`w-full rounded-lg px-2.5 py-1.5 outline-none font-mono border focus:border-indigo-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#171C29] border-white/10 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Long Break</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={formState.pomodoroLongBreakMinutes}
                    onChange={(e) => setFormState({ ...formState, pomodoroLongBreakMinutes: Number(e.target.value) })}
                    className={`w-full rounded-lg px-2.5 py-1.5 outline-none font-mono border focus:border-indigo-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#171C29] border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`font-medium block mb-1 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  <Volume2 className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} /> Acoustic Synthesizer Chime
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.chimeEnabled}
                      onChange={(e) => setFormState({ ...formState, chimeEnabled: e.target.checked })}
                      className="accent-indigo-500 cursor-pointer"
                    />
                    <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>Play chime on interval end</span>
                  </label>
                </div>
              </div>

              <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <label className={`font-medium block mb-1 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  <Calendar className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} /> Target Exam Countdown
                </label>
                <input
                  type="date"
                  value={formState.examDate || ''}
                  onChange={(e) => setFormState({ ...formState, examDate: e.target.value || null })}
                  className={`w-full rounded-lg px-2.5 py-1.5 outline-none font-mono border focus:border-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#171C29] border-white/10 text-white'
                  }`}
                />
                <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  Displays live days-to-go chip in the cognitive relief banner.
                </p>
              </div>
            </div>
          )}

          {/* Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-2 text-xs">
              {[
                { label: 'Prune / Restore Page', key: 'Delete' },
                { label: 'Freehand Pen Tool', key: 'P' },
                { label: 'Smart Highlighter', key: 'H' },
                { label: 'Sticky Text Note', key: 'T' },
                { label: 'Geometric Shapes', key: 'S' },
                { label: 'Toggle Zen Cram Mode', key: 'Z or F11' },
                { label: 'Command Palette', key: 'Ctrl + K' },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`flex items-center justify-between p-2 rounded ${
                    isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-[#171C29] text-slate-300'
                  }`}
                >
                  <span>{s.label}</span>
                  <kbd className={`font-mono px-1.5 py-0.5 rounded border text-[11px] ${
                    isLight ? 'bg-white border-slate-300 text-slate-700 shadow-2xs' : 'bg-[#0A0D14] border-white/10 text-slate-400'
                  }`}>
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          )}

          {/* Footer Save Button */}
          <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer ${
                isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" /> Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

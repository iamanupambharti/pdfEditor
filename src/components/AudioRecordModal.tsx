import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Check, X } from 'lucide-react';
import { AudioService } from '../services/audioService';

interface AudioRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageNumber: number;
  onSaveAudioMemo: (title: string, audioBase64: string, durationSeconds: number) => void;
}

export const AudioRecordModal: React.FC<AudioRecordModalProps> = ({
  isOpen,
  onClose,
  pageNumber,
  onSaveAudioMemo,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [title, setTitle] = useState('');
  const audioServiceRef = useRef<AudioService>(new AudioService());
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(`Page ${pageNumber} Revision Memo`);
      setElapsedSeconds(0);
      setIsRecording(false);
    }
  }, [isOpen, pageNumber]);

  const handleStart = async () => {
    try {
      await audioServiceRef.current.startRecording();
      setIsRecording(true);
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      alert(`Microphone access error: ${err.message || err}`);
    }
  };

  const handleStopAndSave = async () => {
    try {
      clearInterval(timerRef.current);
      const { audioBase64, durationSeconds } = await audioServiceRef.current.stopRecording();
      setIsRecording(false);
      onSaveAudioMemo(title.trim() || `Page ${pageNumber} Memo`, audioBase64, durationSeconds);
      onClose();
    } catch (err: any) {
      alert(`Save memo failed: ${err.message || err}`);
    }
  };

  const handleCancel = () => {
    clearInterval(timerRef.current);
    if (isRecording) {
      audioServiceRef.current.stopRecording().catch(() => {});
    }
    setIsRecording(false);
    onClose();
  };

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-600/20 text-rose-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100">
                Record Voice Memo
              </h3>
              <p className="text-xs text-slate-400">Attach audio explanation to Page {pageNumber}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Memo title (e.g. Formula derivation shortcut)"
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
        />

        {/* Visual Pulse Recorder Stage */}
        <div className="py-6 flex flex-col items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="relative mb-3">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-35" />
            )}
            <button
              onClick={isRecording ? handleStopAndSave : handleStart}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          <div className="font-mono text-base font-bold text-slate-200">
            {formatTime(elapsedSeconds)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isRecording ? 'Recording active... Tap square to stop & save' : 'Tap mic to start recording'}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          {isRecording && (
            <button
              onClick={handleStopAndSave}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/30"
            >
              <Check className="w-3.5 h-3.5" /> Save Memo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

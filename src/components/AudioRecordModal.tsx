import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Check, X } from 'lucide-react';
import { AudioService } from '../services/audioService';

interface AudioRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageNumber: number;
  onSaveAudioMemo: (title: string, audioBase64: string, durationSeconds: number) => void;
  theme?: 'dark' | 'light';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 select-none">
      <div 
        className="w-full max-w-sm border rounded-2xl shadow-2xl p-5 space-y-4"
        style={{
          background: '#1A1A1D',
          borderColor: 'rgba(255,255,255,.14)',
          color: '#F1EFEA'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#F1EFEA]">
                Record Voice Memo
              </h3>
              <p className="text-xs text-[#A3A09A]">Attach audio explanation to Page {pageNumber}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-[#A3A09A] hover:text-[#F1EFEA] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Memo title (e.g. Formula derivation shortcut)"
          className="w-full rounded-lg px-3 py-1.5 text-xs outline-none border border-white/10 bg-[#131315] text-[#F1EFEA] placeholder-[#A3A09A] focus:border-[#DDD8CC]"
        />

        {/* Visual Pulse Recorder Stage */}
        <div className="py-6 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#131315]">
          <div className="relative mb-3">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-35" />
            )}
            <button
              onClick={isRecording ? handleStopAndSave : handleStart}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-[#FB7185] hover:bg-[#E11D48] text-[#151513]'
              }`}
            >
              {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          <div className="font-mono text-base font-bold text-[#F1EFEA]">
            {formatTime(elapsedSeconds)}
          </div>
          <p className="text-[11px] mt-1 text-[#A3A09A]">
            {isRecording ? 'Recording active... Tap square to stop & save' : 'Tap mic to start recording'}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg text-xs text-[#A3A09A] hover:text-[#F1EFEA] cursor-pointer"
          >
            Cancel
          </button>
          {isRecording && (
            <button
              onClick={handleStopAndSave}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Save Memo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

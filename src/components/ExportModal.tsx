import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  numPages: number;
  excludedPages: Set<number>;
  onExportCleanPDF: () => Promise<void>;
  onExportProjectBundle: () => Promise<void>;
  theme?: 'dark' | 'light';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  numPages,
  excludedPages,
  onExportCleanPDF,
  onExportProjectBundle,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'cleanPdf' | 'projectBundle'>('cleanPdf');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const total = numPages;
  const pruned = excludedPages.size;
  const active = total - pruned;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      if (selectedFormat === 'cleanPdf') {
        await onExportCleanPDF();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        await onExportProjectBundle();
      }
      onClose();
    } catch (err: any) {
      alert(`Export failed: ${err?.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
      style={{
        background: 'rgba(11,11,13,.75)',
        backdropFilter: 'blur(8px)',
        fontFamily: "'Geist',system-ui,sans-serif",
        color: '#F1EFEA'
      }}
      onClick={onClose}
    >
      <div 
        role="dialog" 
        aria-label="Export your deck" 
        style={{
          position: 'relative',
          width: '640px',
          borderRadius: '24px',
          background: '#1A1A1D',
          border: '1px solid rgba(255,255,255,.14)',
          boxShadow: '0 16px 40px rgba(0,0,0,.45)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 28px 0' }}>
          <div>
            <div style={{ font: "400 30px/1.05 'Instrument Serif',Georgia,serif", letterSpacing: '-.01em', color: '#F1EFEA' }}>
              Export your deck
            </div>
            <div style={{ marginTop: '10px', fontSize: '13px', lineHeight: 1.5, color: '#A3A09A' }}>
              <span className="mono" style={{ color: '#F1EFEA' }}>{active}</span> of {total} pages active · <span className="mono" style={{ color: '#FDA4AF' }}>{pruned}</span> pruned
            </div>
          </div>
          <button 
            aria-label="Close" 
            onClick={onClose} 
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,.08)',
              background: 'none',
              color: '#A3A09A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18 M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Radio Format Cards */}
        <div 
          role="radiogroup" 
          aria-label="Export format" 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
            gap: '16px',
            padding: '24px 28px 0'
          }}
        >
          {/* Card 1: Clean Exam PDF */}
          <button 
            role="radio" 
            aria-checked={selectedFormat === 'cleanPdf'} 
            onClick={() => setSelectedFormat('cleanPdf')}
            style={{
              position: 'relative',
              textAlign: 'left',
              padding: '20px',
              borderRadius: '14px',
              border: selectedFormat === 'cleanPdf' ? '1.5px solid #F1EFEA' : '1px solid rgba(255,255,255,.14)',
              background: selectedFormat === 'cleanPdf' ? 'rgba(241,239,234,.08)' : 'none',
              color: '#F1EFEA',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 150ms ease, background-color 150ms ease'
            }}
          >
            <span 
              style={{
                position: 'absolute',
                right: '14px',
                top: '14px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: selectedFormat === 'cleanPdf' ? '#F1EFEA' : 'transparent',
                border: selectedFormat === 'cleanPdf' ? 'none' : '1.5px solid rgba(255,255,255,.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedFormat === 'cleanPdf' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#151513" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>

            <span 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: selectedFormat === 'cleanPdf' ? 'rgba(241,239,234,.16)' : 'rgba(255,255,255,.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedFormat === 'cleanPdf' ? '#F1EFEA' : '#A3A09A'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
            </span>

            <span style={{ display: 'block', marginTop: '14px', font: "600 15px/1.2 'Geist',sans-serif", letterSpacing: '-.01em', color: '#F1EFEA' }}>
              Clean exam PDF
            </span>
            <span style={{ display: 'block', marginTop: '6px', font: "400 12.5px/1.5 'Geist',sans-serif", color: '#A3A09A' }}>
              Drops the {pruned} pruned pages and bakes ink, shapes and notes into a lightweight standard PDF.
            </span>
            <span className="mono" style={{ display: 'block', marginTop: '14px', font: "500 11px/1 'Geist Mono',monospace", color: '#F1EFEA' }}>
              .pdf · {active} pages
            </span>
          </button>

          {/* Card 2: Full Project Bundle */}
          <button 
            role="radio" 
            aria-checked={selectedFormat === 'projectBundle'} 
            onClick={() => setSelectedFormat('projectBundle')}
            style={{
              position: 'relative',
              textAlign: 'left',
              padding: '20px',
              borderRadius: '14px',
              border: selectedFormat === 'projectBundle' ? '1.5px solid #F1EFEA' : '1px solid rgba(255,255,255,.14)',
              background: selectedFormat === 'projectBundle' ? 'rgba(241,239,234,.08)' : 'none',
              color: '#F1EFEA',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 150ms ease, background-color 150ms ease'
            }}
          >
            <span 
              style={{
                position: 'absolute',
                right: '14px',
                top: '14px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: selectedFormat === 'projectBundle' ? '#F1EFEA' : 'transparent',
                border: selectedFormat === 'projectBundle' ? 'none' : '1.5px solid rgba(255,255,255,.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedFormat === 'projectBundle' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#151513" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>

            <span 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: selectedFormat === 'projectBundle' ? 'rgba(241,239,234,.16)' : 'rgba(255,255,255,.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedFormat === 'projectBundle' ? '#F1EFEA' : '#A3A09A'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m7.5 4.27 9 5.15 M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.29 7 12 12l8.71-5 M12 22V12" />
              </svg>
            </span>

            <span style={{ display: 'block', marginTop: '14px', font: "600 15px/1.2 'Geist',sans-serif", letterSpacing: '-.01em', color: '#F1EFEA' }}>
              Full project bundle
            </span>
            <span style={{ display: 'block', marginTop: '6px', font: "400 12.5px/1.5 'Geist',sans-serif", color: '#A3A09A' }}>
              Source PDF, annotations, voice memos and snapshots in one portable archive you can reopen later.
            </span>
            <span className="mono" style={{ display: 'block', marginTop: '14px', font: "500 11px/1 'Geist Mono',monospace", color: '#A3A09A' }}>
              .fdeck · complete state
            </span>
          </button>
        </div>

        {/* Tip row */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '20px 28px 0',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,.04)',
            fontSize: '12.5px',
            color: '#F1EFEA'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Flatten annotations so they stay put in any standard PDF reader
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 28px' }}>
          <span style={{ fontSize: '12px', color: '#A3A09A' }}>
            Your original PDF is never changed.
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={onClose} 
              className="btn"
              disabled={isExporting}
              style={{ height: '36px', padding: '0 16px' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="btn primary"
              style={{ height: '36px', padding: '0 18px', gap: '8px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" />
              </svg>
              {isExporting ? 'Exporting…' : selectedFormat === 'cleanPdf' ? 'Export clean PDF' : 'Save .fdeck bundle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

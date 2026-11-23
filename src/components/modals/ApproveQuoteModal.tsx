'use client';

import React, { useRef, useState } from 'react';
import { X, CheckCircle2, RotateCcw, PenTool } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSolarStore } from '../../store/useSolarStore';
import { formatINR } from '../../utils/solarCalculations';

interface ApproveQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  netCostInr: number;
  systemKwp: number;
}

export const ApproveQuoteModal: React.FC<ApproveQuoteModalProps> = ({
  isOpen,
  onClose,
  netCostInr,
  systemKwp,
}) => {
  const { clientDetails, updateClientDetails, setSignature } = useSolarStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Form states initialized directly from store
  const [name, setName] = useState(clientDetails.name);
  const [phone, setPhone] = useState(clientDetails.phone);
  const [email, setEmail] = useState(clientDetails.email);

  if (!isOpen) return null;

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0284c7'; // blue ink
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleApprove = () => {
    const canvas = canvasRef.current;
    let signatureUrl = '';
    if (canvas && hasDrawn) {
      signatureUrl = canvas.toDataURL('image/png');
    }

    updateClientDetails({
      name,
      phone,
      email,
    });

    setSignature(signatureUrl);

    // Fire celebratory confetti!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Client Digital Approval</h3>
              <p className="text-xs text-slate-400">Sign off on {systemKwp} kWp Solar PV Proposal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Card */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Agreed Net Payable</span>
            <span className="font-bold text-base text-amber-400 font-mono">{formatINR(netCostInr)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase">Quotation Number</span>
            <span className="font-mono text-slate-300 font-medium">{clientDetails.quotationNumber}</span>
          </div>
        </div>

        {/* Client Contact Inputs */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Full Name / Authorized Signatory</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Digital Signature Pad */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400">Digital Signature (Draw below)</label>
            <button
              onClick={clearCanvas}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="bg-white rounded-xl p-1 border-2 border-dashed border-slate-600 shadow-inner">
            <canvas
              ref={canvasRef}
              width={440}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-28 bg-white cursor-crosshair rounded-lg touch-none"
            />
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            By signing, you confirm acceptance of the solar design specifications, BOM, and financial terms.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Sign Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};

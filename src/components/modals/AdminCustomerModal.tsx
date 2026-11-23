'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  FileText,
  Sparkles,
  Camera,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useSolarStore } from '../../store/useSolarStore';
import { ClientDetails } from '../../types/solar';

interface AdminCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview: () => void;
}

export const AdminCustomerModal: React.FC<AdminCustomerModalProps> = ({
  isOpen,
  onClose,
  onOpenPreview,
}) => {
  const { clientDetails, updateClientDetails, selectedLocation } = useSolarStore();

  const [formData, setFormData] = useState<ClientDetails>({
    ...clientDetails,
  });

  const [snapshotSuccess, setSnapshotSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = <K extends keyof ClientDetails>(field: K, value: ClientDetails[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateQuoteNumber = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quoteNo = `SPEPC-${new Date().getFullYear()}-${randomSuffix}`;
    handleChange('quotationNumber', quoteNo);
  };

  const handleCaptureSnapshot = () => {
    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        handleChange('snapshotDataUrl', dataUrl);
        updateClientDetails({ snapshotDataUrl: dataUrl });
        setSnapshotSuccess(true);
        setTimeout(() => setSnapshotSuccess(false), 2500);
      }
    } catch (e) {
      console.error('Failed to capture 3D snapshot:', e);
    }
  };

  const handleLoadSample = (type: 'delhi' | 'jaipur' | 'bengaluru' | 'commercial') => {
    if (type === 'delhi') {
      const sample: Partial<ClientDetails> = {
        name: 'Dr. Ananya Iyer',
        phone: '+91 98112 34567',
        email: 'ananya.iyer@gmail.com',
        address: 'B-4/12, Vasant Vihar, New Delhi, NCR - 110057',
        consumerNumber: 'BSES-DL-982143',
        sanctionedLoadKw: 8.0,
        connectionPhase: '3-Phase',
        salesRepName: 'Rohit Verma (Senior Solar Consultant)',
        salesRepPhone: '+91 98100 87654',
        validityDays: 30,
        specialDiscountInr: 5000,
        customNotes: 'Includes Delhi Solar Policy subsidy facilitation, high-wind certified elevated structure, and 5-year complimentary quarterly module cleaning.',
      };
      setFormData((prev) => ({ ...prev, ...sample }));
    } else if (type === 'bengaluru') {
      const sample: Partial<ClientDetails> = {
        name: 'Kiran R. Gowda',
        phone: '+91 94480 12345',
        email: 'kiran.gowda@techventures.io',
        address: 'Villa 18, Palm Meadows, Whitefield, Bengaluru, Karnataka - 560066',
        consumerNumber: 'BESCOM-W-654321',
        sanctionedLoadKw: 10.0,
        connectionPhase: '3-Phase',
        salesRepName: 'Pooja Hegde (Renewables Lead)',
        salesRepPhone: '+91 94480 98765',
        validityDays: 30,
        specialDiscountInr: 8000,
        customNotes: 'Bifacial TOPCon modules installed on aluminum Pergola structure for rooftop garden preservation with smart app monitoring.',
      };
      setFormData((prev) => ({ ...prev, ...sample }));
    } else if (type === 'commercial') {
      const sample: Partial<ClientDetails> = {
        name: 'Patel Precision Engineering Pvt Ltd',
        phone: '+91 98250 99887',
        email: 'admin@patelprecision.in',
        address: 'Plot 104, Phase II, GIDC Naroda, Ahmedabad, Gujarat - 382330',
        consumerNumber: 'UGVNL-HT-449102',
        sanctionedLoadKw: 25.0,
        connectionPhase: '3-Phase',
        salesRepName: 'Hitesh Shah (Industrial Energy Head)',
        salesRepPhone: '+91 98250 11223',
        validityDays: 15,
        specialDiscountInr: 15000,
        customNotes: 'Commercial installation eligible for 40% Accelerated Depreciation tax shield under Income Tax Act with CEIG industrial approval.',
      };
      setFormData((prev) => ({ ...prev, ...sample }));
    } else {
      const sample: Partial<ClientDetails> = {
        name: 'Rajesh Sharma',
        phone: '+91 98765 43210',
        email: 'rajesh.sharma@example.com',
        address: 'Plot 42, Sector 5, Vaishali Nagar, Jaipur, Rajasthan - 302021',
        consumerNumber: 'JVVNL-K-892341',
        sanctionedLoadKw: 6.0,
        connectionPhase: '3-Phase',
        salesRepName: 'Amit Saxena (Sr. Solar Engineer)',
        salesRepPhone: '+91 98290 54321',
        validityDays: 30,
        specialDiscountInr: 0,
        customNotes: 'Complete turnkey execution: JVVNL Net Metering approval, chemical earthing pits, and Tier-1 Mono PERC solar modules.',
      };
      setFormData((prev) => ({ ...prev, ...sample }));
    }
  };

  const handleSave = () => {
    updateClientDetails(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleSaveAndPreview = () => {
    updateClientDetails(formData);
    onClose();
    onOpenPreview();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Customer Data & Proposal Setup</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  EPC Admin
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Fill client information, utility details, and custom proposal terms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar text-xs text-slate-200">
          {/* Quick Demo Pre-fill Bar */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Fill Client Lead Presets:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadSample('jaipur')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700 transition-colors"
              >
                Jaipur Villa
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('delhi')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700 transition-colors"
              >
                Delhi Vasant Vihar
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('bengaluru')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700 transition-colors"
              >
                Bengaluru Villa
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('commercial')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700 transition-colors"
              >
                Ahmedabad Factory
              </button>
            </div>
          </div>

          {/* Section 1: Customer Contact & Site Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <User className="w-3.5 h-3.5" />
              <span>1. Customer & Installation Site Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Customer Full Name / Organization *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Phone Number / WhatsApp *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="client@example.com"
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Electricity Consumer / CA / K-Number *</label>
                <input
                  type="text"
                  value={formData.consumerNumber}
                  onChange={(e) => handleChange('consumerNumber', e.target.value)}
                  placeholder="e.g. JVVNL-K-892341"
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-400">Complete Rooftop Site Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Plot number, Street, Landmark, City, State, PIN"
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical & Grid Connection */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>2. Grid Connection & Utility Technical Specs</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Sanctioned Load (kW)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.sanctionedLoadKw || 5.0}
                  onChange={(e) => handleChange('sanctionedLoadKw', parseFloat(e.target.value))}
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Connection Phase</label>
                <select
                  value={formData.connectionPhase || '3-Phase'}
                  onChange={(e) => handleChange('connectionPhase', e.target.value as 'Single Phase' | '3-Phase')}
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="Single Phase">Single Phase (230V)</option>
                  <option value="3-Phase">3-Phase (415V)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">DISCOM Provider</label>
                <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 truncate">
                  {selectedLocation.discom}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Quotation & Commercial Parameters */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>3. Proposal Quotation & Commercial Terms</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400">Quotation Ref ID</label>
                  <button
                    type="button"
                    onClick={handleGenerateQuoteNumber}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Regen</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.quotationNumber}
                  onChange={(e) => handleChange('quotationNumber', e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Proposal Date</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Validity (Days)</label>
                <select
                  value={formData.validityDays || 30}
                  onChange={(e) => handleChange('validityDays', parseInt(e.target.value))}
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value={15}>15 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={45}>45 Days</option>
                  <option value={60}>60 Days</option>
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-slate-400 flex items-center gap-1">
                  <span>Special Admin Promotional Discount (₹)</span>
                  <span className="text-[10px] text-slate-500">(Optional deduction on net payable)</span>
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formData.specialDiscountInr || 0}
                  onChange={(e) => handleChange('specialDiscountInr', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-slate-800/90 border border-slate-700 text-emerald-400 font-mono font-bold rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: EPC Representative & 3D Snapshot */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Camera className="w-3.5 h-3.5" />
              <span>4. EPC Sales Representative & 3D Render Snapshot</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Sales Consultant / Engineer Name</label>
                <input
                  type="text"
                  value={formData.salesRepName || ''}
                  onChange={(e) => handleChange('salesRepName', e.target.value)}
                  placeholder="e.g. Amit Saxena (Sr. Solar Engineer)"
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Sales Consultant Contact Phone</label>
                <input
                  type="text"
                  value={formData.salesRepPhone || ''}
                  onChange={(e) => handleChange('salesRepPhone', e.target.value)}
                  placeholder="+91 98290 54321"
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-400">Custom Scope of Work & Terms (Printed on Proposal)</label>
                <textarea
                  rows={2}
                  value={formData.customNotes || ''}
                  onChange={(e) => handleChange('customNotes', e.target.value)}
                  placeholder="Scope of work, warranty details, dispatch timeline..."
                  className="w-full bg-slate-800/90 border border-slate-700 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* 3D Snapshot Capture Component */}
              <div className="sm:col-span-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>3D Rooftop Simulation Snapshot</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Captures your current 3D viewport with active panels, tilt & shadows to print directly on page 1 of the PDF.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {formData.snapshotDataUrl && (
                    <div className="h-12 w-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.snapshotDataUrl}
                        alt="3D Snapshot Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
                  >
                    {snapshotSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Captured!</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formData.snapshotDataUrl ? 'Retake 3D Snapshot' : 'Capture 3D Snapshot'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {savedSuccess ? 'Saved!' : 'Save Details'}
            </button>

            <button
              type="button"
              onClick={handleSaveAndPreview}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Save & Preview Proposal PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

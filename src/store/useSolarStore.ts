import { create } from 'zustand';
import { SolarState, RoofType, InverterType, PanelTech, CustomerCategory, FinancingType, LocationPreset, Obstruction, ClientDetails } from '../types/solar';
import { INDIAN_LOCATIONS, PANEL_SPECS, DEFAULT_OBSTRUCTIONS } from '../utils/constants';
import { generatePanelGrid } from '../utils/solarCalculations';

const initialPanels = generatePanelGrid(
  'flat_rcc',
  12, // 12m length
  8,  // 8m width
  15, // 15 deg tilt
  0,  // 0 deg South azimuth
  1.8, // 1.8m spacing
  PANEL_SPECS.mono_perc,
  DEFAULT_OBSTRUCTIONS,
  0
);

export const useSolarStore = create<SolarState>((set, get) => ({
  // 3D Roof
  roofType: 'flat_rcc',
  roofLength: 12, // 12 meters (~40 ft)
  roofWidth: 8,   // 8 meters (~26 ft)
  roofHeight: 4.5, // 1.5 floors
  parapetHeight: 0.8, // 80cm parapet
  tiltAngle: 15, // optimal for North/Central India
  azimuthAngle: 0, // True South
  rowSpacing: 1.8,
  elevatedStructureHeight: 2.4, // standard 2.4m clearance for rooftop garden/pergola

  // Obstructions
  obstructions: DEFAULT_OBSTRUCTIONS,

  // Panels
  panels: initialPanels,
  selectedPanelTech: 'mono_perc',

  // Hardware
  inverterType: 'string',
  batteryCapacityKwh: 0,

  // Sun Simulation
  timeOfDayHours: 12.0, // 12:00 PM solar noon
  monthOfYear: 3, // April
  isPlayingDaySimulation: false,
  heatmapMode: false,
  cameraPreset: 'perspective',

  // Site & Consumption
  selectedLocation: INDIAN_LOCATIONS[0], // Jaipur
  monthlyBillInr: 4500,
  gridTariffRate: 8.5, // avg residential slab ₹8.5/unit
  customerCategory: 'residential',
  includeStateSubsidy: true,

  // Financing
  financingType: 'capex',
  downPaymentPercent: 20,
  loanInterestRate: 7.0, // PM Surya Ghar concessional bank loan rate
  loanTenureYears: 5,

  // Client Details
  clientDetails: {
    name: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    email: 'rajesh.sharma@example.com',
    address: 'Plot 42, Sector 5, Vaishali Nagar, Jaipur, Rajasthan - 302021',
    consumerNumber: 'JVVNL-K-892341',
    sanctionedLoadKw: 6.0,
    connectionPhase: '3-Phase',
    epcCompanyName: 'SunPower EPC Solutions Pvt Ltd',
    epcPhone: '+91 98290 12345',
    epcEmail: 'projects@sunpowerepc.in',
    salesRepName: 'Amit Saxena (Sr. Solar Engineer)',
    salesRepPhone: '+91 98290 54321',
    quotationNumber: 'SPEPC-2026-0842',
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    validityDays: 30,
    specialDiscountInr: 0,
    customNotes: 'Scope of work includes complete engineering design, supply of Tier-1 modules, installation, testing, CEIG electrical inspection, and net-metering liaison with the local DISCOM.',
    snapshotDataUrl: '',
  },

  // Actions
  setRoofType: (type: RoofType) => {
    set({ roofType: type });
    get().regeneratePanelLayout();
  },

  setRoofDimensions: (length: number, width: number) => {
    set({ roofLength: length, roofWidth: width });
    get().regeneratePanelLayout();
  },

  setParapetHeight: (height: number) => set({ parapetHeight: height }),

  setTiltAngle: (tilt: number) => {
    set({ tiltAngle: tilt });
    get().regeneratePanelLayout();
  },

  setAzimuthAngle: (azimuth: number) => {
    set({ azimuthAngle: azimuth });
    get().regeneratePanelLayout();
  },

  setRowSpacing: (spacing: number) => {
    set({ rowSpacing: spacing });
    get().regeneratePanelLayout();
  },

  setElevatedStructureHeight: (height: number) => {
    set({ elevatedStructureHeight: height });
    if (get().roofType === 'elevated_pergola') {
      get().regeneratePanelLayout();
    }
  },

  toggleObstruction: (id: string) => {
    set((state) => ({
      obstructions: state.obstructions.map((obs) =>
        obs.id === id ? { ...obs, enabled: !obs.enabled } : obs
      ),
    }));
    get().regeneratePanelLayout();
  },

  updateObstruction: (id: string, updates: Partial<Obstruction>) => {
    set((state) => ({
      obstructions: state.obstructions.map((obs) =>
        obs.id === id ? { ...obs, ...updates } : obs
      ),
    }));
    get().regeneratePanelLayout();
  },

  togglePanel: (id: string) => {
    set((state) => ({
      panels: state.panels.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      ),
    }));
  },

  enableAllPanels: () => {
    set((state) => ({
      panels: state.panels.map((p) => ({ ...p, enabled: true })),
    }));
  },

  disableAllPanels: () => {
    set((state) => ({
      panels: state.panels.map((p) => ({ ...p, enabled: false })),
    }));
  },

  regeneratePanelLayout: () => {
    const s = get();
    const panelSpec = PANEL_SPECS[s.selectedPanelTech];
    const newPanels = generatePanelGrid(
      s.roofType,
      s.roofLength,
      s.roofWidth,
      s.tiltAngle,
      s.azimuthAngle,
      s.rowSpacing,
      panelSpec,
      s.obstructions,
      s.elevatedStructureHeight
    );
    set({ panels: newPanels });
  },

  setSelectedPanelTech: (tech: PanelTech) => {
    set({ selectedPanelTech: tech });
    get().regeneratePanelLayout();
  },

  setInverterType: (inverter: InverterType) => set({ inverterType: inverter }),
  setBatteryCapacity: (kwh: number) => set({ batteryCapacityKwh: kwh }),

  setTimeOfDay: (hours: number) => set({ timeOfDayHours: hours }),
  setMonthOfYear: (month: number) => set({ monthOfYear: month }),
  setIsPlayingDaySimulation: (playing: boolean) => set({ isPlayingDaySimulation: playing }),
  setHeatmapMode: (active: boolean) => set({ heatmapMode: active }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  setLocation: (location: LocationPreset) => set({ selectedLocation: location }),
  setMonthlyBill: (bill: number) => set({ monthlyBillInr: bill }),
  setGridTariffRate: (rate: number) => set({ gridTariffRate: rate }),
  setCustomerCategory: (category: CustomerCategory) => set({ customerCategory: category }),
  setIncludeStateSubsidy: (include: boolean) => set({ includeStateSubsidy: include }),

  setFinancingType: (type: FinancingType) => set({ financingType: type }),
  setDownPaymentPercent: (percent: number) => set({ downPaymentPercent: percent }),
  setLoanInterestRate: (rate: number) => set({ loanInterestRate: rate }),
  setLoanTenureYears: (years: number) => set({ loanTenureYears: years }),

  updateClientDetails: (details: Partial<ClientDetails>) => {
    set((state) => ({
      clientDetails: { ...state.clientDetails, ...details },
    }));
  },

  setSignature: (dataUrl: string) => {
    set((state) => ({
      clientDetails: {
        ...state.clientDetails,
        signatureDataUrl: dataUrl,
        approvedAt: new Date().toISOString(),
      },
    }));
  },

  loadShareData: (data: Partial<SolarState>) => {
    set((state) => ({ ...state, ...data }));
    get().regeneratePanelLayout();
  },

  resetToDefaults: () => {
    set({
      roofType: 'flat_rcc',
      roofLength: 12,
      roofWidth: 8,
      tiltAngle: 15,
      azimuthAngle: 0,
      rowSpacing: 1.8,
      selectedPanelTech: 'mono_perc',
      inverterType: 'string',
      batteryCapacityKwh: 0,
      timeOfDayHours: 12,
      monthOfYear: 3,
      isPlayingDaySimulation: false,
      heatmapMode: false,
      selectedLocation: INDIAN_LOCATIONS[0],
      monthlyBillInr: 4500,
      gridTariffRate: 8.5,
      customerCategory: 'residential',
      financingType: 'capex',
    });
    get().regeneratePanelLayout();
  },
}));

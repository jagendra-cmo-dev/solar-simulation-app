export type RoofType = 'flat_rcc' | 'tin_shed' | 'elevated_pergola';

export type InverterType = 'string' | 'microinverter' | 'hybrid';

export type PanelTech = 'mono_perc' | 'topcon_bifacial' | 'hjt_high_eff';

export type CustomerCategory = 'residential' | 'commercial';

export type FinancingType = 'capex' | 'loan';

export interface LocationPreset {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  psh: number; // Peak Sun Hours per day
  discom: string;
  stateSubsidyPerKw?: number;
  maxStateSubsidy?: number;
}

export interface PanelSpec {
  id: PanelTech;
  name: string;
  wattage: number; // in Wp, e.g. 540, 585, 600
  efficiency: number; // percentage, e.g. 21.5
  tempCoeff: number; // % per °C
  bifacialGain: number; // percentage gain, e.g. 10%
  width: number; // in meters (e.g. 1.134)
  length: number; // in meters (e.g. 2.278)
  pricePerWp: number; // base price in INR
  warrantyYears: number;
}

export interface Obstruction {
  id: string;
  name: string;
  type: 'water_tank' | 'staircase_mumty' | 'ac_outdoor' | 'chimney';
  enabled: boolean;
  x: number; // relative to roof center in meters
  y: number; // height offset or Z
  z: number;
  width: number;
  length: number;
  height: number;
}

export interface PlacedPanel {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  z: number;
  tilt: number;
  azimuth: number;
  enabled: boolean;
  shadingLoss: number; // estimated shading loss factor 0 - 1
  irradianceScore: number; // 0 - 100 for heatmap
}

export interface BomItem {
  id: string;
  category: 'Electrical' | 'Structural' | 'Balance of System' | 'Services';
  name: string;
  specification: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalPrice: number;
  hsnCode: string;
}

export interface MonthlyData {
  month: string;
  shortMonth: string;
  solarGenerationKwh: number;
  gridConsumptionKwh: number;
  savingsInr: number;
  sunHours: number;
}

export interface YearlyCashflow {
  year: number;
  generationKwh: number;
  gridRateInr: number;
  annualSavingsInr: number;
  cumulativeSavingsInr: number;
  loanEmiInr: number;
  netCashflowInr: number;
  panelEfficiency: number;
}

export interface ClientDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  consumerNumber: string;
  sanctionedLoadKw?: number;
  connectionPhase?: 'Single Phase' | '3-Phase' | '1-Phase';
  epcCompanyName: string;
  epcPhone: string;
  epcEmail: string;
  salesRepName?: string;
  salesRepPhone?: string;
  quotationNumber: string;
  date: string;
  validityDays?: number;
  specialDiscountInr?: number;
  customNotes?: string;
  snapshotDataUrl?: string;
  signatureDataUrl?: string;
  approvedAt?: string;
}

export interface SolarState {
  // 3D Roof & Architecture
  roofType: RoofType;
  roofLength: number; // meters (East-West)
  roofWidth: number; // meters (North-South)
  roofHeight: number; // building height in meters
  parapetHeight: number; // meters
  tiltAngle: number; // degrees (e.g. 12-25)
  azimuthAngle: number; // degrees (0 = South, -90 = East, 90 = West)
  rowSpacing: number; // pitch distance in meters
  elevatedStructureHeight: number; // for elevated pergola (e.g. 2.5m)
  
  // Obstructions
  obstructions: Obstruction[];
  
  // Panels State
  panels: PlacedPanel[];
  selectedPanelTech: PanelTech;
  
  // Hardware Selection
  inverterType: InverterType;
  batteryCapacityKwh: number; // 0 means no battery
  
  // Sun Simulation
  timeOfDayHours: number; // 6.0 to 18.0
  monthOfYear: number; // 0 (Jan) to 11 (Dec)
  isPlayingDaySimulation: boolean;
  heatmapMode: boolean;
  showSunPath: boolean;
  isRainy: boolean;
  cameraPreset: 'perspective' | 'top_cad' | 'south_elevation' | 'solar_noon';

  // Site & Consumption Inputs
  selectedLocation: LocationPreset;
  monthlyBillInr: number;
  gridTariffRate: number; // INR per kWh
  customerCategory: CustomerCategory;
  includeStateSubsidy: boolean;

  // Financial Settings
  financingType: FinancingType;
  downPaymentPercent: number; // e.g. 20%
  loanInterestRate: number; // annual % e.g. 7.0%
  loanTenureYears: number; // e.g. 5 years

  // Client Details & Signoff
  clientDetails: ClientDetails;

  // Actions
  setRoofType: (type: RoofType) => void;
  setRoofDimensions: (length: number, width: number) => void;
  setParapetHeight: (height: number) => void;
  setTiltAngle: (tilt: number) => void;
  setAzimuthAngle: (azimuth: number) => void;
  setRowSpacing: (spacing: number) => void;
  setElevatedStructureHeight: (height: number) => void;
  
  toggleObstruction: (id: string) => void;
  updateObstruction: (id: string, updates: Partial<Obstruction>) => void;
  
  togglePanel: (id: string) => void;
  enableAllPanels: () => void;
  disableAllPanels: () => void;
  regeneratePanelLayout: () => void;
  
  setSelectedPanelTech: (tech: PanelTech) => void;
  setInverterType: (inverter: InverterType) => void;
  setBatteryCapacity: (kwh: number) => void;
  
  setTimeOfDay: (hours: number) => void;
  setMonthOfYear: (month: number) => void;
  setIsPlayingDaySimulation: (playing: boolean) => void;
  setHeatmapMode: (active: boolean) => void;
  setShowSunPath: (show: boolean) => void;
  setIsRainy: (isRainy: boolean) => void;
  setCameraPreset: (preset: 'perspective' | 'top_cad' | 'south_elevation' | 'solar_noon') => void;
  
  setLocation: (location: LocationPreset) => void;
  setMonthlyBill: (bill: number) => void;
  setGridTariffRate: (rate: number) => void;
  setCustomerCategory: (category: CustomerCategory) => void;
  setIncludeStateSubsidy: (include: boolean) => void;
  
  setFinancingType: (type: FinancingType) => void;
  setDownPaymentPercent: (percent: number) => void;
  setLoanInterestRate: (rate: number) => void;
  setLoanTenureYears: (years: number) => void;
  
  updateClientDetails: (details: Partial<ClientDetails>) => void;
  setSignature: (dataUrl: string) => void;
  
  // Quick presets
  loadShareData: (data: Partial<SolarState>) => void;
  resetToDefaults: () => void;
}

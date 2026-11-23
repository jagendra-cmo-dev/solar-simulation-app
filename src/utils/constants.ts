import { LocationPreset, PanelSpec, Obstruction } from '../types/solar';

export const INDIAN_LOCATIONS: LocationPreset[] = [
  {
    id: 'jaipur',
    name: 'Jaipur, Rajasthan',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    psh: 5.45,
    discom: 'JVVNL (Jaipur Vidyut Vitran Nigam)',
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  {
    id: 'delhi',
    name: 'New Delhi, NCR',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    psh: 5.05,
    discom: 'BSES Rajdhani / Yamuna Power',
    stateSubsidyPerKw: 2000,
    maxStateSubsidy: 10000,
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad, Gujarat',
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    psh: 5.35,
    discom: 'UGVNL / Torrent Power',
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  {
    id: 'mumbai',
    name: 'Mumbai, Maharashtra',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    psh: 4.90,
    discom: 'MSEDCL / Adani Electricity / Tata Power',
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru, Karnataka',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    psh: 5.15,
    discom: 'BESCOM',
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad, Telangana',
    state: 'Telangana',
    lat: 17.3850,
    lng: 78.4867,
    psh: 5.25,
    discom: 'TSSPDCL',
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  {
    id: 'chennai',
    name: 'Chennai, Tamil Nadu',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    psh: 5.20,
    discom: 'TANGEDCO',
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  {
    id: 'pune',
    name: 'Pune, Maharashtra',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    psh: 5.10,
    discom: 'MSEDCL',
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  {
    id: 'lucknow',
    name: 'Lucknow, Uttar Pradesh',
    state: 'Uttar Pradesh',
    lat: 26.8467,
    lng: 80.9462,
    psh: 4.85,
    discom: 'MVVNL / UPPCL',
    stateSubsidyPerKw: 15000,
    maxStateSubsidy: 30000,
  },
  {
    id: 'kolkata',
    name: 'Kolkata, West Bengal',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    psh: 4.65,
    discom: 'CESC / WBSEDCL',
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
];

export const PANEL_SPECS: Record<string, PanelSpec> = {
  mono_perc: {
    id: 'mono_perc',
    name: '540 Wp Mono PERC (Silver Frame)',
    wattage: 540,
    efficiency: 21.2,
    tempCoeff: -0.35,
    bifacialGain: 0,
    width: 1.134,
    length: 2.278,
    pricePerWp: 21.5,
    warrantyYears: 25,
  },
  topcon_bifacial: {
    id: 'topcon_bifacial',
    name: '585 Wp N-Type TOPCon Dual-Glass Bifacial',
    wattage: 585,
    efficiency: 22.6,
    tempCoeff: -0.30,
    bifacialGain: 10,
    width: 1.134,
    length: 2.278,
    pricePerWp: 24.0,
    warrantyYears: 30,
  },
  hjt_high_eff: {
    id: 'hjt_high_eff',
    name: '600 Wp Heterojunction (HJT) Ultra-Black',
    wattage: 600,
    efficiency: 23.3,
    tempCoeff: -0.26,
    bifacialGain: 12,
    width: 1.134,
    length: 2.278,
    pricePerWp: 28.0,
    warrantyYears: 30,
  },
};

export const DEFAULT_OBSTRUCTIONS: Obstruction[] = [
  {
    id: 'water_tank_1',
    name: 'Overhead Sintex Water Tank',
    type: 'water_tank',
    enabled: true,
    x: -3.0,
    y: 0,
    z: -2.0,
    width: 1.5,
    length: 1.5,
    height: 1.8,
  },
  {
    id: 'staircase_mumty_1',
    name: 'Staircase Mumty / Roof Cabin',
    type: 'staircase_mumty',
    enabled: true,
    x: 3.2,
    y: 0,
    z: -1.8,
    width: 2.4,
    length: 2.8,
    height: 2.5,
  },
  {
    id: 'ac_unit_1',
    name: 'Split AC Outdoor Compressor',
    type: 'ac_outdoor',
    enabled: true,
    x: -3.5,
    y: 0,
    z: 2.5,
    width: 0.9,
    length: 0.5,
    height: 0.75,
  },
];

// Monthly solar insolation relative distribution for Indian sub-continent (Jan - Dec)
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_WEIGHTS = [
  0.88, // Jan: clear winter skies
  0.96, // Feb
  1.08, // Mar: high spring insolation
  1.14, // Apr: very high
  1.18, // May: peak summer
  0.98, // Jun: monsoon onset
  0.82, // Jul: heavy monsoon clouds
  0.80, // Aug: monsoon
  0.92, // Sep: post-monsoon clearing
  1.02, // Oct: clear autumn
  0.94, // Nov: winter sun
  0.86  // Dec
];


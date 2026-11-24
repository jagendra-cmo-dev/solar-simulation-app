import { LocationPreset, PanelSpec, Obstruction, PlacedPanel, MonthlyData, YearlyCashflow, CustomerCategory, FinancingType, InverterType, RoofType } from '../types/solar';
import { MONTH_NAMES, MONTH_WEIGHTS } from './constants';

// Format Indian Currency (e.g. ₹1,45,000)
export function formatINR(val: number, includeDecimals = false): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  const rounded = includeDecimals ? Math.round(val * 100) / 100 : Math.round(val);
  const isNegative = rounded < 0;
  const absVal = Math.abs(rounded);

  const str = includeDecimals ? absVal.toFixed(2) : Math.floor(absVal).toString();
  const parts = str.split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedWhole = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const result = parts.length > 1 ? `${formattedWhole}.${parts[1]}` : formattedWhole;
  return `${isNegative ? '-' : ''}₹${result}`;
}

export function formatLakhs(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return formatINR(val);
}

// 1. Sun Position & Light Vector Math
export interface SunPositionResult {
  altitudeDeg: number;
  azimuthDeg: number;
  lightPosition: [number, number, number];
  intensity: number;
  color: string;
  isNight: boolean;
}

export function calculateSunPosition(
  timeOfDayHours: number,
  monthOfYear: number,
  latitude: number = 26.9124,
  radius: number = 45
): SunPositionResult {
  // Approximate day of year for the middle of each month
  const dayOfYear = [15, 45, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349][monthOfYear] || 80;

  // Solar declination in radians
  const declinationRad = 23.45 * Math.sin(((284 + dayOfYear) / 365) * 2 * Math.PI) * (Math.PI / 180);
  const latRad = latitude * (Math.PI / 180);

  // Hour angle in radians (12 noon = 0, each hour = 15 deg)
  const hourAngleRad = (timeOfDayHours - 12) * 15 * (Math.PI / 180);

  // Solar altitude (elevation) in radians
  const sinAltitude = Math.sin(latRad) * Math.sin(declinationRad) +
    Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad);

  const altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAltitude)));
  const altitudeDeg = altitudeRad * (180 / Math.PI);

  // Solar azimuth in radians
  let azimuthRad = 0;
  if (Math.cos(altitudeRad) !== 0) {
    const cosAzimuth = (Math.sin(altitudeRad) * Math.sin(latRad) - Math.sin(declinationRad)) /
      (Math.cos(altitudeRad) * Math.cos(latRad));
    azimuthRad = Math.acos(Math.max(-1, Math.min(1, cosAzimuth)));
    if (hourAngleRad > 0) {
      azimuthRad = 2 * Math.PI - azimuthRad;
    }
  }
  const azimuthDeg = azimuthRad * (180 / Math.PI);

  const isNight = altitudeDeg <= 2;

  // Three.js coordinates:
  // X: East (-) to West (+), Z: North (-) to South (+)
  const x = -radius * Math.cos(altitudeRad) * Math.sin(azimuthRad);
  const y = Math.max(1.5, radius * Math.sin(altitudeRad));
  const z = radius * Math.cos(altitudeRad) * Math.cos(azimuthRad);

  // Dynamic light color based on sun angle (golden hour vs noon)
  let color = '#fff8e7'; // warm sunlight
  let intensity = 2.4;

  if (altitudeDeg < 12) {
    color = '#ff9f43'; // dawn/dusk orange gold
    intensity = Math.max(0.4, (altitudeDeg / 12) * 1.5);
  } else if (altitudeDeg < 30) {
    color = '#ffeaa7'; // golden morning/evening
    intensity = 1.8 + (altitudeDeg / 30) * 0.5;
  } else {
    color = '#ffffff'; // pure noon daylight
    intensity = 2.6;
  }

  if (isNight) {
    intensity = 0.2;
    color = '#74b9ff'; // moonlit ambient
  }

  return {
    altitudeDeg: Math.round(altitudeDeg * 10) / 10,
    azimuthDeg: Math.round(azimuthDeg * 10) / 10,
    lightPosition: [x, y, z],
    intensity,
    color,
    isNight,
  };
}

export function getSolarTimes(monthOfYear: number, latitude: number = 26.9124) {
  const dayOfYear = [15, 45, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349][monthOfYear] || 80;
  const declinationRad = 23.45 * Math.sin(((284 + dayOfYear) / 365) * 2 * Math.PI) * (Math.PI / 180);
  const latRad = latitude * (Math.PI / 180);

  const cosHour = -Math.tan(latRad) * Math.tan(declinationRad);
  const clampedCos = Math.max(-0.999, Math.min(0.999, cosHour));
  const halfDayHours = (Math.acos(clampedCos) * (180 / Math.PI)) / 15;

  const sunriseHour = Math.max(4.5, Math.min(7.5, 12 - halfDayHours));
  const sunsetHour = Math.max(16.5, Math.min(19.5, 12 + halfDayHours));

  const formatAMPM = (hDec: number) => {
    const h = Math.floor(hDec);
    const m = Math.round((hDec - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${period}`;
  };

  return {
    sunriseHour: Math.round(sunriseHour * 10) / 10,
    sunsetHour: Math.round(sunsetHour * 10) / 10,
    sunriseStr: formatAMPM(sunriseHour),
    sunsetStr: formatAMPM(sunsetHour),
  };
}

// 2. Procedural Panel Layout Generator
export function generatePanelGrid(
  roofType: RoofType,
  roofLength: number, // East-West width (X)
  roofWidth: number,  // North-South length (Z)
  tiltAngle: number,
  azimuthAngle: number,
  rowSpacing: number,
  panelSpec: PanelSpec,
  obstructions: Obstruction[],
  elevatedHeight: number = 0
): PlacedPanel[] {
  const panels: PlacedPanel[] = [];
  const edgeSetback = 0.6; // 60cm buffer from roof edge for safety and maintenance path

  const usableLength = roofLength - (2 * edgeSetback);
  const usableWidth = roofWidth - (2 * edgeSetback);

  if (usableLength <= 0 || usableWidth <= 0) return [];

  // In portrait orientation:
  // Panel width along X (East-West), panel length tilted along Z (North-South)
  const pWidth = panelSpec.width; // ~1.134m
  const pLength = panelSpec.length; // ~2.278m

  const interPanelGap = 0.05; // 5cm clamp gap
  const projectedRowLength = pLength * Math.cos(tiltAngle * (Math.PI / 180));
  const rowPitch = Math.max(projectedRowLength + 0.3, rowSpacing);

  const numCols = Math.floor((usableLength + interPanelGap) / (pWidth + interPanelGap));
  const numRows = Math.floor((usableWidth + 0.3) / rowPitch);

  if (numCols <= 0 || numRows <= 0) return [];

  const startX = -((numCols * pWidth + (numCols - 1) * interPanelGap) / 2) + (pWidth / 2);
  const startZ = -((numRows * rowPitch) / 2) + (rowPitch / 2);

  const baseElevation = roofType === 'elevated_pergola' ? elevatedHeight : 0.25;

  for (let r = 0; r < numRows; r++) {
    const posZ = startZ + (r * rowPitch);
    for (let c = 0; c < numCols; c++) {
      const posX = startX + (c * (pWidth + interPanelGap));
      const posY = baseElevation;

      // Check collision or close proximity with enabled obstructions
      let isColliding = false;
      let minObstructionDist = 999;

      for (const obs of obstructions) {
        if (!obs.enabled) continue;
        const halfObsW = (obs.width / 2) + (pWidth / 2) + 0.2;
        const halfObsL = (obs.length / 2) + (pLength / 2) + 0.2;

        const dx = Math.abs(posX - obs.x);
        const dz = Math.abs(posZ - obs.z);

        if (dx < halfObsW && dz < halfObsL) {
          isColliding = true;
          break;
        }

        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minObstructionDist) {
          minObstructionDist = dist;
        }
      }

      // Shading score: obstructions cast shadows toward North (negative Z)
      let shadingLoss = 0.02; // baseline 2% mismatch/dust
      if (minObstructionDist < 2.5) {
        shadingLoss = Math.min(0.35, 0.35 - (minObstructionDist / 2.5) * 0.3);
      }

      const irradianceScore = Math.round(100 - (shadingLoss * 180));

      panels.push({
        id: `panel_${r}_${c}`,
        row: r,
        col: c,
        x: posX,
        y: posY,
        z: posZ,
        tilt: tiltAngle,
        azimuth: azimuthAngle,
        enabled: !isColliding, // automatically disable colliding panels
        shadingLoss,
        irradianceScore: Math.max(20, Math.min(100, irradianceScore)),
      });
    }
  }

  return panels;
}

// 3. Generation Engine
export interface GenerationResult {
  systemSizeKwp: number;
  activePanelsCount: number;
  totalPanelsCount: number;
  annualGenerationKwh: number;
  dailyAverageKwh: number;
  performanceRatio: number;
  monthlyBreakdown: MonthlyData[];
}

export function calculateGeneration(
  panels: PlacedPanel[],
  panelSpec: PanelSpec,
  location: LocationPreset,
  inverterType: InverterType,
  roofType: RoofType,
  monthlyBill: number,
  gridTariff: number
): GenerationResult {
  const activePanels = panels.filter(p => p.enabled);
  const activeCount = activePanels.length;
  const totalCount = panels.length;

  const baseKwp = (activeCount * panelSpec.wattage) / 1000;

  // Bifacial rear gain (elevated pergola gets up to 10% gain due to high albedo & ground clearance)
  let bifacialFactor = 1.0;
  if (panelSpec.bifacialGain > 0) {
    if (roofType === 'elevated_pergola') {
      bifacialFactor += (panelSpec.bifacialGain / 100) * 0.9;
    } else if (roofType === 'flat_rcc') {
      bifacialFactor += (panelSpec.bifacialGain / 100) * 0.6;
    } else {
      bifacialFactor += (panelSpec.bifacialGain / 100) * 0.3; // tin shed low ground clearance
    }
  }

  // Inverter efficiency & shading mitigation factor
  let inverterEff = 0.98;
  if (inverterType === 'microinverter') {
    inverterEff = 0.975 * 1.04; // +4% shade mitigation gain from module-level MPPT
  } else if (inverterType === 'hybrid') {
    inverterEff = 0.972;
  }

  // System Performance Ratio (PR ~ 78% standard in India)
  const basePR = 0.785;
  const performanceRatio = basePR * inverterEff * bifacialFactor;

  const annualGenerationKwh = Math.round(baseKwp * location.psh * 365 * performanceRatio);
  const dailyAverageKwh = Math.round((annualGenerationKwh / 365) * 10) / 10;

  // Monthly Consumption estimate from Bill
  const monthlyConsumptionKwh = gridTariff > 0 ? Math.round(monthlyBill / gridTariff) : 350;

  // Monthly Breakdown
  const monthlyBreakdown: MonthlyData[] = MONTH_NAMES.map((name, idx) => {
    const weight = MONTH_WEIGHTS[idx];
    const monthGen = Math.round((annualGenerationKwh / 12) * weight);
    const savings = Math.round(Math.min(monthGen, monthlyConsumptionKwh) * gridTariff);
    return {
      month: name,
      shortMonth: name.substring(0, 3),
      solarGenerationKwh: monthGen,
      gridConsumptionKwh: monthlyConsumptionKwh,
      savingsInr: savings,
      sunHours: Math.round(location.psh * weight * 10) / 10,
    };
  });

  return {
    systemSizeKwp: Math.round(baseKwp * 100) / 100,
    activePanelsCount: activeCount,
    totalPanelsCount: totalCount,
    annualGenerationKwh,
    dailyAverageKwh,
    performanceRatio: Math.round(performanceRatio * 100) / 100,
    monthlyBreakdown,
  };
}

// 4. PM Surya Ghar Muft Bijli Yojana Subsidy Engine
export interface SubsidyResult {
  centralSubsidyInr: number;
  stateSubsidyInr: number;
  totalSubsidyInr: number;
  schemeName: string;
  subsidyBreakdown: string;
  isEligible: boolean;
}

export function calculateSubsidy(
  systemKwp: number,
  category: CustomerCategory,
  includeStateSubsidy: boolean,
  location: LocationPreset
): SubsidyResult {
  if (category === 'commercial' || systemKwp <= 0) {
    return {
      centralSubsidyInr: 0,
      stateSubsidyInr: 0,
      totalSubsidyInr: 0,
      schemeName: 'Commercial & Industrial (Accelerated Depreciation)',
      subsidyBreakdown: 'Direct capital subsidy not applicable for C&I. Eligible for 40% Accelerated Depreciation tax benefit.',
      isEligible: false,
    };
  }

  // PM Surya Ghar Muft Bijli Yojana Central Subsidy Slabs
  let centralSubsidy = 0;
  let breakdown = '';

  if (systemKwp <= 1.0) {
    centralSubsidy = Math.round(systemKwp * 30000);
    breakdown = `₹30,000/kW for ${systemKwp.toFixed(2)} kWp`;
  } else if (systemKwp <= 2.0) {
    centralSubsidy = 30000 + Math.round((systemKwp - 1.0) * 30000);
    breakdown = `₹30,000 (1st kW) + ₹${Math.round((systemKwp - 1.0) * 30000).toLocaleString('en-IN')} (additional capacity)`;
  } else if (systemKwp <= 3.0) {
    centralSubsidy = 60000 + Math.round((systemKwp - 2.0) * 18000);
    breakdown = `₹60,000 (first 2 kW) + ₹${Math.round((systemKwp - 2.0) * 18000).toLocaleString('en-IN')} (3rd kW slab)`;
  } else {
    // 3 kW and above is capped at ₹78,000 maximum central subsidy
    centralSubsidy = 78000;
    breakdown = `₹78,000 (Maximum Central Subsidy Cap for systems ≥ 3 kWp)`;
  }

  // State Top-Up Subsidy (e.g. Delhi, UP)
  let stateSubsidy = 0;
  if (includeStateSubsidy && location.stateSubsidyPerKw && location.stateSubsidyPerKw > 0) {
    const rawState = systemKwp * location.stateSubsidyPerKw;
    stateSubsidy = location.maxStateSubsidy ? Math.min(rawState, location.maxStateSubsidy) : rawState;
  }

  return {
    centralSubsidyInr: centralSubsidy,
    stateSubsidyInr: stateSubsidy,
    totalSubsidyInr: centralSubsidy + stateSubsidy,
    schemeName: 'PM Surya Ghar: Muft Bijli Yojana',
    subsidyBreakdown: breakdown,
    isEligible: true,
  };
}

// 5. Financial & EMI Calculations
export interface FinancialMetrics {
  grossCostInr: number;
  subsidyInr: number;
  netCostInr: number;
  gstAmountInr: number;
  yearOneSavingsInr: number;
  paybackYears: number;
  paybackMonths: number;
  twentyFiveYearSavingsInr: number;
  co2OffsetTons: number;
  treesPlantedEquivalent: number;
  monthlyEmiInr: number;
  monthlyBillSavingsInr: number;
  netMonthlyGainInr: number;
  yearlyCashflows: YearlyCashflow[];
}

export function calculateFinancials(
  systemKwp: number,
  annualGenKwh: number,
  gridTariff: number,
  category: CustomerCategory,
  includeStateSubsidy: boolean,
  location: LocationPreset,
  panelSpec: PanelSpec,
  inverterType: InverterType,
  roofType: RoofType,
  batteryCapacityKwh: number,
  financingType: FinancingType,
  downPaymentPercent: number,
  loanInterestRate: number,
  loanTenureYears: number
): FinancialMetrics {
  if (systemKwp <= 0) {
    return {
      grossCostInr: 0,
      subsidyInr: 0,
      netCostInr: 0,
      gstAmountInr: 0,
      yearOneSavingsInr: 0,
      paybackYears: 0,
      paybackMonths: 0,
      twentyFiveYearSavingsInr: 0,
      co2OffsetTons: 0,
      treesPlantedEquivalent: 0,
      monthlyEmiInr: 0,
      monthlyBillSavingsInr: 0,
      netMonthlyGainInr: 0,
      yearlyCashflows: [],
    };
  }

  // Base EPC Cost per kWp
  let ratePerKw = 53000;
  if (panelSpec.id === 'topcon_bifacial') ratePerKw += 3500;
  if (panelSpec.id === 'hjt_high_eff') ratePerKw += 7000;
  if (inverterType === 'microinverter') ratePerKw += 11000;
  if (inverterType === 'hybrid') ratePerKw += 6000;
  if (roofType === 'elevated_pergola') ratePerKw += 7500; // elevated hot-dip galvanized columns

  // Battery storage cost (~₹22,000 per kWh for LiFePO4 battery pack)
  const batteryCost = batteryCapacityKwh * 22000;

  const baseCost = (systemKwp * ratePerKw) + batteryCost;

  // Composite Solar GST in India: 13.8% (70% goods @ 12% + 30% services @ 18%)
  const gstAmount = Math.round(baseCost * 0.138);
  const grossCost = baseCost + gstAmount;

  // Subsidies
  const subsidyInfo = calculateSubsidy(systemKwp, category, includeStateSubsidy, location);
  const netCost = Math.max(0, grossCost - subsidyInfo.totalSubsidyInr);

  // Year 1 Savings
  const yearOneSavings = Math.round(annualGenKwh * gridTariff);
  const paybackYearsRaw = yearOneSavings > 0 ? (netCost / yearOneSavings) : 0;
  const paybackYears = Math.floor(paybackYearsRaw);
  const paybackMonths = Math.round((paybackYearsRaw - paybackYears) * 12);

  // Loan EMI calculation
  let monthlyEmi = 0;
  const downPayment = Math.round(netCost * (downPaymentPercent / 100));
  const principal = netCost - downPayment;

  if (financingType === 'loan' && principal > 0 && loanTenureYears > 0) {
    const monthlyRate = (loanInterestRate / 100) / 12;
    const totalMonths = loanTenureYears * 12;
    if (monthlyRate > 0) {
      monthlyEmi = Math.round(
        (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      );
    } else {
      monthlyEmi = Math.round(principal / totalMonths);
    }
  }

  const monthlyBillSavings = Math.round(yearOneSavings / 12);
  const netMonthlyGain = monthlyBillSavings - monthlyEmi;

  // 25-Year Projection:
  // - 0.5% annual degradation
  // - 4.0% annual electricity tariff inflation
  // - Inverter replacement contingency at Year 12 (approx 12% of system cost)
  const yearlyCashflows: YearlyCashflow[] = [];
  let cumulativeSavings = -netCost;
  const tariffInflationRate = 0.04;
  const degradationRate = 0.005;

  for (let year = 1; year <= 25; year++) {
    const efficiency = 1 - (year === 1 ? 0.02 : 0.02 + (year - 1) * degradationRate);
    const gen = Math.round(annualGenKwh * efficiency);
    const rate = gridTariff * Math.pow(1 + tariffInflationRate, year - 1);
    const savings = Math.round(gen * rate);

    const emiPaidThisYear = year <= loanTenureYears && financingType === 'loan' ? monthlyEmi * 12 : 0;

    // Inverter replacement contingency at Year 12
    const maintenanceDeduction = year === 12 ? Math.round(systemKwp * 8000) : 0;

    const annualNet = savings - emiPaidThisYear - maintenanceDeduction;
    cumulativeSavings += annualNet;

    yearlyCashflows.push({
      year,
      generationKwh: gen,
      gridRateInr: Math.round(rate * 100) / 100,
      annualSavingsInr: savings,
      cumulativeSavingsInr: Math.round(cumulativeSavings),
      loanEmiInr: emiPaidThisYear,
      netCashflowInr: annualNet,
      panelEfficiency: Math.round(efficiency * 1000) / 10,
    });
  }

  // Environmental Impact:
  // CEA emission factor in India: ~0.82 kg CO2 per kWh of grid electricity replaced
  const co2OffsetTons = Math.round((annualGenKwh * 0.82 * 25) / 1000 * 10) / 10;
  const treesPlantedEquivalent = Math.round((co2OffsetTons * 1000) / 21.77); // 1 tree absorbs ~21.77 kg CO2/year

  return {
    grossCostInr: grossCost,
    subsidyInr: subsidyInfo.totalSubsidyInr,
    netCostInr: netCost,
    gstAmountInr: gstAmount,
    yearOneSavingsInr: yearOneSavings,
    paybackYears,
    paybackMonths,
    twentyFiveYearSavingsInr: yearlyCashflows[24]?.cumulativeSavingsInr || 0,
    co2OffsetTons,
    treesPlantedEquivalent,
    monthlyEmiInr: monthlyEmi,
    monthlyBillSavingsInr: monthlyBillSavings,
    netMonthlyGainInr: netMonthlyGain,
    yearlyCashflows,
  };
}


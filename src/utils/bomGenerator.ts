import { BomItem, PanelSpec, InverterType, RoofType } from '../types/solar';

export function generateBom(
  activePanelsCount: number,
  panelSpec: PanelSpec,
  inverterType: InverterType,
  roofType: RoofType,
  batteryCapacityKwh: number
): BomItem[] {
  if (activePanelsCount <= 0) return [];

  const systemKwp = (activePanelsCount * panelSpec.wattage) / 1000;
  const items: BomItem[] = [];

  // 1. ELECTRICAL BOM
  // Solar Modules
  items.push({
    id: 'bom_pv_modules',
    category: 'Electrical',
    name: 'Solar PV Modules',
    specification: `${panelSpec.name} (Efficiency: ${panelSpec.efficiency}%, ALMM Approved Tier-1)`,
    quantity: activePanelsCount,
    unit: 'Nos.',
    unitRate: Math.round(panelSpec.wattage * panelSpec.pricePerWp),
    totalPrice: Math.round(activePanelsCount * panelSpec.wattage * panelSpec.pricePerWp),
    hsnCode: '85414300',
  });

  // Solar Inverter
  let inverterRating = Math.ceil(systemKwp * 0.95);
  if (inverterRating < 2) inverterRating = 2;
  let inverterSpec = `${inverterRating} kW On-Grid String Inverter (Dual MPPT, IP65, 98.4% Efficiency, WiFi Monitoring)`;
  let inverterRate = inverterRating * 8500;

  if (inverterType === 'microinverter') {
    inverterSpec = `Microinverters (${Math.ceil(activePanelsCount / 2)} units, 2-in-1 Dual MPPT with Envoy Gateway)`;
    inverterRate = activePanelsCount * 4500;
  } else if (inverterType === 'hybrid') {
    inverterSpec = `${inverterRating} kW Hybrid Inverter with Smart Energy Management & Battery Interface`;
    inverterRate = inverterRating * 14500;
  }

  items.push({
    id: 'bom_inverter',
    category: 'Electrical',
    name: inverterType === 'microinverter' ? 'Microinverter Array' : 'Solar Grid-Tie / Hybrid Inverter',
    specification: inverterSpec,
    quantity: inverterType === 'microinverter' ? Math.ceil(activePanelsCount / 2) : 1,
    unit: 'Set',
    unitRate: inverterRate,
    totalPrice: inverterRate,
    hsnCode: '85044090',
  });

  // DC Combiner Box / DCDB
  const numStrings = Math.max(1, Math.ceil(activePanelsCount / 14));
  const dcdbRate = 2800 + (numStrings * 1100);
  items.push({
    id: 'bom_dcdb',
    category: 'Electrical',
    name: 'DC Distribution Box (DCDB)',
    specification: `${numStrings}-in ${numStrings}-out, 1000V DC Type II SPD, 15A gPV Fuses, Polycarbonate Enclosure`,
    quantity: 1,
    unit: 'Set',
    unitRate: dcdbRate,
    totalPrice: dcdbRate,
    hsnCode: '85371000',
  });

  // AC Distribution Box (ACDB)
  const isThreePhase = systemKwp > 4.5;
  const acdbRate = isThreePhase ? 6500 : 3800;
  items.push({
    id: 'bom_acdb',
    category: 'Electrical',
    name: 'AC Distribution Box (ACDB)',
    specification: `${isThreePhase ? '3-Phase 415V' : 'Single Phase 230V'} ACDB with Type II AC SPD, MCB/MCCB & Energy Metering Terminals`,
    quantity: 1,
    unit: 'Set',
    unitRate: acdbRate,
    totalPrice: acdbRate,
    hsnCode: '85371000',
  });

  // Solar DC Cable
  const dcCableMeters = Math.max(30, Math.round(activePanelsCount * 7.5));
  const dcCableRate = 65; // per meter
  items.push({
    id: 'bom_dc_cable',
    category: 'Electrical',
    name: 'Solar DC Cable (Red & Black)',
    specification: '4.0 sq.mm UV resistant cross-linked polyolefin (XLPO) tinned copper solar cable (EN 50618)',
    quantity: dcCableMeters,
    unit: 'Mtrs',
    unitRate: dcCableRate,
    totalPrice: dcCableMeters * dcCableRate,
    hsnCode: '85444990',
  });

  // AC Armored Cable
  const acCableMeters = 30;
  const acCableRate = isThreePhase ? 240 : 130;
  items.push({
    id: 'bom_ac_cable',
    category: 'Electrical',
    name: 'AC Main Power Cable',
    specification: isThreePhase
      ? '4-Core 10 sq.mm Armored Copper/XLPE Cable'
      : '3-Core 6 sq.mm Armored Copper Cable',
    quantity: acCableMeters,
    unit: 'Mtrs',
    unitRate: acCableRate,
    totalPrice: acCableMeters * acCableRate,
    hsnCode: '85444990',
  });

  // Chemical Earthing Kit
  const earthingPits = 3; // Inverter body, DC side, Lightning Arrester
  const earthingRate = 4200;
  items.push({
    id: 'bom_earthing',
    category: 'Electrical',
    name: 'Chemical Earthing Kit',
    specification: '3-Pit Setup: 17.2mm dia × 2.0m Pure Copper Bonded Electrodes with 25kg Earth Enhancement Bentonite Compound',
    quantity: earthingPits,
    unit: 'Pits',
    unitRate: earthingRate,
    totalPrice: earthingPits * earthingRate,
    hsnCode: '85359090',
  });

  // Lightning Arrester (LA)
  items.push({
    id: 'bom_la',
    category: 'Electrical',
    name: 'Lightning Protection System',
    specification: 'Conventional Class B/C Solid Copper Franklin Terminal with 2.5m GI Mast, Base Plate & 25x3mm GI Flat Downconductor',
    quantity: 1,
    unit: 'Set',
    unitRate: 4800,
    totalPrice: 4800,
    hsnCode: '85354030',
  });

  // Net Metering Setup
  items.push({
    id: 'bom_net_meter',
    category: 'Electrical',
    name: 'Bi-Directional Net Metering Kit',
    specification: `${isThreePhase ? '3-Phase' : '1-Phase'} DISCOM Approved Bi-directional Net Meter + Solar Generation Meter with optical/RS485 port`,
    quantity: 1,
    unit: 'Set',
    unitRate: 7500,
    totalPrice: 7500,
    hsnCode: '90283010',
  });

  // Optional Battery
  if (batteryCapacityKwh > 0) {
    items.push({
      id: 'bom_battery',
      category: 'Electrical',
      name: 'Lithium Ferro Phosphate (LiFePO4) Battery',
      specification: `${batteryCapacityKwh} kWh Smart LFP Battery Pack (51.2V, 6000+ Cycles, 10-Year Warranty)`,
      quantity: 1,
      unit: 'Set',
      unitRate: batteryCapacityKwh * 22000,
      totalPrice: batteryCapacityKwh * 22000,
      hsnCode: '85076000',
    });
  }

  // 2. STRUCTURAL BOM
  // Module Mounting Rails
  const railMeters = Math.round(activePanelsCount * 2.3);
  const railRate = 280; // per meter
  let structureTypeTitle = 'Module Mounting Rails';
  let structureSpec = 'Anodized 6063-T6 Aluminum / Pre-Galvanized C-Channels rated for 150 km/h wind load';

  if (roofType === 'elevated_pergola') {
    structureTypeTitle = 'Elevated Pergola Superstructure & Rails';
    structureSpec = '80x80mm Heavy Hot-Dip Galvanized (HDG 80 microns) Column Posts with 2.5m Clearance & Aluminum Rails';
  } else if (roofType === 'tin_shed') {
    structureTypeTitle = 'Tin Shed Short Rails & EPDM Kits';
    structureSpec = 'Anodized Mini-Rail profile with EPDM sealing tape and self-tapping screws for trapezoidal metal roof';
  }

  items.push({
    id: 'bom_rails',
    category: 'Structural',
    name: structureTypeTitle,
    specification: structureSpec,
    quantity: railMeters,
    unit: 'Mtrs',
    unitRate: roofType === 'elevated_pergola' ? 620 : railRate,
    totalPrice: railMeters * (roofType === 'elevated_pergola' ? 620 : railRate),
    hsnCode: '76109010',
  });

  // Mid Clamps & End Clamps
  const midClamps = Math.max(4, Math.round(activePanelsCount * 1.8));
  const endClamps = Math.max(4, Math.round(activePanelsCount * 0.6));

  items.push({
    id: 'bom_mid_clamps',
    category: 'Structural',
    name: 'Aluminum Mid Clamps',
    specification: 'Anodized AL 6063-T6 Mid Clamp with SS 304 M8 Allen Bolt & Spring Nut',
    quantity: midClamps,
    unit: 'Nos.',
    unitRate: 45,
    totalPrice: midClamps * 45,
    hsnCode: '76169990',
  });

  items.push({
    id: 'bom_end_clamps',
    category: 'Structural',
    name: 'Aluminum End Clamps',
    specification: 'Anodized AL 6063-T6 End Clamp (35mm) with SS 304 M8 Allen Bolt & Spring Nut',
    quantity: endClamps,
    unit: 'Nos.',
    unitRate: 48,
    totalPrice: endClamps * 48,
    hsnCode: '76169990',
  });

  // Fasteners & Anchor Studs
  const anchorCount = Math.round(activePanelsCount * 1.2);
  items.push({
    id: 'bom_fasteners',
    category: 'Structural',
    name: 'Base Anchor Bolts & Hardware',
    specification: 'SS 304 / Hot Dip Galvanized M10 Anchor Fasteners with chemical grout anchoring',
    quantity: anchorCount,
    unit: 'Sets',
    unitRate: 95,
    totalPrice: anchorCount * 95,
    hsnCode: '73181500',
  });

  // 3. BALANCE OF SYSTEM & SERVICES
  items.push({
    id: 'bom_bos_accessories',
    category: 'Balance of System',
    name: 'Conduits, Trays & Cable Accessories',
    specification: 'Heavy-duty UV resistant rigid PVC conduits, perforated GI cable trays, cable ties & warning hazard tags',
    quantity: 1,
    unit: 'Lot',
    unitRate: Math.round(systemKwp * 1200),
    totalPrice: Math.round(systemKwp * 1200),
    hsnCode: '39172390',
  });

  items.push({
    id: 'bom_services',
    category: 'Services',
    name: 'Liaison, Engineering, Installation & Commissioning',
    specification: 'Structural & electrical design, DISCOM net metering sanction paperwork, CEIG inspection & full turnkey installation',
    quantity: 1,
    unit: 'Job',
    unitRate: Math.round(systemKwp * 4800),
    totalPrice: Math.round(systemKwp * 4800),
    hsnCode: '995461',
  });

  return items;
}

// Export BOM to CSV string
export function exportBomToCsv(items: BomItem[], clientName: string, systemKwp: number): string {
  const headers = ['Category', 'Item Name', 'Specification', 'Quantity', 'Unit', 'Unit Rate (INR)', 'Total Price (INR)', 'HSN Code'];

  const rows = items.map(item => [
    `"${item.category}"`,
    `"${item.name}"`,
    `"${item.specification.replace(/"/g, '""')}"`,
    item.quantity,
    `"${item.unit}"`,
    item.unitRate,
    item.totalPrice,
    `"${item.hsnCode}"`
  ]);

  const totalCost = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const gst = Math.round(totalCost * 0.138);
  const grandTotal = totalCost + gst;

  const summary = [
    ['', '', '', '', '', 'Subtotal', totalCost, ''],
    ['', '', '', '', '', 'Composite GST (13.8%)', gst, ''],
    ['', '', '', '', '', 'Grand Total (INR)', grandTotal, '']
  ];

  const metaRows = [
    [`"Bill of Materials (BOM) - Solar PV System"`],
    [`"Client Name: ${clientName}"`],
    [`"System Capacity: ${systemKwp} kWp"`],
    [`"Generated Date: ${new Date().toLocaleDateString('en-IN')}"`],
    ['']
  ];

  const fullCsv = [
    ...metaRows.map(r => r.join(',')),
    headers.join(','),
    ...rows.map(r => r.join(',')),
    '',
    ...summary.map(r => r.join(','))
  ].join('\n');

  return fullCsv;
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


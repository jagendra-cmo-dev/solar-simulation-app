import { SolarState } from '../types/solar';

export function encodeStateToQuery(state: Partial<SolarState>): string {
  try {
    const compact = {
      rt: state.roofType,
      rl: state.roofLength,
      rw: state.roofWidth,
      tt: state.tiltAngle,
      az: state.azimuthAngle,
      sp: state.rowSpacing,
      eh: state.elevatedStructureHeight,
      pt: state.selectedPanelTech,
      it: state.inverterType,
      bt: state.batteryCapacityKwh,
      loc: state.selectedLocation?.id,
      mb: state.monthlyBillInr,
      tr: state.gridTariffRate,
      cat: state.customerCategory,
      ft: state.financingType,
      // store active panel IDs as comma-separated
      dp: state.panels?.filter(p => !p.enabled).map(p => p.id).join(','),
      cn: state.clientDetails?.name,
      cp: state.clientDetails?.phone,
      ep: state.clientDetails?.epcCompanyName,
    };
    const jsonStr = JSON.stringify(compact);
    if (typeof window !== 'undefined') {
      return btoa(encodeURIComponent(jsonStr));
    }
    return Buffer.from(encodeURIComponent(jsonStr)).toString('base64');
  } catch (e) {
    console.error('Failed to encode share URL state:', e);
    return '';
  }
}

export function decodeQueryToState(encoded: string): Partial<SolarState> | null {
  try {
    let jsonStr = '';
    if (typeof window !== 'undefined') {
      jsonStr = decodeURIComponent(atob(encoded));
    } else {
      jsonStr = decodeURIComponent(Buffer.from(encoded, 'base64').toString('utf-8'));
    }
    const c = JSON.parse(jsonStr);
    const updates: Partial<SolarState> = {};

    if (c.rt) updates.roofType = c.rt;
    if (c.rl) updates.roofLength = Number(c.rl);
    if (c.rw) updates.roofWidth = Number(c.rw);
    if (c.tt !== undefined) updates.tiltAngle = Number(c.tt);
    if (c.az !== undefined) updates.azimuthAngle = Number(c.az);
    if (c.sp !== undefined) updates.rowSpacing = Number(c.sp);
    if (c.eh !== undefined) updates.elevatedStructureHeight = Number(c.eh);
    if (c.pt) updates.selectedPanelTech = c.pt;
    if (c.it) updates.inverterType = c.it;
    if (c.bt !== undefined) updates.batteryCapacityKwh = Number(c.bt);
    if (c.mb) updates.monthlyBillInr = Number(c.mb);
    if (c.tr) updates.gridTariffRate = Number(c.tr);
    if (c.cat) updates.customerCategory = c.cat;
    if (c.ft) updates.financingType = c.ft;

    return updates;
  } catch (e) {
    console.error('Failed to decode share URL state:', e);
    return null;
  }
}


import { RoofType, PanelTech, InverterType, CustomerCategory, FinancingType, PlacedPanel, Obstruction } from './solar';

export interface ProposalRecord {
  id: string;
  share_slug: string;
  quotation_number: string;
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected';

  // Client & Site Info
  client_name: string;
  client_phone: string;
  client_email: string;
  client_address: string;
  consumer_number: string;
  sanctioned_load_kw: number;
  connection_phase: string;
  location_id: string;
  discom_name: string;

  // 3D Roof Architecture
  roof_type: RoofType;
  roof_length: number;
  roof_width: number;
  roof_height: number;
  parapet_height: number;
  tilt_angle: number;
  azimuth_angle: number;
  row_spacing: number;
  elevated_height: number;

  // PV Hardware
  panel_tech: PanelTech;
  inverter_type: InverterType;
  battery_capacity_kwh: number;
  system_kwp: number;
  active_panels_count: number;
  total_panels_count: number;

  // Generation & Financials
  annual_generation_kwh: number;
  monthly_bill_inr: number;
  grid_tariff_rate: number;
  customer_category: CustomerCategory;
  financing_type: FinancingType;
  gross_cost_inr: number;
  subsidy_inr: number;
  net_cost_inr: number;
  payback_years: number;
  twenty_five_year_savings_inr: number;
  special_discount_inr: number;

  // Complete 3D State & Layout
  design_state: {
    panels: PlacedPanel[];
    obstructions: Obstruction[];
    timeOfDayHours?: number;
    monthOfYear?: number;
  };

  // Metadata & Digital Sign-off
  epc_company_name: string;
  sales_rep_name?: string;
  sales_rep_phone?: string;
  custom_notes?: string;
  snapshot_data_url?: string;
  signature_data_url?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalPayload {
  client_name: string;
  client_phone?: string;
  client_email?: string;
  client_address?: string;
  consumer_number?: string;
  sanctioned_load_kw?: number;
  connection_phase?: string;
  location_id?: string;
  discom_name?: string;
  quotation_number?: string;

  roof_type: RoofType;
  roof_length: number;
  roof_width: number;
  roof_height: number;
  parapet_height: number;
  tilt_angle: number;
  azimuth_angle: number;
  row_spacing: number;
  elevated_height: number;

  panel_tech: PanelTech;
  inverter_type: InverterType;
  battery_capacity_kwh: number;
  system_kwp: number;
  active_panels_count: number;
  total_panels_count: number;

  annual_generation_kwh: number;
  monthly_bill_inr: number;
  grid_tariff_rate: number;
  customer_category: CustomerCategory;
  financing_type: FinancingType;
  gross_cost_inr: number;
  subsidy_inr: number;
  net_cost_inr: number;
  payback_years: number;
  twenty_five_year_savings_inr: number;
  special_discount_inr?: number;

  design_state: {
    panels: PlacedPanel[];
    obstructions: Obstruction[];
    timeOfDayHours?: number;
    monthOfYear?: number;
  };

  epc_company_name?: string;
  sales_rep_name?: string;
  sales_rep_phone?: string;
  custom_notes?: string;
  snapshot_data_url?: string;
}


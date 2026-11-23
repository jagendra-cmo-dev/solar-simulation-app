import { getSupabaseClient } from './supabase';
import { ProposalRecord, ProposalPayload } from '../types/database';

// In-memory fallback store when Supabase anon key is not yet provided or table pending migration
const memoryProposals: Map<string, ProposalRecord> = new Map();

// Helper to generate a URL-friendly share slug (e.g. r5vv4gvm8t or prop_7k8x9p)
export function generateShareSlug(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let slug = '';
  for (let i = 0; i < 9; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

export async function createProposalInDb(payload: ProposalPayload): Promise<ProposalRecord> {
  const slug = generateShareSlug();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prop_${Date.now()}`;
  const now = new Date().toISOString();

  const record: ProposalRecord = {
    id,
    share_slug: slug,
    quotation_number: payload.quotation_number || `SPEPC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'draft',
    
    client_name: payload.client_name,
    client_phone: payload.client_phone || '',
    client_email: payload.client_email || '',
    client_address: payload.client_address || '',
    consumer_number: payload.consumer_number || '',
    sanctioned_load_kw: payload.sanctioned_load_kw || 5.0,
    connection_phase: payload.connection_phase || '3-Phase',
    location_id: payload.location_id || 'jaipur',
    discom_name: payload.discom_name || 'State Electricity Board',
    
    roof_type: payload.roof_type,
    roof_length: payload.roof_length,
    roof_width: payload.roof_width,
    roof_height: payload.roof_height,
    parapet_height: payload.parapet_height,
    tilt_angle: payload.tilt_angle,
    azimuth_angle: payload.azimuth_angle,
    row_spacing: payload.row_spacing,
    elevated_height: payload.elevated_height,
    
    panel_tech: payload.panel_tech,
    inverter_type: payload.inverter_type,
    battery_capacity_kwh: payload.battery_capacity_kwh,
    system_kwp: payload.system_kwp,
    active_panels_count: payload.active_panels_count,
    total_panels_count: payload.total_panels_count,
    
    annual_generation_kwh: payload.annual_generation_kwh,
    monthly_bill_inr: payload.monthly_bill_inr,
    grid_tariff_rate: payload.grid_tariff_rate,
    customer_category: payload.customer_category,
    financing_type: payload.financing_type,
    gross_cost_inr: payload.gross_cost_inr,
    subsidy_inr: payload.subsidy_inr,
    net_cost_inr: payload.net_cost_inr,
    payback_years: payload.payback_years,
    twenty_five_year_savings_inr: payload.twenty_five_year_savings_inr,
    special_discount_inr: payload.special_discount_inr || 0,
    
    design_state: payload.design_state,
    
    epc_company_name: payload.epc_company_name || 'SunPower EPC Solutions Pvt Ltd',
    sales_rep_name: payload.sales_rep_name || '',
    sales_rep_phone: payload.sales_rep_phone || '',
    custom_notes: payload.custom_notes || '',
    snapshot_data_url: payload.snapshot_data_url || '',
    
    created_at: now,
    updated_at: now,
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert([record])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert warning, falling back to local memory store:', error.message);
        memoryProposals.set(record.id, record);
        memoryProposals.set(record.share_slug, record);
        return record;
      }
      return data as ProposalRecord;
    } catch (err) {
      console.warn('Supabase exception, using memory fallback:', err);
    }
  }

  // Fallback to memory
  memoryProposals.set(record.id, record);
  memoryProposals.set(record.share_slug, record);
  return record;
}

export async function listProposalsFromDb(limit = 50): Promise<ProposalRecord[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        return data as ProposalRecord[];
      }
    } catch (err) {
      console.warn('Supabase list error:', err);
    }
  }

  // Return unique memory proposals
  const unique = new Map<string, ProposalRecord>();
  memoryProposals.forEach((rec) => {
    unique.set(rec.id, rec);
  });
  return Array.from(unique.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getProposalByIdOrSlug(idOrSlug: string): Promise<ProposalRecord | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Try by share_slug first
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('share_slug', idOrSlug)
        .maybeSingle();

      if (!error && data) {
        return data as ProposalRecord;
      }

      // Try by UUID
      const res = await supabase
        .from('proposals')
        .select('*')
        .eq('id', idOrSlug)
        .maybeSingle();

      if (!res.error && res.data) {
        return res.data as ProposalRecord;
      }
    } catch (err) {
      console.warn('Supabase fetch error:', err);
    }
  }

  // Check memory store
  if (memoryProposals.has(idOrSlug)) {
    return memoryProposals.get(idOrSlug) || null;
  }

  return null;
}

export async function approveProposalInDb(idOrSlug: string, signatureDataUrl: string): Promise<ProposalRecord | null> {
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .update({
          signature_data_url: signatureDataUrl,
          status: 'approved',
          approved_at: now,
          updated_at: now,
        })
        .or(`id.eq.${idOrSlug},share_slug.eq.${idOrSlug}`)
        .select()
        .single();

      if (!error && data) {
        return data as ProposalRecord;
      }
    } catch (err) {
      console.warn('Supabase approve error:', err);
    }
  }

  // Fallback to memory
  const existing = memoryProposals.get(idOrSlug);
  if (existing) {
    existing.signature_data_url = signatureDataUrl;
    existing.status = 'approved';
    existing.approved_at = now;
    existing.updated_at = now;
    memoryProposals.set(existing.id, existing);
    memoryProposals.set(existing.share_slug, existing);
    return existing;
  }

  return null;
}

export async function deleteProposalFromDb(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('proposals').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }
  return memoryProposals.delete(id);
}

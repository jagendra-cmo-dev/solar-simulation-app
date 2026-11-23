import { NextResponse } from 'next/server';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const configured = isSupabaseConfigured();
  const supabase = getSupabaseClient();
  let tableExists = false;
  let rowCount = 0;
  let connectionError: string | null = null;

  if (supabase) {
    try {
      const { error, count } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true });

      if (error) {
        connectionError = error.message;
      } else {
        tableExists = true;
        rowCount = count || 0;
      }
    } catch (err: unknown) {
      connectionError = err instanceof Error ? err.message : 'Unknown database error';
    }
  }

  return NextResponse.json({
    projectUrl: 'https://gtftxteawgkbtauqmeuz.supabase.co',
    isSupabaseConfigured: configured,
    tableExists,
    rowCount,
    connectionError,
    instructions: {
      step1: 'Go to https://gtftxteawgkbtauqmeuz.supabase.co -> Project Settings -> API',
      step2: 'Copy Project API key (anon / public)',
      step3: 'Paste it in your .env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY',
      step4: 'Go to Supabase SQL Editor and execute the schema from /supabase/schema.sql',
    },
  });
}

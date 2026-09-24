import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseDemo = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').includes('demo-project');
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasPostgresUrl = !!process.env.POSTGRES_URL;
  
  return NextResponse.json({
    isSupabaseConfigured: isSupabaseConfigured(),
    hasSupabaseUrl,
    isSupabaseDemo,
    hasDatabaseUrl,
    hasPostgresUrl,
    supabaseHost: process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host : null,
  });
}

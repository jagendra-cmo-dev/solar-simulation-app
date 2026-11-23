import { NextRequest, NextResponse } from 'next/server';
import { createProposalInDb, listProposalsFromDb } from '@/lib/supabaseServer';
import { ProposalPayload } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const proposals = await listProposalsFromDb(limit);

    return NextResponse.json({
      success: true,
      data: proposals,
      count: proposals.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to list proposals';
    console.error('API GET /api/proposals error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ProposalPayload;

    if (!body.client_name || !body.system_kwp) {
      return NextResponse.json(
        { success: false, error: 'client_name and system_kwp are required' },
        { status: 400 }
      );
    }

    const proposal = await createProposalInDb(body);

    const origin = request.nextUrl.origin;
    const shareUrl = `${origin}/share/${proposal.share_slug}`;

    return NextResponse.json(
      {
        success: true,
        data: proposal,
        shareUrl,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create proposal';
    console.error('API POST /api/proposals error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

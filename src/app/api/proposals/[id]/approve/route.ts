import { NextRequest, NextResponse } from 'next/server';
import { approveProposalInDb } from '@/lib/supabaseServer';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signatureDataUrl } = body;

    if (!signatureDataUrl) {
      return NextResponse.json(
        { success: false, error: 'signatureDataUrl is required' },
        { status: 400 }
      );
    }

    const updated = await approveProposalInDb(id, signatureDataUrl);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal successfully approved and signed',
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to approve proposal';
    console.error('API POST /api/proposals/[id]/approve error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

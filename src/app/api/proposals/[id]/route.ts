import { NextRequest, NextResponse } from 'next/server';
import { getProposalByIdOrSlug, deleteProposalFromDb } from '@/lib/supabaseServer';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proposal = await getProposalByIdOrSlug(id);

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: proposal,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch proposal';
    console.error('API GET /api/proposals/[id] error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteProposalFromDb(id);

    return NextResponse.json({
      success,
      message: success ? 'Proposal deleted successfully' : 'Proposal not found',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete proposal';
    console.error('API DELETE /api/proposals/[id] error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

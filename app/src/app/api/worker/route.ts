import { NextRequest, NextResponse } from 'next/server';
import { createWorker, listWorkers } from '@/lib/worker-profile';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const worker = createWorker({
      name: body.name,
      trade: body.trade,
      years_experience: body.years_experience,
      years_with_company: body.years_with_company,
      email: body.email,
      phone: body.phone,
      org_id: body.org_id,
    });

    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create worker' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id') || undefined;
    const workers = listWorkers(orgId);
    return NextResponse.json(workers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list workers' }, { status: 500 });
  }
}

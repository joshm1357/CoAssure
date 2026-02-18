import { NextRequest, NextResponse } from 'next/server';
import { addTrainingRecord, deleteTrainingRecord } from '@/lib/worker-profile';
import { getDb } from '@/lib/db';
import { TrainingRecord } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.cert_type || !body.cert_name) {
      return NextResponse.json(
        { error: 'cert_type and cert_name are required' },
        { status: 400 }
      );
    }

    const record = addTrainingRecord({
      worker_id: id,
      cert_type: body.cert_type,
      cert_name: body.cert_name,
      issued_date: body.issued_date,
      expiry_date: body.expiry_date,
      issuer: body.issuer,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add training record' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const records = db.prepare(
      'SELECT * FROM training_records WHERE worker_id = ? ORDER BY expiry_date DESC'
    ).all(id) as TrainingRecord[];

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get training records' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const recordId = request.nextUrl.searchParams.get('record_id');
    if (!recordId) {
      return NextResponse.json({ error: 'record_id is required' }, { status: 400 });
    }

    const deleted = deleteTrainingRecord(recordId);
    if (!deleted) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete training record' }, { status: 500 });
  }
}

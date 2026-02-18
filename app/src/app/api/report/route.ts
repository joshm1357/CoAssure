import { NextRequest, NextResponse } from 'next/server';
import { createReport, listReports, updateReportStatus } from '@/lib/reports';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.worker_id || !body.report_type || !body.description) {
      return NextResponse.json(
        { error: 'worker_id, report_type, and description are required' },
        { status: 400 }
      );
    }

    const report = createReport({
      worker_id: body.worker_id,
      session_id: body.session_id,
      report_type: body.report_type,
      severity: body.severity,
      description: body.description,
      contributing_factors: body.contributing_factors,
      actions_taken: body.actions_taken,
      recommended_actions: body.recommended_actions,
      location_lat: body.location_lat,
      location_lng: body.location_lng,
      location_address: body.location_address,
      photo_path: body.photo_path,
      is_anonymous: body.is_anonymous,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const workerId = request.nextUrl.searchParams.get('worker_id') || undefined;
    const reportType = request.nextUrl.searchParams.get('report_type') || undefined;
    const status = request.nextUrl.searchParams.get('status') || undefined;
    const limit = request.nextUrl.searchParams.get('limit');

    const reports = listReports({
      worker_id: workerId,
      report_type: reportType,
      status,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list reports' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    const report = updateReportStatus(body.id, body.status);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}

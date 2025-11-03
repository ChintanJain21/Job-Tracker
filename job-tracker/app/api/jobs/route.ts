import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Job from '@/models/Job';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const jobs = await Job.find({});
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('GET /api/jobs error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get jobs';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const job = new Job(body);
    await job.save();
  } catch (error) {
    console.error('POST /api/jobs error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create job';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  }


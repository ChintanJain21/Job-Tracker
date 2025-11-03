import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Job from '@/models/Job';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  const jobs = await Job.find({});
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  await connectToDatabase();
  const body = await request.json();
  const job = new Job(body);
  await job.save();
  return NextResponse.json(job);
}

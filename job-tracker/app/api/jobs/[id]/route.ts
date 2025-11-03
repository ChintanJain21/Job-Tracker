import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Job from '@/models/Job';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

async function handleUpdate(request: Request, params: { id: string }) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { id } = params;

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { _id: id };
    const updatedJob = await Job.findOneAndUpdate(query, body, { new: true, runValidators: true });

    if (!updatedJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(updatedJob);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return handleUpdate(request, params);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return handleUpdate(request, params);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;
    if (!id) return NextResponse.json({ error: 'No id provided' }, { status: 400 });
    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const deletedJob = await Job.findByIdAndDelete(id);
    if (!deletedJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Job deleted successfully', job: deletedJob });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}

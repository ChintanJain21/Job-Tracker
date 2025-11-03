import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Job from '@/models/Job';

// Helper used for both PUT and PATCH so client can use either method
async function handleUpdate(request: Request, params: { id: string }) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { id } = params;
    console.log('Updating job:', id, 'with', body);

    if (!id) {
      console.error('No id provided in params');
      return NextResponse.json({ error: 'No id provided' }, { status: 400 });
    }

    // If id is not a valid ObjectId, try to use it as-is (some clients may pass string keys)
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { _id: id };

    const updatedJob = await Job.findOneAndUpdate(query, body, { new: true, runValidators: true });

    if (!updatedJob) {
      console.error('No job found with id:', id);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    console.log('Job updated:', updatedJob);
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return handleUpdate(request, resolvedParams);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return handleUpdate(request, resolvedParams);
}

// Optional: allow fetching a single job for debugging or UI needs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'No id provided' }, { status: 400 });
    const job = await Job.findById(id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    console.log('Deleting job:', id);

    if (!id) {
      return NextResponse.json({ error: 'No id provided' }, { status: 400 });
    }

    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      console.error('No job found with id:', id);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    console.log('Job deleted:', deletedJob);
    return NextResponse.json({ message: 'Job deleted successfully', job: deletedJob });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
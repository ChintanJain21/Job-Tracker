'use client';

import { useEffect, useState, ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';

type Job = {
  _id: string;
  companyName: string;
  role: string;
  dateApplied: string;
  status: 'Applied' | 'Interviewing' | 'Offer Received' | 'Rejected';
};

const columns = ['Applied', 'Interviewing', 'Offer Received', 'Rejected'] as const;

const columnColors = {
  'Applied': 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  'Interviewing': 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  'Offer Received': 'from-green-500/20 to-green-600/20 border-green-500/30',
  'Rejected': 'from-red-500/20 to-red-600/20 border-red-500/30',
} as const;

function KanbanColumn({ id, children }: { id: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const colorClass = columnColors[id as keyof typeof columnColors] || 'from-gray-700/20 to-gray-800/20 border-gray-600/30';
  
  return (
    <div
      ref={setNodeRef}
      className={`bg-gradient-to-br ${colorClass} backdrop-blur-sm border rounded-xl p-5 w-80 max-h-[680px] flex flex-col overflow-y-auto shadow-xl transition-all duration-300 ${
        isOver ? "ring-2 ring-cyan-400 shadow-2xl scale-[1.02]" : ""
      }`}
    >
      {children}
    </div>
  );
}

function SortableJobCard(props: { job: Job; onEdit: (job: Job) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.job._id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    opacity: isDragging ? 0.9 : 1,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl p-5 mb-3 shadow-lg transition-all duration-200 select-none relative group border ${
        isDragging 
          ? 'bg-gradient-to-br from-cyan-500 to-blue-500 border-cyan-400 shadow-2xl scale-105 text-white' 
          : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:shadow-xl hover:border-cyan-500/50 hover:-translate-y-1'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <h3 className="font-bold text-lg mb-1 text-white">{props.job.companyName}</h3>
        <p className="text-sm text-slate-300 mb-2">{props.job.role}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <span>📅</span>
          {new Date(props.job.dateApplied).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            props.onEdit(props.job);
          }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          title="Edit job"
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            props.onDelete(props.job._id);
          }}
          className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          title="Delete job"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data))
      .finally(() => setLoading(false));
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

 async function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over || !active) return;
  if (active.id === over.id) return;

  const activeJob = jobs.find(j => j._id === active.id);
  if (!activeJob) return;

  // Determine the target column - could be a column id or another job's id
  let targetStatus: string | null = null;
  
  // Check if we dropped on a column (status name)
  if (columns.includes(over.id as any)) {
    targetStatus = over.id as string;
  } else {
    // We dropped on another job, find its status
    const targetJob = jobs.find(j => j._id === over.id);
    if (targetJob) {
      targetStatus = targetJob.status;
    }
  }

  // Only update if the status is actually changing
  if (targetStatus && activeJob.status !== targetStatus) {
    // Optimistic update UI
    setJobs(jobs.map(job => job._id === active.id ? { ...job, status: targetStatus as Job['status'] } : job));

    try {
      const res = await fetch('/api/jobs/' + active.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status: ' + res.status);
      const updatedJob = await res.json();
      console.log('Update successful:', updatedJob);

      // Optional: refetch jobs to sync UI and DB
      fetch('/api/jobs')
        .then(res => res.json())
        .then(setJobs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Update failed: ' + errorMessage);
      // Revert optimistic update by refetching
      fetch('/api/jobs')
        .then(res => res.json())
        .then(setJobs);
    }
  }
}

async function handleDeleteJob(id: string) {
  try {
    const res = await fetch('/api/jobs/' + id, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete job');
    setJobs(jobs.filter(job => job._id !== id));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    alert('Delete failed: ' + errorMessage);
  }
}

function handleEditJob(job: Job) {
  setEditingJob(job);
}

async function handleUpdateJob(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (!editingJob) return;

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const companyName = formData.get('companyName') as string;
  const role = formData.get('role') as string;
  const dateApplied = formData.get('dateApplied') as string;
  const status = formData.get('status') as Job['status'];

  try {
    const res = await fetch('/api/jobs/' + editingJob._id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, role, dateApplied, status }),
    });
    if (!res.ok) throw new Error('Failed to update job');
    const updatedJob = await res.json();
    setJobs(jobs.map(job => job._id === updatedJob._id ? updatedJob : job));
    setEditingJob(null);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    alert('Update failed: ' + errorMessage);
  }
}


  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-100 p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">💼</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Job Tracker
              </h1>
              <p className="text-slate-400 text-sm">Track your job applications with ease</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewJobModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <span className="text-xl">+</span> New Job
          </button>
        </div>
        
        {loading && (
          <div className="mb-6 flex items-center gap-3 text-slate-300 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
            <span>Loading your jobs...</span>
          </div>
        )}

      {/* Modal for adding job */}
      {showNewJobModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const companyName = formData.get('companyName') as string;
              const role = formData.get('role') as string;
              const dateApplied = formData.get('dateApplied') as string;
              const status = formData.get('status') as Job['status'];

              const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyName, role, dateApplied, status }),
              });
              const newJob = await res.json();
              setJobs((prev) => [...prev, newJob]);
              setShowNewJobModal(false);
              form.reset();
            }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col gap-5 w-96 border border-slate-700"
          >
            <h2 className="text-2xl font-bold border-b border-slate-700 pb-3 mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Add New Job
            </h2>
            <input
              name="companyName"
              required
              placeholder="Company Name"
              className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-gray-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            <input
              name="role"
              required
              placeholder="Role"
              className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-gray-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            <input
              name="dateApplied"
              type="date"
              required
              className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            <select
              name="status"
              required
              className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              defaultValue="Applied"
            >
              {columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg px-4 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Add Job
              </button>
              <button
                type="button"
                onClick={() => setShowNewJobModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-gray-100 rounded-lg px-4 py-3 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal for editing job */}
      {editingJob && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <form
            onSubmit={handleUpdateJob}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col gap-5 w-96 border border-slate-700"
          >
            <h2 className="text-2xl font-bold border-b border-slate-700 pb-3 mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Edit Job
            </h2>
            <input
              name="companyName"
              required
              placeholder="Company Name"
              defaultValue={editingJob.companyName}
              className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-gray-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <input
              name="role"
              required
              placeholder="Role"
              defaultValue={editingJob.role}
              className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-gray-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <input
              name="dateApplied"
              type="date"
              required
              defaultValue={new Date(editingJob.dateApplied).toISOString().split('T')[0]}
              className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <select
              name="status"
              required
              className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              defaultValue={editingJob.status}
            >
              {columns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg px-4 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-gray-100 rounded-lg px-4 py-3 font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((col) => {
            const jobsInCol = jobs.filter((job) => job.status === col);
            return (
              <KanbanColumn key={col} id={col}>
                <h2 className="mb-5 font-bold text-xl border-b border-slate-600/50 pb-3 text-white flex items-center justify-between">
                  <span>{col}</span>
                  <span className="text-sm font-normal bg-slate-700/50 px-3 py-1 rounded-full">{jobsInCol.length}</span>
                </h2>
                <SortableContext items={jobsInCol.map((job) => job._id)} strategy={verticalListSortingStrategy}>
                  {jobsInCol.map((job) => (
                    <SortableJobCard key={job._id} job={job} onEdit={handleEditJob} onDelete={handleDeleteJob} />
                  ))}
                </SortableContext>
                {jobsInCol.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No jobs yet
                  </div>
                )}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>
      </div>
    </main>
  );
}

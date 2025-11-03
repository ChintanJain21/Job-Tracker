# 💼 Job Tracker

A modern, intuitive job application tracker built with Next.js 16, featuring a beautiful Kanban board interface to help you manage your job search process.



## ✨ Features

- **📊 Kanban Board Interface** - Visual drag-and-drop job application tracking
- **🎨 Modern UI Design** - Beautiful gradient-based design with smooth animations
- **✏️ Full CRUD Operations** - Create, read, update, and delete job applications
- **🔄 Real-time Updates** - Drag and drop cards to update job status instantly
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **🌈 Color-Coded Columns** - Easy visual distinction between application stages
- **💾 MongoDB Integration** - Persistent data storage with Mongoose ODM

## 🎯 Application Stages

Track your applications through four stages:

1. **Applied** 🔵 - Jobs you've applied to
2. **Interviewing** 🟣 - Active interview processes
3. **Offer Received** 🟢 - Job offers received
4. **Rejected** 🔴 - Unsuccessful applications

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB database (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd job-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **@dnd-kit** - Drag and drop functionality

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

## 📁 Project Structure

```
job-tracker/
├── app/
│   ├── api/
│   │   └── jobs/
│   │       ├── route.ts          # GET all, POST new job
│   │       └── [id]/
│   │           └── route.ts      # GET, PUT, PATCH, DELETE job by ID
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main Kanban board page
├── lib/
│   └── mongodb.ts                # MongoDB connection utility
├── models/
│   └── Job.ts                    # Mongoose Job schema
└── public/                       # Static assets
```

## 🎨 Color Scheme

The application uses a modern dark theme with vibrant gradients:

- **Primary**: Cyan → Blue gradient
- **Secondary**: Blue → Purple gradient
- **Background**: Slate-950 → Slate-900
- **Accents**: Column-specific colors for visual hierarchy

## 📝 API Endpoints

### Jobs Collection

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Fetch all jobs |
| POST | `/api/jobs` | Create a new job |
| GET | `/api/jobs/[id]` | Fetch a single job |
| PUT/PATCH | `/api/jobs/[id]` | Update a job |
| DELETE | `/api/jobs/[id]` | Delete a job |

### Job Schema

```typescript
{
  companyName: string;
  role: string;
  dateApplied: Date;
  status: 'Applied' | 'Interviewing' | 'Offer Received' | 'Rejected';
}
```

## 🎯 Usage

### Adding a New Job
1. Click the **"+ New Job"** button
2. Fill in the company name, role, application date, and status
3. Click **"Add Job"** to save

### Editing a Job
1. Hover over any job card
2. Click the **edit button (✏️)**
3. Modify the details in the modal
4. Click **"Save Changes"**

### Deleting a Job
1. Hover over any job card
2. Click the **delete button (🗑️)**
3. Confirm the deletion

### Moving Jobs Between Stages
- Simply **drag and drop** any job card to a different column
- The status updates automatically

## 🔧 Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🌟 Key Features Explained

### Drag and Drop
Built with `@dnd-kit`, providing smooth, accessible drag-and-drop functionality with:
- Visual feedback during dragging
- Smooth animations
- Touch support for mobile devices

### Optimistic UI Updates
When dragging jobs between columns, the UI updates immediately for a snappy user experience, with automatic rollback if the server update fails.

### Responsive Design
- Horizontal scrolling on smaller screens
- Adaptive column widths
- Touch-friendly controls



'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import TaskFilters from '@/components/tasks/TaskFilters';
import { TaskFilters as TaskFiltersType } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { clearAuthSession } from '@/lib/auth';

export default function Dashboard() {
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<TaskFiltersType>({
    completed: null,
    sort: 'created_at',
    order: 'desc',
  });

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !session.token) {
      router.push('/auth/signin');
    }
  }, [isLoading, session.token, router]);

  const handleTaskCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSignOut = () => {
    clearAuthSession();
    router.push('/auth/signin');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </main>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!session.token) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold text-blue-600">{session.user?.name || session.user?.email}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Form and Filters */}
          <div className="lg:col-span-1 space-y-6">
            <TaskForm onTaskCreated={handleTaskCreated} />
            <TaskFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Right Column - Task List */}
          <div className="lg:col-span-2">
            <TaskList refreshTrigger={refreshTrigger} filters={filters} />
          </div>
        </div>
      </div>
    </main>
  );
}

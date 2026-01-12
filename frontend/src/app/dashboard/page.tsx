'use client';

import { useState } from 'react';
import TaskList from '@/components/tasks/TaskList';
import TaskFilters from '@/components/tasks/TaskFilters';
import { InlineTaskInput } from '@/components/tasks/InlineTaskInput';
import { TaskFilters as TaskFiltersType } from '@/lib/api';
import AnimatedBackground from '@/components/animations/AnimatedBackground';

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<TaskFiltersType>({
    completed: null,
    sort: 'created_at',
    order: 'desc',
  });

  const handleTaskCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen">
      {/* Animated Gradient Background */}
      <AnimatedBackground variant="subtle" />

      {/* Main Content */}
      <div className="relative z-10 space-y-8 p-6 max-w-7xl mx-auto">
        {/* Page Header - Premium Glassmorphism Card */}
        <div className="rounded-3xl p-8 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              📥
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground">
              Inbox
            </h1>
          </div>
          <p className="text-lg text-muted-foreground ml-15">
            All your tasks in one place — stay focused and organized
          </p>
        </div>

        {/* Quick Add Task - Glassmorphism Card */}
        <div className="rounded-2xl p-6 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
          <InlineTaskInput onSubmit={handleTaskCreated} />
        </div>

        {/* Task Filters */}
        <TaskFilters filters={filters} onFiltersChange={setFilters} />

        {/* Task List */}
        <TaskList refreshTrigger={refreshTrigger} filters={filters} />
      </div>
    </div>
  );
}

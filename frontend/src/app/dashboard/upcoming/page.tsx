'use client';

import { useState } from 'react';
import TaskList from '@/components/tasks/TaskList';
import TaskFilters from '@/components/tasks/TaskFilters';
import { InlineTaskInput } from '@/components/tasks/InlineTaskInput';
import { TaskFilters as TaskFiltersType } from '@/lib/api';

export default function UpcomingPage() {
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Upcoming
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tasks due in the next 7 days
        </p>
      </div>

      {/* Inline Task Input */}
      <InlineTaskInput onSubmit={handleTaskCreated} />

      {/* Task Filters */}
      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      {/* Task List - TODO: Filter by due date in next 7 days */}
      <TaskList refreshTrigger={refreshTrigger} filters={filters} />
    </div>
  );
}

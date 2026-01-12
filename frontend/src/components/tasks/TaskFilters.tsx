'use client';

import { Filter, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { TaskFilters as TaskFiltersType } from '@/lib/api';
import { fadeInUp, buttonVariants } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
}

export default function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleCompletedChange = (value: string) => {
    let completed: boolean | null = null;
    if (value === 'completed') completed = true;
    else if (value === 'active') completed = false;

    onFiltersChange({ ...filters, completed });
  };

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split('-') as ['created_at' | 'updated_at', 'asc' | 'desc'];
    onFiltersChange({ ...filters, sort, order });
  };

  const getCurrentCompletedValue = () => {
    if (filters.completed === true) return 'completed';
    if (filters.completed === false) return 'active';
    return 'all';
  };

  const getCurrentSortValue = () => {
    return `${filters.sort || 'created_at'}-${filters.order || 'desc'}`;
  };

  // Icon animation variants
  const iconVariants = {
    rest: { rotate: 0, scale: 1 },
    hover: {
      rotate: prefersReducedMotion ? 0 : 15,
      scale: prefersReducedMotion ? 1 : 1.1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={prefersReducedMotion ? undefined : fadeInUp}
      className="rounded-2xl p-6 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl"
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <motion.div
          className="flex items-center gap-3 group"
          initial="rest"
          whileHover="hover"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <motion.div variants={iconVariants}>
              <Filter className="w-5 h-5 text-white" />
            </motion.div>
          </div>
          <motion.select
            id="filter-status"
            value={getCurrentCompletedValue()}
            onChange={(e) => handleCompletedChange(e.target.value)}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="px-4 py-2.5 text-sm font-semibold border border-white/20
            bg-white/50 dark:bg-white/5 backdrop-blur text-foreground
            rounded-xl shadow-md hover:bg-white/70 dark:hover:bg-white/10
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </motion.select>
        </motion.div>

        {/* Sort Filter */}
        <motion.div
          className="flex items-center gap-3 group"
          initial="rest"
          whileHover="hover"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <motion.div variants={iconVariants}>
              <ArrowUpDown className="w-5 h-5 text-white" />
            </motion.div>
          </div>
          <motion.select
            id="sort-by"
            value={getCurrentSortValue()}
            onChange={(e) => handleSortChange(e.target.value)}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="px-4 py-2.5 text-sm font-semibold border border-white/20
            bg-white/50 dark:bg-white/5 backdrop-blur text-foreground
            rounded-xl shadow-md hover:bg-white/70 dark:hover:bg-white/10
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-all duration-200 cursor-pointer"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="updated_at-desc">Recently Updated</option>
            <option value="updated_at-asc">Least Recently Updated</option>
          </motion.select>
        </motion.div>
      </div>
    </motion.div>
  );
}

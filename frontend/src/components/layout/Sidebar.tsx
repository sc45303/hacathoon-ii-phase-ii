"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Inbox, Calendar, CalendarDays, LogOut, User } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { clearAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  navItemVariants,
  buttonVariants,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

interface SidebarProps {
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

export function Sidebar({ isCollapsed = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  // TODO: Replace with actual task counts from API
  const taskCounts = {
    inbox: 5,
    today: 3,
    upcoming: 8,
  };

  const navItems: NavItem[] = [
    {
      label: "Inbox",
      icon: Inbox,
      href: "/dashboard",
      badge: taskCounts.inbox,
    },
    {
      label: "Today",
      icon: Calendar,
      href: "/dashboard/today",
      badge: taskCounts.today,
    },
    {
      label: "Upcoming",
      icon: CalendarDays,
      href: "/dashboard/upcoming",
      badge: taskCounts.upcoming,
    },
  ];

  const handleSignOut = () => {
    clearAuthSession();
    router.push("/auth/signin");
  };

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200",
        isCollapsed ? "w-16" : "w-[280px]"
      )}
    >
      {/* Navigation Items */}
      <motion.nav
        className="flex-1 px-3 py-6 space-y-1"
        initial="hidden"
        animate="visible"
        variants={prefersReducedMotion ? undefined : staggerContainer}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <motion.div
              key={item.href}
              variants={prefersReducedMotion ? undefined : staggerItem}
              custom={index}
            >
              <Link
                href={item.href}
                onClick={handleNavClick}
                className="block"
                aria-current={isActive ? "page" : undefined}
              >
                <motion.div
                  animate={isActive ? "active" : "inactive"}
                  variants={prefersReducedMotion ? undefined : navItemVariants}
                  whileHover={
                    prefersReducedMotion ? undefined : { scale: 1.01 }
                  }
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-gray-50 dark:hover:bg-gray-800",
                    isActive
                      ? "bg-gray-100 dark:bg-gray-800 text-indigo-500 font-semibold"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 leading-normal">
                        {item.label}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className={cn(
                            "px-2 py-0.5 text-[11px] font-semibold rounded-full tabular-nums leading-tight",
                            isActive
                              ? "bg-indigo-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          )}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        {!isCollapsed ? (
          <div className="space-y-2">
            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <motion.button
              onClick={handleSignOut}
              variants={prefersReducedMotion ? undefined : buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={handleSignOut}
            variants={prefersReducedMotion ? undefined : buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </aside>
  );
}

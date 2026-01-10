export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
}

export interface TaskUpdate {
  title: string;
  description?: string | null;
  completed: boolean;
}

export interface TaskPatch {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export interface ErrorResponse {
  detail: string;
  error_code?: string;
  field_errors?: Record<string, string[]>;
}

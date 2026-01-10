import { Task, TaskCreate, TaskUpdate, TaskPatch, TaskListResponse, ErrorResponse } from './types';
import { auth } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string,
    public fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get JWT token from auth session
  const session = await auth();
  const token = session?.token;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized - redirect to signin
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
    throw new APIError('Authentication required', 401);
  }

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
    }));

    throw new APIError(
      errorData.detail,
      response.status,
      errorData.error_code,
      errorData.field_errors
    );
  }

  return response.json();
}

// Task API functions
export interface TaskFilters {
  completed?: boolean | null;
  sort?: 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function getTasks(filters?: TaskFilters): Promise<TaskListResponse> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.completed !== undefined && filters.completed !== null) {
      params.append('completed', String(filters.completed));
    }
    if (filters.sort) {
      params.append('sort', filters.sort);
    }
    if (filters.order) {
      params.append('order', filters.order);
    }
    if (filters.limit) {
      params.append('limit', String(filters.limit));
    }
    if (filters.offset) {
      params.append('offset', String(filters.offset));
    }
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/api/tasks?${queryString}` : '/api/tasks';

  return fetchAPI<TaskListResponse>(endpoint);
}

export async function createTask(taskData: TaskCreate): Promise<Task> {
  return fetchAPI<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(taskId: number, taskData: TaskUpdate): Promise<Task> {
  return fetchAPI<Task>(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
}

export async function patchTask(taskId: number, taskData: TaskPatch): Promise<Task> {
  return fetchAPI<Task>(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(taskData),
  });
}

export async function deleteTask(taskId: number): Promise<void> {
  await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => {
    if (!response.ok) {
      throw new APIError('Failed to delete task', response.status);
    }
  });
}

export { APIError };
export type { Task, TaskCreate, TaskUpdate, TaskPatch, TaskListResponse };

import apiClient from "./apiClient";
import { TASK_ENDPOINTS } from "./endpoints";
import type { ApiResponse, Task, TaskRequest } from "@/types";

// api for tasks
class TaskService {
  async getTasks(): Promise<Task[]> {
    const res = await apiClient.get<ApiResponse<Task[]>>(TASK_ENDPOINTS.LIST);
    if (res.status === 200) {
      return res.data.data;
    } else {
      throw new Error(res.data.message);
    }
  }

  async createTask(task: TaskRequest): Promise<Task> {
    const res = await apiClient.post<ApiResponse<Task>>(
      TASK_ENDPOINTS.CREATE,
      task
    );
    if (res.status === 200) {
      return res.data.data;
    } else {
      throw new Error(res.data.message);
    }
  }

  async changeTaskStatus(id: number, status: string): Promise<Task> {
    const res = await apiClient.put<ApiResponse<Task>>(
      TASK_ENDPOINTS.CHANGE_STATUS(id),
      { status }
    );
    if (res.status === 200) {
      return res.data.data;
    } else {
      throw new Error(res.data.message);
    }
  }

  async updateTaskStatus(id: number, status: string): Promise<Task> {
    // Convert string id to number if the API expects a number
    return this.changeTaskStatus(id, status);
  }
}

export default new TaskService();

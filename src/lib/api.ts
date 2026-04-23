import type { LoginRequest, LoginResponse, User, Student, Dorm, Room, Assignment, RoomAssignment, RoomChangeRequest, MaintenanceRequest, FurnitureItem, LinenRecord, KeyRecord, Notification, AuditLog, DashboardSummary } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://odu-dms2.onrender.com';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp?: string;
}

export interface SystemSettings {
  systemName: string;
  adminEmail: string;
  sessionTimeout: number;
  allowStudentRoomChange: boolean;
  requireApprovalForMaintenance: boolean;
  maxRoomChangeRequestsPerStudent: number;
  notificationsEnabled: boolean;
  maintenanceAutoAssign: boolean;
  theme: string;
  language: string;
}

class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    const storedToken = localStorage.getItem('dms_token');
    const storedRefresh = localStorage.getItem('dms_refresh_token');
    if (storedToken) this.token = storedToken;
    if (storedRefresh) this.refreshToken = storedRefresh;
  }

  private getHeaders(withAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (withAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}`,
        code: errorData.code || `HTTP_${response.status}`,
        timestamp: new Date().toISOString(),
      };
    }
    const json = await response.json().catch(() => null);
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return { success: true, data: json.data };
    }
    return { success: true, data: json };
  }

  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await this.handleResponse<LoginResponse>(response);
      if (result.success && result.data) {
        this.token = result.data.token;
        this.refreshToken = result.data.refreshToken;
        localStorage.setItem('dms_token', result.data.token);
        localStorage.setItem('dms_refresh_token', result.data.refreshToken);
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Network error', code: 'NETWORK_ERROR' };
    }
  }

  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const result = await this.handleResponse<{ success: boolean }>(response);
      if (result.success) {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('dms_token');
        localStorage.removeItem('dms_refresh_token');
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Network error', code: 'NETWORK_ERROR' };
    }
  }

  async validateSession(): Promise<ApiResponse<{ valid: boolean; role: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-session`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse<{ valid: boolean; role: string }>(response);
    } catch (error) {
      return { success: false, error: 'Network error', code: 'NETWORK_ERROR' };
    }
  }

  async forgotPassword(identifier: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async registerStudent(data: any): Promise<ApiResponse<{ message: string; user: any; student: any }>> {
    return this.fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Student endpoints
  async getStudentProfile(): Promise<ApiResponse<Student>> {
    return this.fetch(`${API_BASE_URL}/student/profile`);
  }

  async getStudentAssignment(): Promise<ApiResponse<RoomAssignment>> {
    return this.fetch(`${API_BASE_URL}/student/assignment`);
  }

  async getStudentMaintenanceRequests(limit: number = 10, offset: number = 0): Promise<ApiResponse<{ requests: MaintenanceRequest[]; total: number }>> {
    return this.fetch(`${API_BASE_URL}/student/maintenance-requests?limit=${limit}&offset=${offset}`);
  }

  async getStudents(params?: { department?: string; year?: number; search?: string }): Promise<ApiResponse<{ users: Student[]; total: number }>> {
    const query = new URLSearchParams({ role: 'student', ...params } as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/users${query ? `?${query}` : ''}`);
  }

  async updateStudent(studentId: string, data: Partial<Student>): Promise<ApiResponse<Student>> {
    return this.fetch(`${API_BASE_URL}/users/${studentId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteStudent(studentId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/users/${studentId}/deactivate`, { method: 'POST' });
  }

  // Dorm endpoints
  async getDorms(): Promise<ApiResponse<{ buildings: Dorm[] }>> {
    return this.fetch(`${API_BASE_URL}/dorms`);
  }

  async createDorm(data: Partial<Dorm>): Promise<ApiResponse<Dorm>> {
    return this.fetch(`${API_BASE_URL}/dorms`, { method: 'POST', body: JSON.stringify(data) });
  }

  async addDormFloor(dormId: string, floorNumber: number): Promise<ApiResponse<void>> {
    return this.fetch(`${API_BASE_URL}/dorms/${dormId}/floors`, { method: 'POST', body: JSON.stringify({ floorNumber }) });
  }

  // Room endpoints
  async getRooms(params?: { building?: string; floor?: number; status?: string; gender?: string }): Promise<ApiResponse<{ rooms: Room[] }>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/rooms${query ? `?${query}` : ''}`);
  }

  async getRoom(roomId: string): Promise<ApiResponse<Room>> {
    return this.fetch(`${API_BASE_URL}/rooms/${roomId}`);
  }

  async createRoom(data: Partial<Room>): Promise<ApiResponse<Room>> {
    return this.fetch(`${API_BASE_URL}/rooms`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateRoom(roomId: string, data: Partial<Room>): Promise<ApiResponse<Room>> {
    return this.fetch(`${API_BASE_URL}/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async getRoomOccupants(roomId: string): Promise<ApiResponse<{ students: Student[] }>> {
    return this.fetch(`${API_BASE_URL}/rooms/${roomId}/occupants`);
  }

  async getAvailableRooms(params?: { building?: string; gender?: string; type?: string }): Promise<ApiResponse<{ rooms: Room[] }>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/rooms/available${query ? `?${query}` : ''}`);
  }

  // Allocation endpoints
  async getEligibleStudents(params: { gender?: string; year?: number; department?: string; previewOnly?: boolean }): Promise<ApiResponse<{ students: Student[]; totalBedsAvailable: number }>> {
    return this.fetch(`${API_BASE_URL}/allocation/eligible-students`, { method: 'POST', body: JSON.stringify(params) });
  }

  async runAutomaticAllocation(params: { gender?: string; year?: number; department?: string; previewOnly?: boolean }): Promise<ApiResponse<{ assigned: Assignment[]; unassigned: Student[]; summary: { totalAssigned: number; totalUnassigned: number; reason?: string } }>> {
    return this.fetch(`${API_BASE_URL}/allocation/automatic`, { method: 'POST', body: JSON.stringify(params) });
  }

  async manualAllocation(studentId: string, roomId: string): Promise<ApiResponse<Assignment>> {
    return this.fetch(`${API_BASE_URL}/allocation/manual`, { method: 'POST', body: JSON.stringify({ studentId, roomId }) });
  }

  async getUnassignedStudents(): Promise<ApiResponse<{ students: Student[] }>> {
    return this.fetch(`${API_BASE_URL}/students/unassigned`);
  }

  async vacateAssignment(assignmentId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/assignments/${assignmentId}/vacate`, { method: 'DELETE' });
  }

  // Room change endpoints
  async getMyRoomChangeRequests(): Promise<ApiResponse<{ requests: RoomChangeRequest[] }>> {
    return this.fetch(`${API_BASE_URL}/room-change-requests`);
  }

  async submitRoomChangeRequest(data: { reason: string; description: string }): Promise<ApiResponse<RoomChangeRequest>> {
    return this.fetch(`${API_BASE_URL}/room-change-requests`, { method: 'POST', body: JSON.stringify(data) });
  }

  async getPendingRoomChangeRequests(): Promise<ApiResponse<{ requests: RoomChangeRequest[] }>> {
    return this.fetch(`${API_BASE_URL}/room-change-requests/pending`);
  }

  async approveRoomChange(requestId: string, newRoomId: string): Promise<ApiResponse<Assignment>> {
    return this.fetch(`${API_BASE_URL}/room-change-requests/${requestId}/approve`, { method: 'PUT', body: JSON.stringify({ newRoomId }) });
  }

  async rejectRoomChange(requestId: string, rejectionReason: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/room-change-requests/${requestId}/reject`, { method: 'PUT', body: JSON.stringify({ rejectionReason }) });
  }

  // Maintenance endpoints
  async submitMaintenanceRequest(data: { roomId: string; category: string; description: string; priority: string; image?: File }): Promise<ApiResponse<MaintenanceRequest>> {
    const formData = new FormData();
    formData.append('roomId', data.roomId);
    formData.append('category', data.category);
    formData.append('description', data.description);
    formData.append('priority', data.priority);
    if (data.image) formData.append('image', data.image);

    const headers = this.getHeaders();
    delete headers['Content-Type']; // Let browser set multipart/form-data

    return this.fetch(`${API_BASE_URL}/maintenance-requests`, { method: 'POST', body: formData, headers });
  }

  async getMaintenanceRequests(params?: { status?: string; building?: string; priority?: string }): Promise<ApiResponse<{ requests: MaintenanceRequest[] }>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/maintenance-requests${query ? `?${query}` : ''}`);
  }

  async getMyMaintenanceTasks(): Promise<ApiResponse<{ tasks: MaintenanceRequest[] }>> {
    return this.fetch(`${API_BASE_URL}/maintenance-requests/assigned`);
  }

  async updateMaintenanceStatus(requestId: string, status: string, resolutionNotes?: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/maintenance-requests/${requestId}/status`, { method: 'PUT', body: JSON.stringify({ status, resolutionNotes }) });
  }

  async addMaintenanceNote(requestId: string, note: string, isInternal: boolean = false): Promise<ApiResponse<{ note: unknown }>> {
    return this.fetch(`${API_BASE_URL}/maintenance-requests/${requestId}/notes`, { method: 'POST', body: JSON.stringify({ note, isInternal }) });
  }

  async reassignMaintenance(requestId: string, staffId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/maintenance-requests/${requestId}/reassign`, { method: 'PUT', body: JSON.stringify({ staffId }) });
  }

  // Inventory endpoints
  async getRoomFurniture(roomId: string): Promise<ApiResponse<{ items: FurnitureItem[] }>> {
    return this.fetch(`${API_BASE_URL}/inventory/furniture/room/${roomId}`);
  }

  async addFurnitureItem(data: { roomId: string; itemName: string; quantity: number; condition: string }): Promise<ApiResponse<FurnitureItem>> {
    return this.fetch(`${API_BASE_URL}/inventory/furniture`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateFurnitureItem(itemId: string, data: { quantity?: number; condition?: string }): Promise<ApiResponse<FurnitureItem>> {
    return this.fetch(`${API_BASE_URL}/inventory/furniture/${itemId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async issueLinen(data: { studentId: string; items: string[]; dateIssued: string }): Promise<ApiResponse<LinenRecord>> {
    return this.fetch(`${API_BASE_URL}/inventory/linen/issue`, { method: 'POST', body: JSON.stringify(data) });
  }

  async returnLinen(recordId: string, itemsReturned: string[], damages?: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/inventory/linen/return`, { method: 'POST', body: JSON.stringify({ recordId, itemsReturned, damages }) });
  }

  async issueKey(data: { studentId: string; roomId: string; keyCode: string }): Promise<ApiResponse<KeyRecord>> {
    return this.fetch(`${API_BASE_URL}/inventory/keys/issue`, { method: 'POST', body: JSON.stringify(data) });
  }

  async returnKey(recordId: string, condition: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/inventory/keys/return`, { method: 'POST', body: JSON.stringify({ recordId, condition }) });
  }

  async getMissingKeys(): Promise<ApiResponse<{ missingKeys: KeyRecord[] }>> {
    return this.fetch(`${API_BASE_URL}/inventory/keys/missing`);
  }

  // Report endpoints
  async getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
    return this.fetch(`${API_BASE_URL}/reports/dashboard-summary`);
  }

  async getOccupancyReport(params?: { startDate?: string; endDate?: string; building?: string; floor?: number }): Promise<ApiResponse<unknown>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/reports/occupancy${query ? `?${query}` : ''}`);
  }

  async getStudentDirectoryReport(params?: { department?: string; year?: number; building?: string }): Promise<ApiResponse<{ students: Student[] }>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/reports/student-directory${query ? `?${query}` : ''}`);
  }

  async getMaintenanceSummary(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<unknown>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/reports/maintenance-summary${query ? `?${query}` : ''}`);
  }

  async getRoomUtilization(): Promise<ApiResponse<{ rooms: Array<Record<string, unknown>> }>> {
    return this.fetch(`${API_BASE_URL}/reports/room-utilization`);
  }

  async getUnassignedStudentsReport(): Promise<ApiResponse<{ students: Student[] }>> {
    return this.fetch(`${API_BASE_URL}/reports/unassigned-students`);
  }

  async getInventoryConditionReport(): Promise<ApiResponse<{ byCondition: { condition: string; count: number }[] }>> {
    return this.fetch(`${API_BASE_URL}/reports/inventory-condition`);
  }

  async exportReport(reportType: string, format: string, filters: Record<string, unknown> = {}): Promise<ApiResponse<{ fileUrl: string; expiresAt: string }>> {
    return this.fetch(`${API_BASE_URL}/reports/export`, { method: 'POST', body: JSON.stringify({ reportType, format, filters }) });
  }

  // User management endpoints
  async getUsers(params?: { role?: string; status?: string; search?: string }): Promise<ApiResponse<{ users: User[]; total: number }>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/users${query ? `?${query}` : ''}`);
  }

  async createUser(data: { fullName: string; email: string; role: string; studentId?: string; tempPassword?: boolean }): Promise<ApiResponse<User & { password?: string }>> {
    return this.fetch(`${API_BASE_URL}/users`, { method: 'POST', body: JSON.stringify(data) });
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.fetch(`${API_BASE_URL}/users/${userId}`);
  }

  async updateUser(userId: string, data: Partial<User> | Record<string, unknown>): Promise<ApiResponse<User>> {
    return this.fetch(`${API_BASE_URL}/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deactivateUser(userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/users/${userId}/deactivate`, { method: 'POST' });
  }

  async reactivateUser(userId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/users/${userId}/reactivate`, { method: 'POST' });
  }

  async resetUserPassword(userId: string): Promise<ApiResponse<{ success: boolean; message: string; password?: string }>> {
    return this.fetch(`${API_BASE_URL}/users/${userId}/reset-password`, { method: 'POST' });
  }

  async getRolePermissions(): Promise<ApiResponse<{ roles: { role: string; permissions: string[] }[] }>> {
    return this.fetch(`${API_BASE_URL}/roles/permissions`);
  }

  // Notification endpoints
  async getNotifications(params?: { limit?: number; offset?: number; unreadOnly?: boolean }): Promise<ApiResponse<{ notifications: Notification[]; total: number }>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/notifications${query ? `?${query}` : ''}`);
  }

  async getUnreadNotificationCount(): Promise<ApiResponse<{ count: number }>> {
    return this.fetch(`${API_BASE_URL}/notifications/unread-count`);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, { method: 'PUT' });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/notifications/read-all`, { method: 'PUT' });
  }

  async broadcastNotification(data: { title: string; message: string; target: string; targetId?: string; attachmentUrl?: string | null }): Promise<ApiResponse<{ success: boolean }>> {
    return this.fetch(`${API_BASE_URL}/notifications/broadcast`, { method: 'POST', body: JSON.stringify(data) });
  }

  // Audit log endpoints
  async getAuditLogs(params?: { startDate?: string; endDate?: string; user?: string; action?: string; entity?: string; page?: number; limit?: number }): Promise<ApiResponse<{ logs: AuditLog[]; total: number; page: number; totalPages: number }>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/audit-logs${query ? `?${query}` : ''}`);
  }

  async exportAuditLogs(params?: { startDate?: string; endDate?: string; user?: string; action?: string }): Promise<ApiResponse<{ fileUrl: string; expiresAt: string }>> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.fetch(`${API_BASE_URL}/audit-logs/export${query ? `?${query}` : ''}`);
  }

  async getSettings(): Promise<ApiResponse<SystemSettings>> {
    return this.fetch(`${API_BASE_URL}/settings`);
  }

  async saveSettings(settings: SystemSettings): Promise<ApiResponse<SystemSettings>> {
    return this.fetch(`${API_BASE_URL}/settings`, { method: 'PUT', body: JSON.stringify(settings) });
  }

  // Generic fetch helper
  private async fetch<T = unknown>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      let response = await fetch(url, {
        ...options,
        headers: { ...this.getHeaders(), ...options.headers },
      });

      if (response.status === 401 && this.refreshToken && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: this.refreshToken })
        }).catch(() => null);

        if (refreshResponse && refreshResponse.ok) {
          const refreshData = await refreshResponse.json().catch(() => null);
          if (refreshData?.token || refreshData?.data?.token) {
            const newToken = refreshData.token || refreshData.data.token;
            this.token = newToken;
            localStorage.setItem('dms_token', newToken);
            
            const newRefreshToken = refreshData.refreshToken || refreshData.data?.refreshToken;
            if (newRefreshToken) {
              this.refreshToken = newRefreshToken;
              localStorage.setItem('dms_refresh_token', newRefreshToken);
            }
            
            response = await fetch(url, {
              ...options,
              headers: { ...this.getHeaders(), ...options.headers },
            });
          } else {
            this.clearAuth();
            window.location.href = '/login';
          }
        } else {
          this.clearAuth();
          window.location.href = '/login';
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      return { success: false, error: 'Network error', code: 'NETWORK_ERROR' };
    }
  }

  clearAuth(): void {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('dms_token');
    localStorage.removeItem('dms_refresh_token');
  }
}

export const apiService = new ApiService();

import { User, UserInput, UsersResponse } from '../types/user';

const API_BASE_URL = 'http://localhost:5000/api/users';

export class UserApi {
  static async getUsers(params: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<UsersResponse> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}?${query.toString()}`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Помилка при завантаженні користувачів');
    }
    return response.json();
  }

  static async getUserById(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Помилка при завантаженні даних користувача');
    }
    return response.json();
  }

  static async createUser(user: UserInput): Promise<User> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (errData.status === 'validation_error' && errData.errors) {
        const errorMsgs = errData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        throw new Error(`Помилка валідації: ${errorMsgs}`);
      }
      throw new Error(errData.message || 'Помилка при створенні користувача');
    }

    const data = await response.json();
    return data.user;
  }

  static async updateUser(id: number, user: Partial<UserInput>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (errData.status === 'validation_error' && errData.errors) {
        const errorMsgs = errData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        throw new Error(`Помилка валідації: ${errorMsgs}`);
      }
      throw new Error(errData.message || 'Помилка при оновленні користувача');
    }

    const data = await response.json();
    return data.user;
  }

  static async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Помилка при видаленні користувача');
    }
  }
}

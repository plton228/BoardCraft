export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationMeta;
}

export interface ApiError {
  status: string;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

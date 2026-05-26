import { User, PaginationMeta } from '../types/user';

export interface UserState {
  data: {
    users: User[];
    selectedUser: User | null;
    pagination: PaginationMeta;
  };
  ui: {
    search: string;
    page: number;
  };
  status: {
    loading: boolean;
    error: string | null;
    success: boolean;
  };
}

export type UserAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { users: User[]; pagination: PaginationMeta } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_SELECTED_USER'; payload: User | null }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_FILTERS' }
  | { type: 'ACTION_START' }
  | { type: 'ACTION_SUCCESS' }
  | { type: 'ACTION_ERROR'; payload: string };

export const initialState: UserState = {
  data: {
    users: [],
    selectedUser: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 4,
      totalPages: 1,
    },
  },
  ui: {
    search: '',
    page: 1,
  },
  status: {
    loading: false,
    error: null,
    success: false,
  },
};

export function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        status: { ...state.status, loading: true, error: null, success: false },
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        data: {
          ...state.data,
          users: action.payload.users,
          pagination: action.payload.pagination,
        },
        status: { ...state.status, loading: false, error: null, success: true },
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        status: { ...state.status, loading: false, error: action.payload, success: false },
      };
    case 'SET_SELECTED_USER':
      return {
        ...state,
        data: { ...state.data, selectedUser: action.payload },
      };
    case 'SET_SEARCH':
      return {
        ...state,
        ui: { ...state.ui, search: action.payload, page: 1 }, 
      };
    case 'SET_PAGE':
      return {
        ...state,
        ui: { ...state.ui, page: action.payload },
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        ui: { search: '', page: 1 },
        data: { ...state.data, selectedUser: null },
      };
    case 'ACTION_START':
      return {
        ...state,
        status: { ...state.status, loading: true, error: null, success: false },
      };
    case 'ACTION_SUCCESS':
      return {
        ...state,
        status: { ...state.status, loading: false, error: null, success: true },
      };
    case 'ACTION_ERROR':
      return {
        ...state,
        status: { ...state.status, loading: false, error: action.payload, success: false },
      };
    default:
      return state;
  }
}

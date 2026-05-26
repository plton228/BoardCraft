import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserInput, PaginationMeta } from '../types/user';
import { UserApi } from '../api/userApi';

interface UserSliceState {
  users: User[];
  selectedUser: User | null;
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: UserSliceState = {
  users: [],
  selectedUser: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 4,
    totalPages: 1,
  },
  loading: false,
  error: null,
  success: false,
};


export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { search: string; page: number }, { rejectWithValue }) => {
    try {
      return await UserApi.getUsers({
        search: params.search,
        page: params.page,
        limit: 4,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    } catch (err: any) {
      return rejectWithValue(err.message || 'Помилка при отриманні списку');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (user: UserInput, { dispatch, getState, rejectWithValue }) => {
    try {
      const newUser = await UserApi.createUser(user);
      
      const state = getState() as any;
      dispatch(fetchUsers({ search: state.ui.search, page: state.ui.page }));
      return newUser;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Помилка при створенні користувача');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (
    { id, user }: { id: number; user: Partial<UserInput> },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      const updated = await UserApi.updateUser(id, user);
      
      const state = getState() as any;
      dispatch(fetchUsers({ search: state.ui.search, page: state.ui.page }));
      return updated;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Помилка при оновленні користувача');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: number, { dispatch, getState, rejectWithValue }) => {
    try {
      if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
        await UserApi.deleteUser(id);
        
        const state = getState() as any;
        dispatch(fetchUsers({ search: state.ui.search, page: state.ui.page }));
        return id;
      }
      return rejectWithValue('Видалення скасовано');
    } catch (err: any) {
      return rejectWithValue(err.message || 'Помилка при видаленні користувача');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false;
        state.selectedUser = null; 
        state.success = true;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        
        if (action.payload !== 'Видалення скасовано') {
          state.error = action.payload as string;
        }
      });
  },
});

export const { setSelectedUser, clearError } = userSlice.actions;
export default userSlice.reducer;

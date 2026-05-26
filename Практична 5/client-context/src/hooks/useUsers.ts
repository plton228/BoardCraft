import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { UserApi } from '../api/userApi';
import { UserInput, User } from '../types/user';

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }

  const { state, dispatch } = context;

  const fetchUsers = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await UserApi.getUsers({
        search: state.ui.search,
        page: state.ui.page,
        limit: 4,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { users: data.users, pagination: data.pagination },
      });
    } catch (err: any) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Помилка завантаження' });
    }
  };

  const createUser = async (userInput: UserInput) => {
    dispatch({ type: 'ACTION_START' });
    try {
      await UserApi.createUser(userInput);
      dispatch({ type: 'ACTION_SUCCESS' });
      await fetchUsers(); 
    } catch (err: any) {
      dispatch({ type: 'ACTION_ERROR', payload: err.message || 'Помилка створення' });
      throw err;
    }
  };

  const updateUser = async (id: number, userInput: Partial<UserInput>) => {
    dispatch({ type: 'ACTION_START' });
    try {
      await UserApi.updateUser(id, userInput);
      dispatch({ type: 'ACTION_SUCCESS' });
      dispatch({ type: 'SET_SELECTED_USER', payload: null });
      await fetchUsers(); 
    } catch (err: any) {
      dispatch({ type: 'ACTION_ERROR', payload: err.message || 'Помилка оновлення' });
      throw err;
    }
  };

  const deleteUser = async (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      dispatch({ type: 'ACTION_START' });
      try {
        await UserApi.deleteUser(id);
        dispatch({ type: 'ACTION_SUCCESS' });
        await fetchUsers(); 
      } catch (err: any) {
        dispatch({ type: 'ACTION_ERROR', payload: err.message || 'Помилка видалення' });
        alert(err.message || 'Помилка при видаленні');
      }
    }
  };

  const setSelectedUser = (user: User | null) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: user });
  };

  const setSearch = (search: string) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  };

  const setPage = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  return {
    
    users: state.data.users,
    selectedUser: state.data.selectedUser,
    pagination: state.data.pagination,
    search: state.ui.search,
    page: state.ui.page,
    loading: state.status.loading,
    error: state.status.error,
    success: state.status.success,
    
    
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    setSelectedUser,
    setSearch,
    setPage,
    resetFilters,
  };
};

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  search: string;
  page: number;
}

const LOCAL_STORAGE_SEARCH_KEY = 'user_mgmt_search';
const LOCAL_STORAGE_PAGE_KEY = 'user_mgmt_page';

const savedSearch = localStorage.getItem(LOCAL_STORAGE_SEARCH_KEY) || '';
const savedPage = localStorage.getItem(LOCAL_STORAGE_PAGE_KEY);
const initialPage = savedPage ? parseInt(savedPage, 10) : 1;

const initialState: UiState = {
  search: savedSearch,
  page: initialPage,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1; 
      localStorage.setItem(LOCAL_STORAGE_SEARCH_KEY, action.payload);
      localStorage.setItem(LOCAL_STORAGE_PAGE_KEY, '1');
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
      localStorage.setItem(LOCAL_STORAGE_PAGE_KEY, action.payload.toString());
    },
    resetFilters(state) {
      state.search = '';
      state.page = 1;
      localStorage.removeItem(LOCAL_STORAGE_SEARCH_KEY);
      localStorage.setItem(LOCAL_STORAGE_PAGE_KEY, '1');
    },
  },
});

export const { setSearch, setPage, resetFilters } = uiSlice.actions;
export default uiSlice.reducer;

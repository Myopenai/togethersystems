import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  direction: 'ltr' | 'rtl';
  language: string;
}

// Get initial theme mode from localStorage or system preference
const getInitialThemeMode = (): ThemeMode => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  
  // Check system preference
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
};

// Get initial language from localStorage or browser
const getInitialLanguage = (): string => {
  return localStorage.getItem('language') || navigator.language.split('-')[0] || 'en';
};

const initialState: ThemeState = {
  mode: getInitialThemeMode(),
  direction: 'ltr',
  language: getInitialLanguage(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newMode;
      localStorage.setItem('theme', newMode);
      
      // Update HTML class for dark/light mode
      document.documentElement.classList.toggle('dark', newMode === 'dark');
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.classList.toggle('dark', action.payload === 'dark');
    },
    toggleDirection: (state) => {
      state.direction = state.direction === 'ltr' ? 'rtl' : 'ltr';
      document.documentElement.dir = state.direction;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
  },
});

export const { toggleTheme, setTheme, toggleDirection, setLanguage } = themeSlice.actions;

export const selectThemeMode = (state: RootState) => state.theme.mode;
export const selectThemeDirection = (state: RootState) => state.theme.direction;
export const selectLanguage = (state: RootState) => state.theme.language;

export default themeSlice.reducer;

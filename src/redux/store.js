import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tasksReducer from './tasksSlice';
import userReducer from './userSlice';
const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    user: userReducer,
    auth: authReducer,
  },
});

export default store;

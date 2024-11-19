import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  todo: [],
  inProcess: [],
  done: [],
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.todo = action.payload.todo;
      state.inProcess = action.payload.inProcess;
      state.done = action.payload.done;
    },
    addTask: (state, action) => {
      state.todo.push(action.payload);
    },
    deleteTask: (state, action) => {
      const { taskId, column } = action.payload;
      state[column] = state[column].filter((task) => task.id !== taskId);
    },
    updateTask: (state, action) => {
      const { taskId, column, title } = action.payload;
      const task = state[column].find((task) => task.id === taskId);
      if (task) {
        task.title = title;
      }
    },
    moveTask: (state, action) => {
      const { taskId, fromColumn, toColumn } = action.payload;
      const sourceTasks = state[fromColumn];
      const targetTasks = state[toColumn];
      const taskIndex = sourceTasks.findIndex((task) => task.id === taskId);
      const [movedTask] = sourceTasks.splice(taskIndex, 1);
      movedTask.status = toColumn;
      targetTasks.push(movedTask);
    },
  },
});

export const { setTasks, addTask, deleteTask, updateTask, moveTask } = tasksSlice.actions;

export default tasksSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  roleId: null,
  status: "idle",
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.roleId = action.payload.roleId;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.status = "idle";
      state.roleId = null;
      state.error = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;

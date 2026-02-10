import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api/api-service";

export const fetchMachineCategories = createAsyncThunk("machineCategories/fetchMachineCategories", async () => {
  const response = await api.get("/category/machine");
  return response.data;
});

const machineCategoriesSlice = createSlice({
  name: "machineCategories",
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachineCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMachineCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMachineCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default machineCategoriesSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api/api-service";

export const fetchMachines = createAsyncThunk("machines/fetchMachines", async () => {
  const response = await api.get("/machinery");
  return response.data;
});

const machinesSlice = createSlice({
  name: "machines",
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachines.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default machinesSlice.reducer;
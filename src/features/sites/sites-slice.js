import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api/api-service";

export const fetchSites = createAsyncThunk("sites/fetchSites", async () => {
  const response = await api.get("/sites");
  return response.data;
});

const sitesSlice = createSlice({
  name: "sites",
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSites.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default sitesSlice.reducer;

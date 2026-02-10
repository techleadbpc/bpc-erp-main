import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api/api-service";

export const fetchPrimaryCategories = createAsyncThunk("primaryCategories/fetchPrimaryCategories", async () => {
  const response = await api.get("/category/primary");
  return response.data;
});

const primaryCategoriesSlice = createSlice({
  name: "primaryCategories",
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrimaryCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrimaryCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPrimaryCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default primaryCategoriesSlice.reducer;

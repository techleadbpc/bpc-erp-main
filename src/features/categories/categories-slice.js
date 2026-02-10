import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api/api-service";

export const fetchCategories = createAsyncThunk("categories/fetchCategories", async () => {
  const response = await api.get("/category/primary");
  return response.data;
});

const categoriesSlice = createSlice({
  name: "categories",
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default categoriesSlice.reducer;

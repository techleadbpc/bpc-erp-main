import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api/api-service";

export const fetchItems = createAsyncThunk("items/fetchItems", async () => {
    const response = await api.get("/items");
    return response.data;
});

const itemsSlice = createSlice({
    name: "items",
    initialState: { data: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchItems.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchItems.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default itemsSlice.reducer;
